#!/usr/bin/env bash
# block-dangerous.sh — PreToolUse hook (matcher: Bash)
# 위험 패턴 매치 시 exit 2 로 명령 거부
set -euo pipefail

INPUT="$(cat)"
CMD="$(printf '%s' "$INPUT" | sed -n 's/.*"command"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/p')"

DANGEROUS_PATTERNS=(
  'rm[[:space:]]+-rf[[:space:]]+'
  'git[[:space:]]+push[[:space:]]+--force'
  'curl[[:space:]]+[^|]*\|[[:space:]]*sh'
)

for pattern in "${DANGEROUS_PATTERNS[@]}"; do
  if printf '%s' "$CMD" | grep -Eq "$pattern"; then
    echo "[block-dangerous] 차단됨: '$pattern' 매치" >&2
    exit 2
  fi
done

exit 0
