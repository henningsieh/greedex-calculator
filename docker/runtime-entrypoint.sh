#!/usr/bin/env bash
set -Eeuo pipefail

readonly validation_port=3100
readonly documentation_port=3001
readonly container_id="$(hostname)"
readonly readiness_timeout_seconds="${RUNTIME_IMAGE_GATE_TIMEOUT_SECONDS:-120}"
readonly ready_file="${TMPDIR:-/tmp}/greendex-runtime-image-gate-ready"
readonly production_port="${PORT:-3000}"
readonly socket_port="${SOCKET_PORT:-4000}"

runtime_pid=""

log_gate_result() {
  local status="$1"
  local phase="$2"
  printf '{"event":"greendex.runtime-image-gate","container":"%s","status":"%s","phase":"%s"}\n' \
    "$container_id" "$status" "$phase"
}

remove_ready_file() {
  rm -f "$ready_file"
}

runtime_is_running() {
  [[ -n "$runtime_pid" ]] && kill -0 "$runtime_pid" 2>/dev/null
}

stop_runtime() {
  local signal="${1:-TERM}"
  local started_at=$SECONDS

  if ! runtime_is_running; then
    return 0
  fi

  kill "-$signal" -- "-$runtime_pid" 2>/dev/null || true
  while kill -0 -- "-$runtime_pid" 2>/dev/null; do
    if ((SECONDS - started_at >= readiness_timeout_seconds)); then
      kill -KILL -- "-$runtime_pid" 2>/dev/null || true
      wait "$runtime_pid" 2>/dev/null || true
      runtime_pid=""
      echo "Runtime process group did not terminate gracefully." >&2
      return 1
    fi
    sleep 0.1
  done

  wait "$runtime_pid" 2>/dev/null || true
  runtime_pid=""
}

shutdown() {
  local signal="$1"
  trap - INT TERM
  remove_ready_file
  stop_runtime "$signal" || true
  exit 0
}

fail_gate() {
  local exit_code="$1"
  trap - INT TERM
  remove_ready_file
  stop_runtime TERM || true
  log_gate_result "failed" "terminal"
  exit "$exit_code"
}

trap 'shutdown TERM' TERM
trap 'shutdown INT' INT
trap remove_ready_file EXIT

verify_runtime_identity_and_permissions() {
  if [[ "$(id -u)" == "0" ]]; then
    echo "The final runtime gate must run as an unprivileged user." >&2
    return 1
  fi

  local writable_directories=(
    "apps/calculator/.next"
    "apps/documentation/.next"
    "apps/documentation/.source"
  )
  local directory
  local permission_probe
  for directory in "${writable_directories[@]}"; do
    if [[ ! -d "$directory" || ! -w "$directory" ]]; then
      echo "Required runtime path is not writable: $directory" >&2
      return 1
    fi
    permission_probe="$directory/.runtime-image-gate-write-probe"
    : > "$permission_probe"
    rm -f "$permission_probe"
  done

  local read_only_paths=(
    "."
    "package.json"
    "apps/calculator/src"
    "docker/runtime-entrypoint.sh"
    "node_modules"
  )
  local read_only_path
  for read_only_path in "${read_only_paths[@]}"; do
    if [[ ! -e "$read_only_path" || -w "$read_only_path" ]]; then
      echo "Read-only runtime path is missing or writable: $read_only_path" >&2
      return 1
    fi
  done
}

start_runtime() {
  local calculator_port="$1"
  shift

  remove_ready_file
  setsid env \
    PORT="$calculator_port" \
    RUNTIME_IMAGE_GATE_FILE="$ready_file" \
    "$@" &
  runtime_pid=$!
}

wait_for_http() {
  local service="$1"
  local url="$2"
  local expected_prefix="${3:-}"
  local started_at=$SECONDS
  local response

  while true; do
    if ! runtime_is_running; then
      wait "$runtime_pid" 2>/dev/null || true
      runtime_pid=""
      echo "$service did not become ready because the runtime command exited." >&2
      return 1
    fi

    if response=$(curl --silent --show-error --fail "$url" 2>/dev/null); then
      if [[ -z "$expected_prefix" || "$response" == "$expected_prefix"* ]]; then
        return 0
      fi
    fi

    if ((SECONDS - started_at >= readiness_timeout_seconds)); then
      echo "$service did not become ready within the runtime gate timeout." >&2
      return 1
    fi
    sleep 1
  done
}

wait_for_runtime_topology() {
  local calculator_port="$1"

  wait_for_http \
    "Calculator" \
    "http://127.0.0.1:$calculator_port/" || return
  wait_for_http \
    "Documentation" \
    "http://127.0.0.1:$documentation_port/" || return
  wait_for_http \
    "Socket.IO" \
    "http://127.0.0.1:$socket_port/socket.io/?EIO=4&transport=polling" \
    "0" || return

  : > "$ready_file"
  wait_for_http \
    "Calculator health" \
    "http://127.0.0.1:$calculator_port/api/rpc/health" || return
}

run_gate() {
  if (($# == 0)); then
    echo "The final runtime command is required." >&2
    return 1
  fi

  verify_runtime_identity_and_permissions || return

  log_gate_result "running" "validation"
  start_runtime "$validation_port" "$@"
  wait_for_runtime_topology "$validation_port" || return
  remove_ready_file
  stop_runtime TERM || return

  log_gate_result "running" "production"
  start_runtime "$production_port" "$@"
  wait_for_runtime_topology "$production_port" || return
  log_gate_result "passed" "terminal"

  local runtime_exit_code=0
  wait "$runtime_pid" || runtime_exit_code=$?
  runtime_pid=""
  return "$runtime_exit_code"
}

if ! run_gate "$@"; then
  exit_code=$?
  # Negating the command for `if !` makes `$?` zero; retain a failing terminal
  # status for every gate error without printing command arguments or env values.
  if ((exit_code == 0)); then
    exit_code=1
  fi
  fail_gate "$exit_code"
fi
