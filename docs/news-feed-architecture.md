# 뉴스 피드 데이터 흐름 보고서

## 개요

크롤러가 S3에 저장한 보안 어드바이저리 JSON 파일을 Next.js API Route가 읽어 중복 제거 후 `/news` 페이지에 표시하는 구조입니다.

---

## 전체 데이터 흐름

```
크롤러 (Python)
    │
    ├─ raw/         S3: {소스이름}/raw/*.json          (원본 크롤링 데이터)
    │
    └─ enriched/    S3: {소스이름}/enriched/*.json     (공통 스키마 + LLM 분석 결과)
                            │
                    Next.js API Route
                    GET /api/news
                            │
                      ① 소스 폴더 목록 조회 (ListObjectsV2)
                      ② 각 소스의 enriched/ 파일 목록 조회
                      ③ 최신 100개 파일 병렬 fetch (GetObject)
                      ④ CVE ID 기준 중복 제거 (dedup)
                      ⑤ 프론트 표시용 타입으로 변환
                            │
                    /news 페이지 (React)
                      - 로딩 스켈레톤 → 카드 렌더링
                      - 직군 탭 필터 (일반인 / 개발자 / 보안직군)
```

---

## S3 버킷 구조

```
2026-inha-cc-07-s3/
├── github_advisory/
│   ├── raw/
│   │   └── GHSA-xxxx-xxxx.json
│   └── enriched/
│       └── GHSA-xxxx-xxxx.json     ← 프론트가 읽는 파일
├── nvd/
│   ├── raw/
│   └── enriched/
│       └── CVE-2026-xxxx.json
└── (다른 소스)/
    └── enriched/
```

> `enriched/` 파일만 프론트엔드가 읽습니다. `raw/`는 무시합니다.

---

## enriched JSON 스키마

프론트가 기대하는 필드 구조입니다. (`src/types/news.ts`의 `ProcessedNews`)

```json
{
  "summary": "사람이 읽을 수 있는 요약 (한국어)",
  "severity": {
    "label": "critical | high | medium | low | info",
    "cvss_score": 9.8,
    "cvss_vector": "CVSS:3.1/...",
    "epss_score": 0.12
  },
  "affected": [
    {
      "vendor": "NVIDIA",
      "product": "GPU Display Driver",
      "ecosystem": "firmware",
      "versions_affected": "596.36 미만",
      "versions_fixed": "596.36"
    }
  ],
  "identifiers": {
    "cve_ids": ["CVE-2026-24193", "CVE-2026-24200"],
    "ghsa_id": "GHSA-xxxx-xxxx",
    "kev_listed": false,
    "ransomware_known": false
  },
  "action": {
    "required_action": null,
    "remediation": "즉시 업데이트하십시오.",
    "references": []
  },
  "audience": {
    "scores": { "general": 30, "developer": 25, "security": 75 },
    "primary": "security",
    "recommended_for": ["security"],
    "confidence": 0.75,
    "reason": "..."
  }
}
```

---

## API Route 동작 방식

**파일**: `src/app/api/news/route.ts`
**엔드포인트**: `GET /api/news`
**캐시**: 5분 (`revalidate = 300`)

### 처리 단계

#### ① 소스 폴더 자동 감지
버킷 최상위 폴더를 자동으로 탐색하므로 새 크롤러 소스가 추가되어도 코드 변경 없이 자동 인식됩니다.

```
ListObjectsV2(Delimiter="/") → ["github_advisory/", "nvd/", ...]
```

#### ② enriched 파일 목록 조회
각 소스에 대해 `{소스}/enriched/` prefix로 파일 목록을 조회합니다. 1,000개를 초과해도 페이지네이션으로 전부 수집합니다.

#### ③ 최신 100개 선별 및 병렬 fetch
`LastModified` 내림차순 정렬 후 상위 100개만 `GetObject`로 병렬 fetch합니다.

#### ④ CVE ID 기준 중복 제거

같은 취약점이 여러 소스(GitHub Advisory, NVD 등)에 중복 보고될 수 있습니다. `cve_ids` 배열에 공통 CVE가 하나라도 있으면 같은 이슈로 판단하여 병합합니다.

```
파일 A: cve_ids = ["CVE-2026-001", "CVE-2026-002"]
파일 B: cve_ids = ["CVE-2026-002", "CVE-2026-003"]
                       ↑ 공통
→ 같은 그룹으로 병합
```

**병합 규칙:**
- `severity`: 더 높은 severity / CVSS 점수 기준으로 선택
- `affected[]`: vendor+product 기준 합집합
- `source_count`: 몇 개 소스에서 보고됐는지 카운트

#### ⑤ 프론트 타입으로 변환

| enriched 필드 | 프론트 표시 |
|---|---|
| `severity.label` | 뱃지 색상 (Critical=빨강, High=주황, ...) |
| `identifiers.cve_ids` | CVE 태그 표시 |
| `severity.cvss_score` | "CVSS 9.8" 표시 |
| `action.remediation` | "대응 :" 박스 |
| `audience.recommended_for` | 직군 탭 필터링 기준 |
| `identifiers.kev_listed` | "KEV" 뱃지 |
| `source_count > 1` | "출처 N개" 표시 |

---

## 프론트엔드 표시 (뉴스 카드)

```
┌─────────────────────────────────────────────┐
│ [Critical] CVSS 9.8  [KEV]       NVD  출처 2개│  ← severity, source
├─────────────────────────────────────────────┤
│ CVE-2026-24193 · CVE-2026-24200              │  ← cveIds
│ NVIDIA GPU Display Driver (CVE-2026-24193)   │  ← 자동 생성 제목
│                                              │
│ NVIDIA가 GPU Driver에서 발견된 권한 상승...   │  ← summary (4줄 클램프)
│                                              │
│ ┌─────────────────────────────────────────┐ │
│ │ 대응 : 596.36 이상으로 즉시 업데이트      │ │  ← remediation
│ └─────────────────────────────────────────┘ │
├─────────────────────────────────────────────┤
│ [보안직군]                          NVIDIA   │  ← recommendedFor, vendor
└─────────────────────────────────────────────┘
```

**직군 탭 필터**: `audience.recommended_for` 배열 기준으로 필터링합니다. 하나의 뉴스가 여러 직군에 동시에 표시될 수 있습니다.

---

## 새 크롤러 소스 추가 방법

S3에 `{새소스이름}/enriched/*.json` 구조로 파일을 업로드하면 자동으로 감지됩니다.

표시 이름이 자동 생성(`github_advisory` → `Github Advisory`)되지만, 더 정확한 이름을 원하면 `route.ts`의 `SOURCE_NAME_MAP`에 추가합니다.

```typescript
// src/app/api/news/route.ts
const SOURCE_NAME_MAP: Record<string, string> = {
  github_advisory: "GitHub Advisory",
  nvd: "NVD",
  cisa: "CISA",
  kisa: "KISA",
  새소스이름: "표시할 이름",  // ← 추가
};
```

---

## 인증 방식

Amplify 앱에 연결된 IAM Role을 통해 S3에 접근합니다. 별도 액세스 키 불필요.

필요한 IAM 권한:
```
s3:ListBucket   — enriched/ 파일 목록 조회
s3:GetObject    — 개별 JSON 파일 읽기
```

---

## 관련 파일

| 파일 | 역할 |
|------|------|
| `src/app/api/news/route.ts` | S3 조회, 중복 제거, 변환 |
| `src/types/news.ts` | S3 스키마(`ProcessedNews`), 프론트 타입(`NewsDisplayItem`) |
| `src/app/news/page.tsx` | 뉴스 피드 UI (탭 필터, 카드 그리드) |
