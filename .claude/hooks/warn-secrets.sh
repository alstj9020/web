#!/usr/bin/env bash
# warn-secrets.sh — UserPromptSubmit hook
# 시크릿 파일 경로 언급 시 경고 메시지를 컨텍스트에 주입
set -euo pipefail

INPUT="$(cat)"
PROMPT="$(printf '%s' "$INPUT" | sed -n 's/.*"prompt"[[:space:]]*:[[:space:]]*"\(.*\)".*/\1/p')"

SECRET_PATTERNS=('\.env' 'id_rsa' '\.pem$' 'credentials\.json' 'AWS_SECRET')

for pattern in "${SECRET_PATTERNS[@]}"; do
  if printf '%s' "$PROMPT" | grep -Eiq "$pattern"; then
    echo "[warn-secrets] 주의: 시크릿 파일 패턴('$pattern') 감지. 노출 전 확인하세요."
    break
  fi
done

exit 0
