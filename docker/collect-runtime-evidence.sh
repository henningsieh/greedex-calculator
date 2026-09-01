#!/usr/bin/env bash
set -Eeuo pipefail

if (($# != 1)); then
  echo "Usage: $0 <container>" >&2
  exit 64
fi

readonly max_image_size_bytes=1100000000
readonly container="$1"
readonly container_id="$(docker inspect --format '{{.Id}}' "$container")"
readonly short_container_id="${container_id:0:12}"
readonly container_image_id="$(docker inspect --format '{{.Image}}' "$container")"
readonly image_reference="$(docker inspect --format '{{.Config.Image}}' "$container")"
readonly runtime_user="$(docker inspect --format '{{.Config.User}}' "$container")"
readonly health_status="$(docker inspect --format '{{if .State.Health}}{{.State.Health.Status}}{{else}}none{{end}}' "$container")"
readonly inspected_image_id="$(docker image inspect --format '{{.Id}}' "$container_image_id")"
readonly image_size_display="$(docker image ls --format '{{.Size}}' "$image_reference")"
readonly reference_image_id="$(docker image inspect --format '{{.Id}}' "$image_reference")"
readonly repository_digests="$(docker image inspect --format '{{join .RepoDigests "\n"}}' "$container_image_id")"

if [[ "$container_image_id" != "$inspected_image_id" || "$container_image_id" != "$reference_image_id" ]]; then
  echo "The selected container image ID does not match its inspected image reference." >&2
  exit 1
fi

case "$image_size_display" in
  *kB) image_size_number="${image_size_display%kB}"; image_size_multiplier=1000 ;;
  *MB) image_size_number="${image_size_display%MB}"; image_size_multiplier=1000000 ;;
  *GB) image_size_number="${image_size_display%GB}"; image_size_multiplier=1000000000 ;;
  *TB) image_size_number="${image_size_display%TB}"; image_size_multiplier=1000000000000 ;;
  *B) image_size_number="${image_size_display%B}"; image_size_multiplier=1 ;;
  *)
    echo "The selected runtime image did not report a Docker size." >&2
    exit 1
    ;;
esac

if [[ ! "$image_size_number" =~ ^[0-9]+([.][0-9]+)?$ ]]; then
  echo "The selected runtime image did not report a numeric size." >&2
  exit 1
fi
readonly image_size_bytes="$(
  awk -v size="$image_size_number" -v multiplier="$image_size_multiplier" \
    'BEGIN { printf "%.0f", size * multiplier }'
)"

if [[ "$image_reference" == *@sha256:* ]]; then
  repository_digest="$image_reference"
else
  repository="$image_reference"
  last_reference_segment="${repository##*/}"
  if [[ "$last_reference_segment" == *:* ]]; then
    repository="${repository%:*}"
  fi
  repository_digest="$(
    awk -v prefix="$repository@sha256:" \
      'index($0, prefix) == 1 { print; exit }' \
      <<< "$repository_digests"
  )"
fi
readonly repository_digest

if [[ -z "$repository_digest" || "$repository_digest" != *@sha256:* ]]; then
  echo "The selected image reference does not resolve to an immutable repository digest." >&2
  exit 1
fi

if [[ "$runtime_user" != "node" ]]; then
  echo "The selected image does not run as the expected unprivileged user." >&2
  exit 1
fi

terminal_event="$(
  docker logs "$container" 2>&1 \
    | grep -F '"event":"greendex.runtime-image-gate"' \
    | grep -F "\"container\":\"$short_container_id\"" \
    | grep -F '"phase":"terminal"' \
    | tail -n 1 \
    || true
)"

if [[ "$terminal_event" == *'"status":"passed"'* ]]; then
  gate_status="passed"
elif [[ "$terminal_event" == *'"status":"failed"'* ]]; then
  gate_status="failed"
else
  echo "No terminal runtime-image gate result matches the selected container." >&2
  exit 1
fi

printf '{"event":"greendex.runtime-image-evidence","container":"%s","imageReference":"%s","imageDigest":"%s","imageSizeBytes":%s,"maxImageSizeBytes":%s,"repositoryDigest":"%s","gateStatus":"%s","healthStatus":"%s","user":"%s"}\n' \
  "$container_id" \
  "$image_reference" \
  "$container_image_id" \
  "$image_size_bytes" \
  "$max_image_size_bytes" \
  "$repository_digest" \
  "$gate_status" \
  "$health_status" \
  "$runtime_user"

if ((image_size_bytes > max_image_size_bytes)); then
  echo "The selected runtime image exceeds the ${max_image_size_bytes}-byte size budget." >&2
  exit 1
fi

if [[ "$gate_status" != "passed" || "$health_status" != "healthy" ]]; then
  echo "The selected container has not passed both the runtime gate and health check." >&2
  exit 1
fi
