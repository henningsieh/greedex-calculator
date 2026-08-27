#!/usr/bin/env bash
set -Eeuo pipefail

postgres_version=$(pg_lsclusters --no-header | awk 'NR == 1 { print $1 }')
: "${postgres_version:?PostgreSQL cluster was not installed.}"

pg_ctlcluster "$postgres_version" main start
runuser -u postgres -- psql -c "ALTER USER postgres PASSWORD 'test-password';"
runuser -u postgres -- createdb greendex_test

server_pid=""

cleanup() {
  if [[ -n "$server_pid" ]] && kill -0 "$server_pid" 2>/dev/null; then
    kill "$server_pid" 2>/dev/null || true
    wait "$server_pid" 2>/dev/null || true
  fi
  pg_ctlcluster "$postgres_version" main stop 2>/dev/null || true
  rm -f .env
}
trap cleanup EXIT

export DATABASE_URL="postgres://postgres:test-password@127.0.0.1:5432/greendex_test?sslmode=require&uselibpqcompat=true"
export NEXT_PUBLIC_BASE_URL="http://127.0.0.1:3000"
export NEXT_PUBLIC_SOCKET_URL="http://127.0.0.1:4000"
export NODE_ENV="test"
export PORT="3000"
export SOCKET_PORT="4000"
export ORPC_DEV_DELAY_MS="0"

# Every secret and external-service credential MUST be supplied by the build
# environment (Coolify build variables locally; the real .env when running
# locally). Fabricating dummies here would make the candidate tests behave
# differently from real deployments, which is not acceptable.
required_secrets=(
  BETTER_AUTH_SECRET
  GOOGLE_CLIENT_ID 
  GOOGLE_CLIENT_SECRET
  DISCORD_CLIENT_ID
  DISCORD_CLIENT_SECRET
  GITHUB_CLIENT_ID 
  GITHUB_CLIENT_SECRET
  SMTP_HOST
  SMTP_PORT
  SMTP_SENDER
  SMTP_USERNAME
  SMTP_PASSWORD
  SMTP_SECURE
)
missing_secrets=()
for key in "${required_secrets[@]}"; do
  # BuildKit mounts secrets as files under /run/secrets; fall back to the
  # process environment for builds that pass values as --build-arg instead.
  if [[ -f "/run/secrets/$key" ]]; then
    value=$(cat "/run/secrets/$key")
    export "$key=$value"
  elif [[ -z "${!key:-}" ]]; then
    missing_secrets+=("$key")
  fi
done
if ((${#missing_secrets[@]} > 0)); then
  echo "Missing required environment variables: ${missing_secrets[*]}" >&2
  echo "Mark them as Build Variables in Coolify or provide them via --build-arg." >&2
  exit 1
fi

# The existing Vitest global setup reads the root .env. This file exists only
# inside the disposable test stage and contains generated test configuration.
for key in \
  DATABASE_URL NEXT_PUBLIC_BASE_URL NEXT_PUBLIC_SOCKET_URL NODE_ENV PORT \
  SOCKET_PORT ORPC_DEV_DELAY_MS BETTER_AUTH_SECRET GOOGLE_CLIENT_ID \
  GOOGLE_CLIENT_SECRET DISCORD_CLIENT_ID DISCORD_CLIENT_SECRET GITHUB_CLIENT_ID \
  GITHUB_CLIENT_SECRET SMTP_HOST SMTP_PORT SMTP_SENDER SMTP_USERNAME \
  SMTP_PASSWORD SMTP_SECURE; do
  printf "%s=%s\n" "$key" "${!key}"
done > .env

pnpm --filter @greendex/database run db:migrate
pnpm --filter @greendex/calculator run db:seed
pnpm run build

(
  cd apps/calculator
  exec env NODE_ENV=production node node_modules/next/dist/bin/next start --hostname 127.0.0.1 --port 3000
) &
server_pid=$!

for attempt in $(seq 1 60); do
  if wget -q -O /dev/null http://127.0.0.1:3000/api/rpc/health; then
    break
  fi

  if ! kill -0 "$server_pid" 2>/dev/null; then
    wait "$server_pid"
  fi

  if [[ "$attempt" == "60" ]]; then
    echo "Candidate did not become ready within 60 seconds." >&2
    exit 1
  fi

  sleep 1
done

pnpm --filter @greendex/calculator run test:run
