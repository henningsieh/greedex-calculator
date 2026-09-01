#!/usr/bin/env bash
set -Eeuo pipefail

readonly calculator_port="${PORT:-3000}"
readonly documentation_port=3001
runtime_pids=()

stop_services() {
  local signal="${1:-TERM}"
  local pid

  trap - INT TERM
  for pid in "${runtime_pids[@]}"; do
    kill "-$signal" "$pid" 2>/dev/null || true
  done
  for pid in "${runtime_pids[@]}"; do
    wait "$pid" 2>/dev/null || true
  done
  runtime_pids=()
}

shutdown() {
  stop_services "$1"
  exit 0
}

trap 'shutdown TERM' TERM
trap 'shutdown INT' INT

# Preserve migration-before-start without shipping pnpm, Turbo, or the full
# development dependency tree in the production image.
(
  cd /app/packages/database
  node node_modules/drizzle-kit/bin.cjs migrate
)

HOSTNAME=0.0.0.0 PORT="$calculator_port" \
  node /app/apps/calculator/server.js &
runtime_pids+=("$!")

HOSTNAME=0.0.0.0 PORT="$documentation_port" \
  node /app/apps/documentation/server.js &
runtime_pids+=("$!")

node /app/apps/calculator/socket-server.mjs &
runtime_pids+=("$!")

runtime_exit_code=0
wait -n "${runtime_pids[@]}" || runtime_exit_code=$?
if ((runtime_exit_code == 0)); then
  runtime_exit_code=1
fi

echo "A production runtime service exited; stopping the remaining topology." >&2
stop_services TERM
exit "$runtime_exit_code"
