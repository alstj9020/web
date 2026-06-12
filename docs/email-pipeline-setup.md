# 이메일 발송 파이프라인 설정 가이드

## 개요

구독자가 선택한 시각(오전 8시 / 오후 12시 / 오후 6시)에 맞게 보안 뉴스레터를 자동 발송하는 파이프라인을 구성한다.

```
EventBridge Scheduler
       ↓ (POST, 매일 3회)
/api/send-emails  (Next.js API Route, Amplify)
       ↓
DynamoDB haruboan-subscribers  ← 구독자 조회 (deliveryTime 기준)
       ↓
DynamoDB haruboan-recommendations  ← 오늘 추천 기사 조회 (이메일별)
       ↓
Gmail SMTP (Nodemailer)  ← 이메일 발송
```

---

## 현재 완료된 작업 (코드)

| 파일 | 내용 |
|------|------|
| `src/lib/dynamoSubscriber.ts` | 구독자 저장 / 삭제 / 조회 |
| `src/lib/dynamoRecommendations.ts` | 추천 기사 조회 (TODO 스키마 확정 필요) |
| `src/lib/ses.ts` | Gmail SMTP 이메일 발송 (Nodemailer) |
| `src/app/api/subscribe/route.ts` | 구독 API — DynamoDB 저장 |
| `src/app/api/unsubscribe/route.ts` | 해지 API — DynamoDB 삭제 |
| `src/app/api/send-emails/route.ts` | 발송 API — EventBridge가 호출 |

---

## Step 1. DynamoDB `haruboan-subscribers` 테이블 생성

> IAM `dynamodb:CreateTable` 권한 승인 후 진행

### AWS Console 설정

1. **DynamoDB → Tables → Create table**
2. Table name: `haruboan-subscribers`
3. Partition key: `email` / Type: **String**
4. Table settings: **Customize settings**
5. Read/write capacity: **On-demand**
6. **Create table**

### 테이블 스키마

| 속성 | 타입 | 값 예시 |
|------|------|---------|
| `email` | String (PK) | `user@example.com` |
| `audience` | String | `일반인` \| `개발자` \| `보안직군` |
| `topics` | List\<String\> | `["프론트엔드/웹", "백엔드/API 서버"]` |
| `deliveryTime` | String | `오전 8시` \| `오후 12시` \| `오후 6시` |
| `createdAt` | String | `2024-01-15T09:00:00.000Z` |
| `updatedAt` | String | `2024-01-15T09:00:00.000Z` |

> `일반인`은 topics가 빈 배열 `[]`로 저장된다.

---

## Step 2. Amplify IAM Role 권한 추가

Amplify 서버가 DynamoDB에 읽기/쓰기하려면 IAM Role에 아래 권한이 필요하다.

### 정책 추가 방법

1. **IAM → Roles** → 검색창에 `amplify` 입력
2. Amplify 앱 Role 클릭 (이름: `amplify-[앱이름]-...`)
3. **Add permissions → Attach policies → Create inline policy**
4. JSON 탭에 아래 내용 붙여넣기

### `haruboan-subscribers` 권한

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "dynamodb:PutItem",
        "dynamodb:DeleteItem",
        "dynamodb:Scan"
      ],
      "Resource": "arn:aws:dynamodb:ap-northeast-2:842544789367:table/haruboan-subscribers"
    }
  ]
}
```

### `haruboan-recommendations` 권한 (추천 테이블 생성 후 추가)

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "dynamodb:GetItem"
      ],
      "Resource": "arn:aws:dynamodb:ap-northeast-2:842544789367:table/haruboan-recommendations"
    }
  ]
}
```

---

## Step 3. `haruboan-recommendations` 테이블 생성 (추천 알고리즘 담당)

추천 알고리즘을 담당하는 팀원이 생성하고 데이터를 채워야 한다.

### 테이블 설정

- Table name: `haruboan-recommendations`
- Partition key: `email` / Type: **String**
- Sort key: `date` / Type: **String** (값 형식: `YYYY-MM-DD`)
- Billing mode: **On-demand**

### `articles` 항목 구조

발송 API가 아래 필드를 읽는다. 필드명을 정확히 맞춰야 한다.

```json
{
  "title": "Apache HTTP Server 원격 코드 실행 취약점",
  "summary": "Apache 2.4.x 버전에서 ...",
  "severity": "Critical",
  "cvss_score": 9.8,
  "cve_ids": ["CVE-2024-38472"],
  "action": "Apache 2.4.62 이상으로 업그레이드",
  "source_url": "https://nvd.nist.gov/vuln/detail/CVE-2024-38472"
}
```

| 필드 | 타입 | 허용값 |
|------|------|--------|
| `title` | String | 기사 제목 |
| `summary` | String | 요약 (2~3문장) |
| `severity` | String | `Critical` \| `High` \| `Medium` \| `Low` \| `Info` |
| `cvss_score` | Number \| null | 0.0 ~ 10.0, 없으면 null |
| `cve_ids` | List\<String\> | `["CVE-XXXX-XXXX"]`, 없으면 빈 배열 |
| `action` | String | 대응 방안, 없으면 빈 문자열 |
| `source_url` | String | 원문 URL |

### 코드 연동 확인

테이블 스키마 확정 후 `src/lib/dynamoRecommendations.ts`의 TODO 주석 부분을 실제 스키마에 맞게 수정해야 한다.

---

## Step 4. Amplify 환경변수 설정

**Amplify Console → 앱 선택 → App settings → Environment variables**

| 변수명 | 값 | 설명 |
|--------|-----|------|
| `GMAIL_USER` | `haruboan@gmail.com` | 발신 이메일 주소 |
| `GMAIL_APP_PASSWORD` | (Gmail 앱 비밀번호) | Gmail 앱 비밀번호 16자리 |
| `CRON_SECRET` | (랜덤 문자열) | EventBridge 호출 인증 키 |

> 저장 후 Amplify 재배포 필요.

---

## Step 5. EventBridge Scheduler 설정

### 5-1. API Destination 생성 (1회만)

**EventBridge → API destinations → Create API destination**

| 항목 | 값 |
|------|-----|
| Name | `haruboan-send-emails` |
| Endpoint URL | `https://[Amplify 도메인]/api/send-emails` |
| HTTP method | `POST` |

**Connection 생성 (Create new connection):**

| 항목 | 값 |
|------|-----|
| Connection name | `haruboan-cron-auth` |
| Authorization type | **API Key** |
| API key name | `x-cron-secret` |
| API key value | `CRON_SECRET` 환경변수 값 |

### 5-2. 스케줄 3개 생성

**EventBridge → Schedules → Create schedule** (아래 표대로 3번 반복)

| 스케줄 이름 | Cron 표현식 (UTC) | 발송 시각 (KST) |
|---|---|---|
| `haruboan-8am` | `cron(0 23 * * ? *)` | 매일 오전 8시 |
| `haruboan-12pm` | `cron(0 3 * * ? *)` | 매일 오후 12시 |
| `haruboan-6pm` | `cron(0 9 * * ? *)` | 매일 오후 6시 |

**각 스케줄 공통 설정:**

- Flexible time window: **Off**
- Target API: **EventBridge API destination**
- API destination: `haruboan-send-emails` (위에서 생성)
- IAM Role: **Create new role** (자동 생성)

---

## Step 6. 동작 확인

### 설정 상태 확인

```bash
curl https://[Amplify 도메인]/api/send-emails
```

정상 응답:
```json
{
  "sesFrom": "haruboan@gmail.com",
  "recommendationsTable": "haruboan-recommendations",
  "cronSecretSet": true
}
```

### 수동 발송 테스트

```bash
curl -X POST https://[Amplify 도메인]/api/send-emails \
  -H "x-cron-secret: [CRON_SECRET 값]"
```

정상 응답 예시:
```json
{
  "deliveryTime": "오전 8시",
  "total": 3,
  "sent": 3
}
```

---

## 진행 체크리스트

- [ ] Step 1: `haruboan-subscribers` DynamoDB 테이블 생성
- [ ] Step 2: Amplify IAM Role에 subscribers 권한 추가
- [ ] Step 3: `haruboan-recommendations` 테이블 생성 및 스키마 확정 → `dynamoRecommendations.ts` TODO 수정
- [ ] Step 3: Amplify IAM Role에 recommendations 권한 추가
- [ ] Step 4: Amplify 환경변수 설정 (`GMAIL_USER`, `GMAIL_APP_PASSWORD`, `CRON_SECRET`)
- [ ] Step 5: EventBridge API Destination + 스케줄 3개 생성
- [ ] Step 6: 수동 발송 테스트로 최종 확인
