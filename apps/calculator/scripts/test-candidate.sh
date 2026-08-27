#!/usr/bin/env bash
set -Eeuo pipefail

root_directory=$(cd "$(dirname "${BASH_SOURCE[0]}")/../../.." && pwd)
calculator_directory="$root_directory/apps/calculator"
# Port 3000 belongs exclusively to the promoted application and Coolify's
# health check. A test server must never make an unfinished candidate healthy.
candidate_port="3001"
health_url="http://127.0.0.1:${candidate_port}/api/rpc/health"
server_pid=""

# dotenv-cli loads the local root .env before this script runs. Coolify injects
# both values directly, so no .env file is required in the candidate container.
: "${RELEASE_TEST_DATABASE_URL:?Set RELEASE_TEST_DATABASE_URL for the candidate test database.}"

cleanup() {
  if [[ -n "$server_pid" ]] && kill -0 "$server_pid" 2>/dev/null; then
    kill "$server_pid" 2>/dev/null || true
    wait "$server_pid" 2>/dev/null || true
  fi
}
trap cleanup EXIT INT TERM

export DATABASE_URL="$RELEASE_TEST_DATABASE_URL"
export NEXT_PUBLIC_BASE_URL="http://127.0.0.1:${candidate_port}"
export NEXT_PUBLIC_SOCKET_URL="http://127.0.0.1:4000"
export PORT="$candidate_port"
export NODE_ENV="test"

cd "$root_directory"
pnpm --filter @greendex/database run db:migrate

(
  cd "$calculator_directory"
  exec env NODE_ENV=production node node_modules/next/dist/bin/next start --hostname 127.0.0.1 --port "$candidate_port"
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

# A stuck test must fail the candidate rather than leaving a health-checkable
# test server running indefinitely. The complete suite normally finishes in
# under a minute; five minutes leaves headroom for the candidate environment.
timeout --signal=TERM 5m pnpm --filter @greendex/calculator run test:run
