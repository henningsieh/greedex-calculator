#!/usr/bin/env bash
set -Eeuo pipefail

postgres_version=$(pg_lsclusters --no-header | awk 'NR == 1 { print $1 }')
: "${postgres_version:?PostgreSQL cluster was not installed.}"

pg_ctlcluster "$postgres_version" main start
runuser -u postgres -- psql -c "ALTER USER postgres PASSWORD 'test-password';"
runuser -u postgres -- createdb greendex_test

python3 -m aiosmtpd -n -l 127.0.0.1:587 >/tmp/test-smtp.log 2>&1 &
smtp_pid=$!
server_pid=""

cleanup() {
  if [[ -n "$server_pid" ]] && kill -0 "$server_pid" 2>/dev/null; then
    kill "$server_pid" 2>/dev/null || true
    wait "$server_pid" 2>/dev/null || true
  fi
  kill "$smtp_pid" 2>/dev/null || true
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
repeat() {
  local character="$1"
  local length="$2"
  printf "%*s" "$length" "" | tr " " "$character"
}

export BETTER_AUTH_SECRET=$(repeat x 32)
export GOOGLE_CLIENT_ID="$(repeat 0 12).apps.googleusercontent.com"
export GOOGLE_CLIENT_SECRET="GOCSPX$(repeat x 24)"
export DISCORD_CLIENT_ID=$(repeat 0 19)
export DISCORD_CLIENT_SECRET=$(repeat x 32)
export GITHUB_CLIENT_ID=$(repeat 0 20)
export GITHUB_CLIENT_SECRET=$(repeat x 40)
export SMTP_HOST="127.0.0.1"
export SMTP_PORT="587"
export SMTP_SENDER="test@invalid.example"
export SMTP_USERNAME="test"
export SMTP_PASSWORD=$(repeat x 32)
export SMTP_SECURE="false"

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
