# 하루보안 (HaruBoan) — 프론트엔드

매일 아침, 당신의 직군에 맞는 보안 뉴스를 이메일로 전달하는 뉴스레터 서비스의 웹 인터페이스입니다.

## 기술 스택

| 항목 | 선택 |
|------|------|
| 프레임워크 | Next.js 16 (App Router) |
| 언어 | TypeScript |
| 스타일링 | Tailwind CSS v4 |
| 패키지 관리 | npm |
| 배포 | AWS Amplify |

## 프로젝트 구조

```
src/
├── app/
│   ├── page.tsx                  # 랜딩 페이지
│   ├── news/page.tsx             # 뉴스 피드
│   ├── dashboard/page.tsx        # 보안 현황 대시보드
│   ├── unsubscribe/page.tsx      # 구독 해지
│   └── subscribe/confirm/page.tsx # 구독 완료
├── components/
│   ├── NavBar.tsx                # 고정 네비게이션 바
│   ├── sections/                 # 랜딩 페이지 섹션 컴포넌트
│   └── ui/                      # 공통 UI 컴포넌트 (Toast 등)
└── public/
    └── images/                  # SVG 에셋
```

## 시작하기

```bash
# 의존성 설치
npm ci

# 개발 서버 실행 (http://localhost:3000)
npm run dev

# 프로덕션 빌드 + 타입 체크
npm run build

# 린트
npm run lint
```

## 페이지 구성

| 경로 | 설명 |
|------|------|
| `/` | 랜딩 페이지 (Hero / Problem / Audience / How It Works / Email Preview / CTA) |
| `/news` | 뉴스 피드 — 직군별 필터, CVE 심각도 뱃지 |
| `/dashboard` | 보안 현황 대시보드 — 통계, CVE 분포, 최근 이슈 |
| `/unsubscribe` | 구독 해지 (`?email=` 파라미터) |
| `/subscribe/confirm` | 구독 완료 확인 |

## 개발 규칙

- 컴포넌트 단위 분리, `"use client"` 최소화
- 타입 명시 필수 (`any` 금지)
- 디자인 토큰 준수 (`#1e2235`, `#6bb8d4` 등 `globals.css` 변수 사용)
- 커밋 컨벤션: `Feat / Fix / Refactor / Docs / Test / Etc`

## 배포

AWS Amplify에 GitHub(`main` 브랜치) 자동 배포 연결.
빌드 설정은 `amplify.yml` 참조.
