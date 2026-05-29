# 하루보안 프론트엔드 프로젝트 컨벤션

## 프로젝트 개요

하루보안(HaruBoan) 프론트엔드 — 보안 뉴스레터 서비스의 웹 인터페이스.
Next.js 16 (App Router) + TypeScript + Tailwind CSS로 구현된 랜딩 페이지, 뉴스 피드, 대시보드, 구독/해지 페이지를 제공한다.

## TypeScript / Next.js 코딩 규칙

- 포맷터/린터: `ESLint` (설정은 `eslint.config.mjs` 참조)
- 타입 체크: `TypeScript` — 모든 컴포넌트 props에 타입 명시, `any` 사용 금지
- 문서화: JSDoc 한국어 주석 (WHY가 명확하지 않을 때만)
- 네이밍: 컴포넌트 PascalCase, 함수/변수 camelCase, 상수 UPPER_SNAKE_CASE
- 예외 처리: 광범위한 catch-all 금지, 구체 타입만 잡는다
- 로깅: `console.log` 디버그 출력 금지

## Claude 동작 규칙

- 응답 언어: 한국어
- 테스트 우선(TDD): 새 기능은 테스트 먼저 작성 후 구현
- Surgical changes: 요청 범위 밖 코드는 수정하지 않는다
- 위험 명령 실행 전 확인 필수: `rm -rf`, `git push --force` 등
- 커밋: Conventional Commits (`Feat:`, `Fix:`, `Refactor:`, `Docs:`, `Test:`, `Etc:`)
- 한 PR 한 주제

## 자주 쓰는 명령

```bash
npm ci              # 의존성 설치
npm run dev         # 개발 서버 실행 (localhost:3000)
npm run build       # 프로덕션 빌드 + 타입 체크
npm run lint        # ESLint 실행
```

## PR 전 체크리스트

- [ ] `npm run lint` 통과
- [ ] `npm run build` 타입 에러 없음
- [ ] 변경 범위 PR 설명에 명시
