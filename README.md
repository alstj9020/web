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
│   ├── subscribe/confirm/page.tsx # 구독 완료
│   └── api/
│       ├── subscribe/route.ts    # POST /api/subscribe
│       ├── unsubscribe/route.ts  # POST /api/unsubscribe
│       ├── news/route.ts         # GET /api/news
│       └── stats/route.ts        # GET /api/stats
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

## 구독 시스템

### API

| 엔드포인트 | 메서드 | 설명 |
|-----------|--------|------|
| `/api/subscribe` | POST | 구독 신청 — 이메일·직군·수신시간·관심주제 검증 후 200 반환 |
| `/api/unsubscribe` | POST | 구독 해지 — 이메일 검증 후 200 반환 |

현재 두 API는 **스텁** 상태입니다. `src/app/api/subscribe/route.ts`, `src/app/api/unsubscribe/route.ts` 내부에 DB 저장 및 이메일 발송 로직을 추가하면 프론트 변경 없이 연결됩니다.

### 구독 신청 폼 (CTASection)

1. **직군 선택** (일반인 / 개발자 / 보안직군) — 필수
2. **관심 주제 선택** — 직군별로 다른 5개 항목, 복수 선택 가능, 필수
3. **수신 시간 선택** (오전 8시 / 오후 12시 / 오후 6시)
4. **이메일 입력** 후 구독 버튼 클릭 → `/subscribe/confirm` 으로 이동

### 관심 주제 목록

> 현재 주제 항목은 임시로 채운 값입니다. 추후 확정된 내용으로 교체 필요.

| 직군 | 주제 |
|------|------|
| 일반인 | 개인정보 보호, 피싱·사기 예방, 랜섬웨어, 스마트폰 보안, 소셜미디어 보안 |
| 개발자 | 취약점/CVE, 웹 보안, 의존성·공급망 보안, 클라우드 보안, 인증·접근제어 |
| 보안직군 | 취약점/CVE, 위협 인텔리전스, 랜섬웨어·APT, 법규·컴플라이언스, 클라우드 보안 |

### 백엔드 연결 시 필요한 AWS 인프라

| 항목 | 서비스 |
|------|--------|
| 구독자 저장 | DynamoDB |
| 이메일 발송 | SES |
| 뉴스레터 스케줄 | Lambda + EventBridge |
| Amplify IAM 권한 | DynamoDB·SES 접근 허용 |

> **로컬 실행 시 뉴스 피드·대시보드 데이터 미표시**
> S3에서 데이터를 가져오기 때문에 AWS 자격증명이 필요합니다.
> 프로젝트 루트에 `.env.local`을 만들고 `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`를 설정하세요.

## 개발 규칙

- 컴포넌트 단위 분리, `"use client"` 최소화
- 타입 명시 필수 (`any` 금지)
- 디자인 토큰 준수 (`#1e2235`, `#6bb8d4` 등 `globals.css` 변수 사용)
- 커밋 컨벤션: `Feat / Fix / Refactor / Docs / Test / Etc`

## 배포

AWS Amplify에 GitHub(`main` 브랜치) 자동 배포 연결.
빌드 설정은 `amplify.yml` 참조.
