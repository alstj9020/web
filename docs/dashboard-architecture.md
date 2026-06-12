# 대시보드 데이터 흐름 보고서

## 개요

S3에 저장된 enriched 배치 파일을 Next.js API Route(`/api/stats`)가 읽어 집계한 뒤 `/dashboard` 페이지에 실시간 보안 현황을 표시하는 구조입니다.

---

## 전체 데이터 흐름

```
크롤러 (Python)
    └─ 매일 1회 배치 처리
         │
         ▼
S3: {소스이름}/enriched/{날짜}.json
    ┌─────────────────────────────────────┐
    │ {                                   │
    │   "source": "github",               │
    │   "enriched_at": "2026-05-31T...",  │
    │   "count": 300,                     │
    │   "items": [ ...300개 어드바이저리 ]│
    │ }                                   │
    └─────────────────────────────────────┘
         │
         ▼
Next.js API Route  GET /api/stats
    ① ListObjectsV2 — 소스 폴더 자동 감지
    ② 소스별 현황 집계 (JSON 읽기 없음, 메타데이터만)
    ③ 최신 10개 배치 파일 병렬 fetch
    ④ items[] flatten → severity / KEV 집계
    ⑤ CVSS 6.0 이상 최근 CVE 정렬
         │
         ▼
/dashboard 페이지 (React)
    - 로딩 스켈레톤 → 실제 수치 렌더링
    - 통계 카드 / 심각도 분포 / 소스 현황 / CVE 테이블
```

---

## S3 버킷 구조

```
2026-inha-cc-07-s3/
└── github/
    └── enriched/
        ├── 2026-05-31.json    ← items 300개 포함 배치 파일
        ├── 2026-05-30.json
        └── ...
```

> 파일명은 자유 형식이어도 됩니다. 코드는 `.json` 확장자만 확인하고, S3 `LastModified` 타임스탬프로 최신 순 정렬합니다.

---

## enriched 배치 파일 구조

```json
{
  "source": "github",
  "enriched_at": "2026-05-31T02:00:00Z",
  "model": "claude-haiku-4-5-20251001",
  "count": 300,
  "items": [
    {
      "id": "해시값",
      "title": "Advisory 제목 (영문)",
      "source_url": "https://github.com/advisories/GHSA-...",
      "published_at": "2026-05-31T00:00:00Z",
      "summary": "한국어 요약",
      "severity": { "label": "critical", "cvss_score": 9.8, ... },
      "affected": [{ "vendor": "Apache", "product": "Log4j2", ... }],
      "identifiers": { "cve_ids": ["CVE-2021-44228"], "kev_listed": true, ... },
      "action": { "remediation": "즉시 업데이트하십시오.", ... },
      "audience": { "primary": "developer", "recommended_for": ["developer", "security"], ... }
    }
  ]
}
```

---

## API Route 동작 방식

**파일**: `src/app/api/stats/route.ts`
**엔드포인트**: `GET /api/stats`
**캐시**: 5분 (`revalidate = 300`)

### 처리 단계

#### ① 소스 폴더 자동 감지 (JSON 읽기 없음)
버킷 최상위를 `Delimiter="/"`로 조회해 소스 폴더를 자동 감지합니다. 새 크롤러가 추가되어도 코드 변경 없이 인식됩니다.

#### ② 소스별 현황 집계 (JSON 읽기 없음)
`ListObjectsV2` 응답의 `LastModified` 메타데이터만으로 소스별 파일 수와 마지막 수집 시각을 집계합니다. 마지막 수집이 24시간 이내면 **정상**, 초과하면 **점검중**으로 표시합니다.

#### ③ 최신 배치 파일 fetch (최대 10개)
`LastModified` 내림차순으로 정렬 후 상위 10개 파일만 `GetObject`로 병렬 fetch합니다.

#### ④ 오늘 수집 건수 집계
`LastModified`가 오늘(KST 기준)인 배치 파일의 `items` 수를 합산합니다. 오늘 크롤링이 없으면 0으로 표시합니다.

#### ⑤ Severity 분포 및 KEV 집계
fetch한 모든 아이템을 순회하며 `severity.label`별 카운트와 `kev_listed: true` 카운트를 집계합니다.

#### ⑥ 최근 주요 CVE 선별
CVSS 6.0 이상이고 CVE ID가 있는 아이템을 CVSS 점수 내림차순으로 정렬, 상위 10개를 테이블에 표시합니다.

---

## 대시보드 패널 구성

### 통계 카드 (4개)

| 카드 | 데이터 소스 | 비고 |
|------|------------|------|
| 오늘 수집된 이슈 | S3 `LastModified` = 오늘인 파일의 `items.length` 합산 | |
| Critical CVE | `severity.label = "critical"` 아이템 수 | |
| 오늘 발송 완료 | `–` | FastAPI 백엔드 연동 후 제공 (Phase 3) |
| 누적 구독자 | `–` | FastAPI 백엔드 연동 후 제공 (Phase 3) |

### CVE 심각도 분포 (바 차트)

최신 배치 파일들의 전체 아이템 기준으로 critical / high / medium / low 비율을 표시합니다. 데이터가 없으면 "수집된 데이터가 없습니다." 메시지를 표시합니다.

### 수집 소스 현황

| 표시 | 조건 |
|------|------|
| 🟢 정상 | `LastModified`가 현재로부터 24시간 이내 |
| 🟡 점검중 | `LastModified`가 24시간 초과 |

### 최근 주요 CVE 테이블

CVSS 6.0 이상 취약점을 심각도 순으로 최대 10개 표시합니다. 해당 취약점이 없으면 "현재 CVSS 6.0 이상 취약점이 없습니다." 메시지를 표시합니다.

---

## 빈 데이터 처리 (크롤링 없는 날)

| 상황 | 동작 |
|------|------|
| S3에 파일 없음 | 모든 수치 0, 빈 배열 반환 (오류 없음) |
| 개별 파일 파싱 실패 | 해당 파일만 skip, 나머지 정상 처리 |
| `items[]` 빈 배열 | 카운트 0으로 집계 |
| CVSS 6.0 이상 없음 | CVE 테이블 "없음" 메시지 표시 |
| 소스 없음 | 소스 현황 "없음" 메시지 표시 |

---

## Phase 로드맵

| Phase | 상태 | 내용 |
|-------|------|------|
| Phase 1 | ✅ 완료 | S3 enriched 배치 파일 기반 통계 |
| Phase 2 | 🔲 예정 | 크롤러가 `stats/daily-{날짜}.json` 사전 집계 파일 생성 → API 부하 감소 |
| Phase 3 | 🔲 예정 | FastAPI 백엔드 연동 → 구독자 수, 발송 완료 수치 |

---

## 관련 파일

| 파일 | 역할 |
|------|------|
| `src/app/api/stats/route.ts` | S3 집계, 응답 생성 |
| `src/lib/s3News.ts` | S3 접근 공통 유틸 (뉴스·통계 공유) |
| `src/types/news.ts` | `BatchEnrichedFile`, `ProcessedNews`, `DashboardStats` 타입 |
| `src/app/dashboard/page.tsx` | 대시보드 UI (로딩 스켈레톤, 빈 상태 처리 포함) |
