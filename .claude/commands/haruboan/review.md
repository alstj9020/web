---
description: PR 올리기 전 self-review
---

1. `git diff origin/main...HEAD` 로 전체 변경 확인
2. `npm run lint` 실행
3. `npm run build` 로 타입 에러 확인
4. 변경된 코드에서 CLAUDE.md 컨벤션 위반이 있는지 점검
5. 발견된 이슈와 PR 요약 출력
