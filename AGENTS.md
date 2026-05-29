# AI 에이전트 가이드 — 하루보안 프론트엔드

이 파일은 Claude Code, Codex 등 AI 에이전트가 이 저장소에서 작업할 때 따라야 할 규칙입니다.

## 프로젝트 이해

- **목적**: 보안 뉴스레터 서비스(하루보안)의 Next.js 16 웹 프론트엔드
- **스택**: Next.js 16 App Router / TypeScript / Tailwind CSS v4
- **배포**: AWS Amplify (`amplify.yml` 참조)
- **상세 컨벤션**: `CLAUDE.md` 참조

## 코드 작성 규칙

### 필수 준수 사항

- 모든 컴포넌트 props에 TypeScript 타입 명시 (`any` 사용 금지)
- `"use client"` 지시어는 실제로 상태·이벤트가 필요한 컴포넌트에만 사용
- 디자인 토큰만 사용 (`globals.css`의 CSS 변수 또는 Figma 추출 hex 값)
- `console.log` 디버그 출력 금지
- 광범위한 `catch (e) {}` 금지 — 구체 타입만 처리

### 컴포넌트 패턴

```
src/components/sections/   # 페이지 단위 섹션 (HeroSection, CTASection 등)
src/components/ui/         # 재사용 UI 컴포넌트 (Toast 등)
src/app/**/page.tsx        # 라우트 페이지
```

### 디자인 토큰

```
--dark:    #1e2235   (배경 다크)
--white:   #f5f6f8   (배경 라이트)
--light:   #e8eaed   (카드 배경)
--primary: #6bb8d4   (주요 버튼·강조)
--accent:  #a8d8ea   (서브 텍스트)
--mid:     #3d4f6e   (본문 텍스트)
```

## 작업 절차

1. **변경 전**: 요청 범위 밖 코드는 절대 수정하지 않는다 (surgical changes)
2. **구현 중**: 타입 에러 없이 `npm run build` 통과하는 코드만 작성
3. **완료 후**: `npm run lint` → `npm run build` 순으로 검증

## 금지 행위

- `rm -rf` 실행
- `git push --force` 실행
- `any` 타입 사용
- 하드코딩 hex 값 (디자인 토큰 대신 임의 색상 사용)
- UI 라이브러리(MUI, Chakra 등) 임의 도입
- 요청하지 않은 기능 추가 또는 리팩터링

## 커밋 형식

```
Feat : 기능 구현
Fix : 버그 수정
Refactor : 코드 구조 변경
Docs : 문서 변경
Test : 테스트 추가
Etc : 기타
```
