# 뉴스피드 "오늘의 뉴스" + 전체보기 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** `/news` 페이지 상단에 KST 기준 오늘 발행된 뉴스만 카드로 보여주고, 새로고침 버튼으로 즉시 재조회할 수 있게 하며, 그 아래 "전체보기" 토글을 펼치면 기존 검색/정렬/필터/뷰전환 기능이 그대로 적용된 전체 뉴스 목록이 나타나도록 한다.

**Architecture:** 서버(`/api/news`, `revalidate=300`)는 변경하지 않는다. 클라이언트(`src/app/news/page.tsx`)에서 받아온 전체 뉴스 배열을 KST 날짜 기준으로 `useMemo` 파생해 "오늘의 뉴스"를 만들고, 기존 검색/정렬/필터 로직이 적용된 "전체보기" 블록은 `expanded` state로 조건부 렌더한다.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Tailwind CSS v4. 테스트 러너 미설치 — 이번 작업에서는 추가하지 않고 수동 검증(`npm run build`, `npm run lint`, 브라우저 확인)으로 대체한다.

## Global Constraints

- 응답/주석/문서는 한국어. 식별자는 영문.
- `any` 사용 금지, 모든 props/함수에 타입 명시.
- `console.log` 디버그 출력 금지.
- 기존 컴포넌트(`NewsCard`, `SkeletonCard`, `NewsListItem`, `NewsDetailModal`) 재사용, 신규 컴포넌트 생성 금지.
- 신규 테스트 인프라(Jest/Vitest) 추가 금지 — 수동 검증으로 대체 (사용자 결정).
- "오늘" 판단은 KST(Asia/Seoul) 캘린더 날짜 기준.

---

### Task 1: KST 날짜 비교 유틸 추가

**Files:**
- Create: `src/lib/date.ts`

**Interfaces:**
- Produces: `isTodayKST(isoString: string): boolean` — 이후 Task 2에서 `news.filter`에 사용됨.

- [ ] **Step 1: `src/lib/date.ts` 작성**

```typescript
/** ISO 날짜 문자열이 KST(Asia/Seoul) 기준 오늘 날짜인지 확인한다. */
export function isTodayKST(isoString: string): boolean {
  const fmt = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Seoul" });
  return fmt.format(new Date(isoString)) === fmt.format(new Date());
}
```

- [ ] **Step 2: 타입 체크로 컴파일 확인**

Run: `cd /home/mskang/cloud/web && npx tsc --noEmit`
Expected: 에러 없음 (기존 에러가 있었다면 동일하게 유지, `date.ts` 관련 에러 없어야 함)

- [ ] **Step 3: 수동 동작 확인**

Run:
```bash
cd /home/mskang/cloud/web && npx tsx -e "
import { isTodayKST } from './src/lib/date';
console.log(isTodayKST(new Date().toISOString())); // true
console.log(isTodayKST('2000-01-01T00:00:00Z')); // false
console.log(isTodayKST(new Date(Date.now() - 24*60*60*1000).toISOString())); // false (어제)
"
```
Expected: `true`, `false`, `false` 출력. (`tsx`가 없으면 `npx --yes tsx ...`로 1회성 실행 가능)

- [ ] **Step 4: Commit**

```bash
git add src/lib/date.ts
git commit -m "Feat : KST 기준 오늘 날짜 판별 유틸 추가"
```

---

### Task 2: 오늘의 뉴스 섹션 + 새로고침 버튼

**Files:**
- Modify: `src/app/news/page.tsx`

**Interfaces:**
- Consumes: `isTodayKST(isoString: string): boolean` (Task 1, `src/lib/date.ts`)
- Produces: `todayNews: NewsDisplayItem[]`, `refreshing: boolean`, `handleRefresh(): void` — Task 3에서는 사용하지 않지만 같은 파일 내 다른 JSX 블록과 공존.

- [ ] **Step 1: import 추가**

`src/app/news/page.tsx:1-8`을 다음으로 교체:

```typescript
"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import type { NewsDisplayItem, AudienceLabel } from "@/types/news";
import { isTodayKST } from "@/lib/date";
import NewsCard from "@/components/news/NewsCard";
import NewsListItem from "@/components/news/NewsListItem";
import NewsDetailModal from "@/components/news/NewsDetailModal";
import SkeletonCard from "@/components/news/SkeletonCard";
```

- [ ] **Step 2: state 추가 및 fetch 로직을 재사용 가능한 함수로 추출**

`src/app/news/page.tsx:41-57`(현재 `news`/`loading`/`error` state 선언부터 fetch `useEffect`까지)을 다음으로 교체:

```typescript
  const [news, setNews] = useState<NewsDisplayItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<NewsDisplayItem | null>(null);
  const [expanded, setExpanded] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);
  const sortRef = useRef<HTMLDivElement>(null);

  function fetchNews() {
    return fetch("/api/news").then((res) => {
      if (!res.ok) throw new Error("뉴스를 불러오지 못했습니다.");
      return res.json() as Promise<NewsDisplayItem[]>;
    });
  }

  useEffect(() => {
    fetchNews()
      .then((data) => setNews(data))
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  function handleRefresh() {
    setRefreshing(true);
    setError(null);
    fetchNews()
      .then((data) => setNews(data))
      .catch((err: Error) => setError(err.message))
      .finally(() => setRefreshing(false));
  }
```

(`expanded` state는 Task 3에서 사용하지만, 이 블록에서 다른 state들과 함께 한 번에 선언한다.)

- [ ] **Step 3: `todayNews` 파생 추가**

`src/app/news/page.tsx`에서 `const allSources = useMemo(...)` 선언(현재 68-71행) 바로 위에 추가:

```typescript
  const todayNews = useMemo(
    () => news.filter((n) => isTodayKST(n.publishedAt)),
    [news]
  );
```

- [ ] **Step 4: 오늘의 뉴스 섹션 JSX 추가**

`src/app/news/page.tsx`의 hero `</section>` 닫는 태그(현재 124행) 바로 다음, 기존 툴바 `<div className="bg-white border-b ...">`(현재 127행) 바로 앞에 삽입:

```tsx
      {/* 오늘의 뉴스 */}
      <div className="max-w-[1200px] mx-auto px-6 md:px-16 lg:px-[120px] py-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-[16px] text-[#1e2235]">오늘의 뉴스</h2>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-1.5 text-[12px] text-[#3d4f6e] hover:text-[#6bb8d4] transition-colors disabled:opacity-50"
          >
            <svg
              className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`}
              fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"
            >
              <path d="M4 4v6h6M20 20v-6h-6" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M4 10a8 8 0 0 1 14.9-3M20 14a8 8 0 0 1-14.9 3" strokeLinecap="round" />
            </svg>
            새로고침
          </button>
        </div>

        {error ? (
          <div className="text-center py-12">
            <p className="text-[#ef4444] text-[14px] mb-1">데이터를 불러오지 못했습니다.</p>
            <p className="text-[#a8b8d0] text-[12px]">{error}</p>
          </div>
        ) : loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : todayNews.length === 0 ? (
          <div className="text-center py-12 text-[#a8b8d0]">
            <p className="text-[14px]">오늘은 아직 수집된 뉴스가 없습니다.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {todayNews.map((item) => (
              <NewsCard key={item.id} item={item} onClick={setSelectedItem} />
            ))}
          </div>
        )}
      </div>

```

- [ ] **Step 5: 타입 체크**

Run: `cd /home/mskang/cloud/web && npx tsc --noEmit`
Expected: 에러 없음

- [ ] **Step 6: 개발 서버에서 수동 확인**

Run: `cd /home/mskang/cloud/web && npm run dev` (백그라운드 실행 후 브라우저로 `http://localhost:3000/news` 접속)
확인 항목:
- "오늘의 뉴스" 섹션이 hero 바로 아래에 보이는지
- 새로고침 버튼 클릭 시 아이콘이 회전(스피너)하고 잠시 후 멈추는지
- 오늘 발행된 뉴스가 없는 경우 안내 문구가 보이는지 (데이터에 오늘 날짜 항목이 없다면 이 케이스로 확인됨)
- 기존 하단 영역(툴바/리스트)은 아직 그대로 남아있어 오늘 뉴스와 별개로 전체 뉴스가 한 번 더 보임 (Task 3에서 토글로 분리)

- [ ] **Step 7: Commit**

```bash
git add src/app/news/page.tsx
git commit -m "Feat : 오늘의 뉴스 섹션 및 새로고침 버튼 추가"
```

---

### Task 3: 전체보기 토글로 기존 목록 분리

**Files:**
- Modify: `src/app/news/page.tsx`

**Interfaces:**
- Consumes: `expanded: boolean`, `setExpanded` (Task 2에서 선언됨), `news.length`, `filtered` (기존 변수, 변경 없음)

- [ ] **Step 1: 전체보기 토글 버튼 추가**

Task 2에서 추가한 "오늘의 뉴스" `</div>` 닫는 태그 바로 다음(기존 툴바 `<div className="bg-white border-b ...">` 바로 앞)에 삽입:

```tsx
      {/* 전체보기 토글 */}
      <div className="max-w-[1200px] mx-auto px-6 md:px-16 lg:px-[120px]">
        <button
          onClick={() => setExpanded((v) => !v)}
          className="w-full flex items-center justify-center gap-2 py-3 border-t border-[#e8eaed] text-[13px] font-medium text-[#3d4f6e] hover:text-[#6bb8d4] transition-colors"
        >
          전체보기 ({news.length}건)
          <svg
            className={`w-3 h-3 transition-transform ${expanded ? "rotate-180" : ""}`}
            fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"
          >
            <path d="m6 9 6 6 6-6" strokeLinecap="round" />
          </svg>
        </button>
      </div>

```

- [ ] **Step 2: 기존 툴바+범례+목록 블록을 조건부 렌더로 감싸기**

기존 `{/* 툴바 */}` 주석부터(현재 126행) `{/* 기사 목록 */}` 블록의 닫는 `</div>`(현재 293행)까지를 `{expanded && (<>...</>)}`로 감싼다. 즉, 다음 줄:

```tsx
      {/* 툴바 */}
      <div className="bg-white border-b border-[#e8eaed] sticky top-16 z-40">
```

바로 앞에:

```tsx
      {expanded && (
        <>
```

를 추가하고, `{/* 기사 목록 */}` 블록의 마지막 `</div>` (현재 293행, `main` 태그 닫기 바로 앞) 다음에:

```tsx
        </>
      )}
```

를 추가한다. 그 사이의 툴바/범례/기사목록 JSX 내용은 **변경하지 않는다** (들여쓰기만 한 단계 추가해도 되고, 안 해도 JSX 동작에는 무관함 — 가독성을 위해 들여쓰기 조정 권장).

- [ ] **Step 3: 타입 체크**

Run: `cd /home/mskang/cloud/web && npx tsc --noEmit`
Expected: 에러 없음

- [ ] **Step 4: 빌드 확인**

Run: `cd /home/mskang/cloud/web && npm run build`
Expected: 빌드 성공, `/news` 라우트 에러 없음

- [ ] **Step 5: Lint 확인**

Run: `cd /home/mskang/cloud/web && npm run lint`
Expected: 에러 없음

- [ ] **Step 6: 개발 서버에서 수동 확인**

`http://localhost:3000/news` 접속해 확인:
- 기본 진입 시 "전체보기" 패널(툴바/범례/목록)이 보이지 않고 토글 버튼만 보이는지
- "전체보기 (N건)" 버튼 클릭 시 패널이 펼쳐지고 chevron이 180도 회전하는지
- 펼친 상태에서 검색/정렬/필터/뷰전환이 기존과 동일하게 동작하는지
- 펼친 목록에 오늘 발행된 뉴스도 함께 보이는지 (중첩 포함 확인)
- 버튼 재클릭 시 패널이 다시 닫히는지

- [ ] **Step 7: Commit**

```bash
git add src/app/news/page.tsx
git commit -m "Feat : 전체보기 토글로 뉴스 목록 분리"
```
