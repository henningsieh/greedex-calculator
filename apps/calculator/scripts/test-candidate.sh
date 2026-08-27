#!/usr/bin/env bash
set -Eeuo pipefail

root_directory=$(cd "$(dirname "${BASH_SOURCE[0]}")/../../.." && pwd)
calculator_directory="$root_directory/apps/calculator"
health_url="http://127.0.0.1:3000/api/rpc/health"
server_pid=""

# dotenv-cli loads the local root .env before this script runs. Coolify injects
# both values directly, so no .env file is required in the candidate container.
: "${RELEASE_TEST_DATABASE_URL:=${DATABASE_URL:?Set RELEASE_TEST_DATABASE_URL for the candidate test database.}}"

cleanup() {
  if [[ -n "$server_pid" ]] && kill -0 "$server_pid" 2>/dev/null; then
    kill "$server_pid" 2>/dev/null || true
    wait "$server_pid" 2>/dev/null || true
  fi
}
trap cleanup EXIT INT TERM

export DATABASE_URL="$RELEASE_TEST_DATABASE_URL"
export NEXT_PUBLIC_BASE_URL="http://127.0.0.1:3000"
export NEXT_PUBLIC_SOCKET_URL="http://127.0.0.1:4000"
export NODE_ENV="test"

cd "$root_directory"
pnpm --filter @greendex/database run db:migrate

(
  cd "$calculator_directory"
  exec env NODE_ENV=production node node_modules/next/dist/bin/next start --hostname 127.0.0.1 --port 3000
) &
server_pid=$!

for attempt in $(seq 1 60); do
  if wget -q -O /dev/null "$health_url"; then
    break
  fi

  if ! kill -0 "$server_pid" 2>/dev/null; then
    wait "$server_pid"
  fi

  if [[ "$attempt" == "60" ]]; then
    echo "Candidate did not become ready at $health_url within 60 seconds." >&2
    exit 1
  fi

  sleep 1
done

pnpm --filter @greendex/calculator run test:run
