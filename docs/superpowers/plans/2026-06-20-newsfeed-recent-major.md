# 뉴스피드 "최근 주요 뉴스" + 상시 필터 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** `/news` 페이지 상단의 "오늘의 뉴스"(오늘 발행분만 필터)를 "최근 주요 뉴스"(심각도 우선 + 최신순 상위 6개, 필터와 독립)로 교체하고, 검색/정렬/필터 툴바를 "전체보기" 토글 뒤에 가두지 않고 Hero 바로 아래에 항상 노출한다.

**Architecture:** `src/app/news/page.tsx` 내부 로직만 변경한다. `todayNews`(KST 날짜 필터) 파생을 `highlightNews`(심각도+날짜 정렬 상위 6개) 파생으로 교체하고, `expanded` state와 "전체보기" 토글 버튼을 제거해 기존에 조건부 렌더되던 툴바/범례/목록 블록을 항상 렌더하도록 만들며, 툴바 위치를 Hero 바로 아래로 옮긴다. 더 이상 쓰이지 않는 `isTodayKST`와 `src/lib/date.ts`를 삭제한다.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Tailwind CSS v4. 테스트 러너 미설치 — `npx tsc --noEmit` 타입 체크 + `npm run build` + `npm run lint` + 브라우저 수동 확인으로 검증한다 (이전 플랜([[2026-06-20-newsfeed-today-section]])과 동일한 사용자 결정).

## Global Constraints

- 응답/주석/문서는 한국어. 식별자는 영문.
- `any` 사용 금지, 모든 props/함수에 타입 명시.
- `console.log` 디버그 출력 금지.
- 기존 컴포넌트(`NewsCard`, `SkeletonCard`, `NewsListItem`, `NewsDetailModal`) 재사용, 신규 컴포넌트 생성 금지.
- 신규 테스트 인프라(Jest/Vitest) 추가 금지 — 수동 검증으로 대체.
- `filtered` 계산 로직(검색/소스/직군 필터, 정렬)은 변경하지 않는다.
- "최근 주요 뉴스"는 검색/필터/정렬 state와 무관하게 전체 `news`에서 독립적으로 계산한다.

---

### Task 1: `highlightNews`로 교체 + `isTodayKST` 제거

**Files:**
- Modify: `src/app/news/page.tsx`
- Delete: `src/lib/date.ts`

**Interfaces:**
- Produces: `highlightNews: NewsDisplayItem[]` (Task 2에서 JSX 위치 이동 시 그대로 참조)
- Removes: `isTodayKST` import, `todayNews` 변수 (다른 곳에서 참조 없음, 안전하게 제거 가능)

- [ ] **Step 1: import에서 `isTodayKST` 제거**

`src/app/news/page.tsx:1-9`:

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

위 블록에서 `import { isTodayKST } from "@/lib/date";` 줄을 삭제한다:

```typescript
"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import type { NewsDisplayItem, AudienceLabel } from "@/types/news";
import NewsCard from "@/components/news/NewsCard";
import NewsListItem from "@/components/news/NewsListItem";
import NewsDetailModal from "@/components/news/NewsDetailModal";
import SkeletonCard from "@/components/news/SkeletonCard";
```

- [ ] **Step 2: `todayNews` → `highlightNews`로 교체**

`src/app/news/page.tsx:83-86` (현재):

```typescript
  const todayNews = useMemo(
    () => news.filter((n) => isTodayKST(n.publishedAt)),
    [news]
  );
```

다음으로 교체:

```typescript
  const highlightNews = useMemo(
    () =>
      [...news]
        .sort((a, b) => {
          const rankDiff =
            (SEVERITY_RANK[a.severity.toLowerCase()] ?? 5) -
            (SEVERITY_RANK[b.severity.toLowerCase()] ?? 5);
          if (rankDiff !== 0) return rankDiff;
          return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
        })
        .slice(0, 6),
    [news]
  );
```

(이 `useMemo`는 `allSources` 선언 바로 위, 기존 `todayNews` 위치와 동일한 자리에 있다. `SEVERITY_RANK`는 파일 상단(`src/app/news/page.tsx:20-22`)에 이미 정의되어 있으므로 추가 import 불필요.)

- [ ] **Step 3: Hero 제목 변경**

`src/app/news/page.tsx:134-136`:

```tsx
          <h1 className="font-black text-2xl md:text-[32px] text-[#f5f6f8] leading-tight mb-2">
            오늘의 보안 뉴스
          </h1>
```

다음으로 교체:

```tsx
          <h1 className="font-black text-2xl md:text-[32px] text-[#f5f6f8] leading-tight mb-2">
            최신 보안 뉴스
          </h1>
```

- [ ] **Step 4: "오늘의 뉴스" 섹션 텍스트/로직을 "최근 주요 뉴스"로 교체**

`src/app/news/page.tsx:146-186` (현재):

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

다음으로 교체:

```tsx
      {/* 최근 주요 뉴스 */}
      <div className="max-w-[1200px] mx-auto px-6 md:px-16 lg:px-[120px] py-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-[16px] text-[#1e2235]">최근 주요 뉴스</h2>
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
            {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : news.length === 0 ? (
          <div className="text-center py-12 text-[#a8b8d0]">
            <p className="text-[14px]">아직 수집된 뉴스가 없습니다.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {highlightNews.map((item) => (
              <NewsCard key={item.id} item={item} onClick={setSelectedItem} />
            ))}
          </div>
        )}
      </div>
```

(변경 요약: 주석/제목 텍스트, 스켈레톤 개수 3→6, 빈 상태 조건 `todayNews.length === 0` → `news.length === 0`, 빈 상태 문구 "오늘은 아직..." → "아직...", `todayNews.map` → `highlightNews.map`. 새로고침 버튼·에러 블록·그리드 클래스는 변경 없음.)

- [ ] **Step 5: `src/lib/date.ts` 삭제**

```bash
cd /home/mskang/cloud/web && git rm src/lib/date.ts
```

Expected: 다른 파일에서 `isTodayKST`나 `date.ts`를 import하지 않으므로 삭제 후에도 빌드 영향 없음. (사전 확인: `grep -rl "isTodayKST" src` 결과가 `page.tsx`뿐이었고, 이번 Step 1에서 그 import도 제거했다.)

- [ ] **Step 6: 타입 체크**

Run: `cd /home/mskang/cloud/web && npx tsc --noEmit`
Expected: 에러 없음 (`isTodayKST`, `todayNews` 관련 미사용 변수 에러 없어야 함)

- [ ] **Step 7: Commit**

```bash
git add src/app/news/page.tsx src/lib/date.ts
git commit -m "Feat : 오늘의 뉴스를 최근 주요 뉴스(심각도+최신순)로 교체"
```

---

### Task 2: "전체보기" 토글 제거 + 툴바 상단 이동

**Files:**
- Modify: `src/app/news/page.tsx`

**Interfaces:**
- Consumes: `highlightNews` (Task 1), `filtered`/`viewMode`/`searchQuery`/`sortRef`/`filterRef`/`allSources`/`activeFilterCount`/`currentSortLabel`/`toggleSource`/`toggleAudience` (기존 변수, 변경 없음)
- Removes: `expanded` state, `setExpanded`, "전체보기" 토글 버튼

- [ ] **Step 1: `expanded` state 제거**

`src/app/news/page.tsx:34-49` (현재, Task 1 적용 후에도 이 부분은 동일):

```typescript
export default function NewsPage() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortBy>("date-desc");
  const [sortOpen, setSortOpen] = useState(false);
  const [filterSources, setFilterSources] = useState<Set<string>>(new Set());
  const [filterAudiences, setFilterAudiences] = useState<Set<AudienceLabel>>(new Set());
  const [filterOpen, setFilterOpen] = useState(false);
  const [news, setNews] = useState<NewsDisplayItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<NewsDisplayItem | null>(null);
  const [expanded, setExpanded] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);
  const sortRef = useRef<HTMLDivElement>(null);
```

`const [expanded, setExpanded] = useState(false);` 줄을 삭제:

```typescript
export default function NewsPage() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortBy>("date-desc");
  const [sortOpen, setSortOpen] = useState(false);
  const [filterSources, setFilterSources] = useState<Set<string>>(new Set());
  const [filterAudiences, setFilterAudiences] = useState<Set<AudienceLabel>>(new Set());
  const [filterOpen, setFilterOpen] = useState(false);
  const [news, setNews] = useState<NewsDisplayItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<NewsDisplayItem | null>(null);
  const filterRef = useRef<HTMLDivElement>(null);
  const sortRef = useRef<HTMLDivElement>(null);
```

- [ ] **Step 2: return 문 전체를 재배치된 구조로 교체**

`src/app/news/page.tsx`의 `return (` 부터 파일 끝(`}`)까지 전체를 다음으로 교체한다 (Hero는 Task 1에서 이미 "최신 보안 뉴스"로 바뀐 상태, 최근 주요 뉴스 섹션은 Task 1에서 이미 교체된 상태 — 이번 Step에서는 그 섹션을 "툴바 다음, 심각도 범례 이전" 위치로 옮기고, "전체보기" 토글 버튼과 `{expanded && (...)}` 래퍼를 제거한다):

```tsx
  return (
    <main className="min-h-screen bg-[#f5f6f8]">
      <NewsDetailModal item={selectedItem} onClose={() => setSelectedItem(null)} />

      <section className="bg-[#1e2235] px-6 md:px-16 lg:px-[120px] py-6 md:py-8">
        <div className="max-w-[1200px] mx-auto">
          <p className="text-[#6bb8d4] text-[12px] font-medium tracking-wider mb-2">News Feed</p>
          <h1 className="font-black text-2xl md:text-[32px] text-[#f5f6f8] leading-tight mb-2">
            최신 보안 뉴스
          </h1>
          <p className="text-[#a8d8ea] text-sm md:text-[15px]">
            {new Date().toLocaleDateString("ko-KR", {
              year: "numeric", month: "long", day: "numeric", weekday: "long",
            })}{" "}
            기준
          </p>
        </div>
      </section>

      {/* 툴바 */}
      <div className="bg-white border-b border-[#e8eaed] sticky top-16 z-40">
        <div className="max-w-[1200px] mx-auto px-6 md:px-16 lg:px-[120px] py-3 flex items-center gap-2 flex-wrap">

          {/* 검색 */}
          <div className="relative flex-1 min-w-[140px] max-w-xs">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="제목, CVE, 기술스택..."
              className="w-full pl-9 pr-8 py-2 text-[13px] border border-[#e8eaed] rounded-xl bg-white text-[#1e2235] placeholder-[#c0ccd8] focus:outline-none focus:border-[#6bb8d4] focus:shadow-[0_0_0_3px_rgba(107,184,212,0.15)] transition-all shadow-sm"
            />
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#a8b8d0]" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
            </svg>
            {searchQuery && (
              <button onClick={() => setSearchQuery("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#a8b8d0] hover:text-[#3d4f6e] text-[14px] leading-none">✕</button>
            )}
          </div>

          {/* 정렬 커스텀 드롭다운 */}
          <div className="relative" ref={sortRef}>
            <button
              onClick={() => setSortOpen((v) => !v)}
              className={`flex items-center gap-1.5 py-2 px-3.5 text-[13px] border rounded-xl transition-all shadow-sm ${
                sortOpen ? "border-[#6bb8d4] text-[#6bb8d4] bg-[#e8f4fb]" : "border-[#e8eaed] text-[#3d4f6e] bg-white hover:border-[#6bb8d4]/50"
              }`}
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path d="M3 8h18M7 12h10M11 16h2" strokeLinecap="round" />
              </svg>
              {currentSortLabel}
              <svg className={`w-3 h-3 transition-transform ${sortOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path d="m6 9 6 6 6-6" strokeLinecap="round" />
              </svg>
            </button>

            {sortOpen && (
              <div className="absolute left-0 top-full mt-2 w-44 bg-white rounded-2xl shadow-xl border border-[#e8eaed] py-1.5 z-50">
                {SORT_OPTIONS.map((o) => (
                  <button
                    key={o.value}
                    onClick={() => { setSortBy(o.value); setSortOpen(false); }}
                    className={`w-full text-left px-4 py-2 text-[13px] transition-colors ${
                      sortBy === o.value
                        ? "text-[#6bb8d4] font-semibold bg-[#f0f8fc]"
                        : "text-[#3d4f6e] hover:bg-[#f5f6f8]"
                    }`}
                  >
                    {sortBy === o.value && <span className="mr-1.5">✓</span>}
                    {o.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 필터 버튼 + 드롭다운 */}
          <div className="relative" ref={filterRef}>
            <button
              onClick={() => setFilterOpen((v) => !v)}
              className={`flex items-center gap-1.5 py-2 px-3.5 text-[13px] border rounded-xl transition-all shadow-sm ${
                filterOpen || activeFilterCount > 0
                  ? "border-[#6bb8d4] text-[#6bb8d4] bg-[#e8f4fb]"
                  : "border-[#e8eaed] text-[#3d4f6e] bg-white hover:border-[#6bb8d4]/50"
              }`}
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path d="M3 6h18M7 12h10M11 18h2" strokeLinecap="round" />
              </svg>
              필터
              {activeFilterCount > 0 && (
                <span className="bg-[#6bb8d4] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none">
                  {activeFilterCount}
                </span>
              )}
            </button>

            {filterOpen && (
              <div className="absolute left-0 top-full mt-2 w-60 bg-white rounded-2xl shadow-xl border border-[#e8eaed] p-4 z-50">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[13px] font-bold text-[#1e2235]">필터</span>
                  {activeFilterCount > 0 && (
                    <button onClick={() => { setFilterSources(new Set()); setFilterAudiences(new Set()); }} className="text-[11px] text-[#6bb8d4] hover:text-[#1e2235] transition-colors">
                      초기화
                    </button>
                  )}
                </div>
                <p className="text-[11px] font-bold text-[#8a9bbd] uppercase tracking-wide mb-2">소스</p>
                <div className="flex flex-col gap-1.5 mb-4">
                  {allSources.map((src) => (
                    <label key={src} className="flex items-center gap-2 cursor-pointer group">
                      <input type="checkbox" checked={filterSources.has(src)} onChange={() => toggleSource(src)} className="w-3.5 h-3.5 accent-[#6bb8d4]" />
                      <span className="text-[13px] text-[#3d4f6e] group-hover:text-[#1e2235] transition-colors">{src}</span>
                    </label>
                  ))}
                </div>
                <p className="text-[11px] font-bold text-[#8a9bbd] uppercase tracking-wide mb-2">직군</p>
                <div className="flex flex-col gap-1.5">
                  {AUDIENCES.map((aud) => (
                    <label key={aud} className="flex items-center gap-2 cursor-pointer group">
                      <input type="checkbox" checked={filterAudiences.has(aud)} onChange={() => toggleAudience(aud)} className="w-3.5 h-3.5 accent-[#6bb8d4]" />
                      <span className="text-[13px] text-[#3d4f6e] group-hover:text-[#1e2235] transition-colors">{aud}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 결과 수 */}
          {!loading && (
            <span className="text-[12px] text-[#a8b8d0] shrink-0 hidden md:block">{filtered.length}건</span>
          )}

          {/* 뷰 토글 */}
          <div className="flex border border-[#e8eaed] rounded-lg overflow-hidden ml-auto">
            <button onClick={() => setViewMode("grid")} className={`px-3 py-2 text-[14px] transition-colors ${viewMode === "grid" ? "bg-[#1e2235] text-white" : "bg-white text-[#3d4f6e] hover:bg-[#f5f6f8]"}`} title="카드 보기">⊞</button>
            <button onClick={() => setViewMode("list")} className={`px-3 py-2 text-[14px] transition-colors ${viewMode === "list" ? "bg-[#1e2235] text-white" : "bg-white text-[#3d4f6e] hover:bg-[#f5f6f8]"}`} title="리스트 보기">☰</button>
          </div>
        </div>
      </div>

      {/* 최근 주요 뉴스 */}
      <div className="max-w-[1200px] mx-auto px-6 md:px-16 lg:px-[120px] py-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-[16px] text-[#1e2235]">최근 주요 뉴스</h2>
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
            {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : news.length === 0 ? (
          <div className="text-center py-12 text-[#a8b8d0]">
            <p className="text-[14px]">아직 수집된 뉴스가 없습니다.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {highlightNews.map((item) => (
              <NewsCard key={item.id} item={item} onClick={setSelectedItem} />
            ))}
          </div>
        )}
      </div>

      {/* 심각도 범례 */}
      <div className="max-w-[1200px] mx-auto px-6 md:px-16 lg:px-[120px] pt-6 pb-0">
        <div className="flex items-center gap-4 flex-wrap">
          {SEVERITY_LEGEND.map((s) => (
            <div key={s.label} className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: s.color }} />
              <span className="text-[12px] font-semibold" style={{ color: s.color }}>{s.label}</span>
              <span className="text-[11px] text-[#a8b8d0]">{s.desc}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 기사 목록 */}
      <div className="max-w-[1200px] mx-auto px-6 md:px-16 lg:px-[120px] py-6">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24 text-[#a8b8d0]">
            <p className="text-[18px]">
              {searchQuery ? `"${searchQuery}" 검색 결과가 없습니다.` : "조건에 맞는 뉴스가 없습니다."}
            </p>
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((item) => (
              <NewsCard key={item.id} item={item} onClick={setSelectedItem} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-[#e8eaed] overflow-hidden">
            {filtered.map((item) => (
              <NewsListItem key={item.id} item={item} onClick={setSelectedItem} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
```

(변경 요약: "전체보기" 토글 버튼 블록과 `{expanded && (<>...</>)}` 래퍼를 제거하고, 툴바 블록을 Hero 바로 다음으로 옮기고, "최근 주요 뉴스" 섹션을 툴바 다음·심각도 범례 이전으로 옮겼다. 툴바/범례/목록 내부 JSX와 로직은 한 글자도 바꾸지 않았다.)

- [ ] **Step 3: 타입 체크**

Run: `cd /home/mskang/cloud/web && npx tsc --noEmit`
Expected: 에러 없음 (`expanded`/`setExpanded` 미사용 참조 에러 없어야 함)

- [ ] **Step 4: 빌드 확인**

Run: `cd /home/mskang/cloud/web && npm run build`
Expected: 빌드 성공, `/news` 라우트 에러 없음

- [ ] **Step 5: Lint 확인**

Run: `cd /home/mskang/cloud/web && npm run lint`
Expected: 에러 없음

- [ ] **Step 6: 개발 서버에서 수동 확인**

Run: `cd /home/mskang/cloud/web && npm run dev` (백그라운드 실행 후 브라우저로 `http://localhost:3000/news` 접속)
확인 항목:
- Hero 제목이 "최신 보안 뉴스"로 보이는지
- Hero 바로 아래에 검색/정렬/필터/뷰토글 툴바가 토글 없이 바로 보이는지
- 그 아래 "최근 주요 뉴스" 섹션에 최대 6개 카드가 보이고, critical/high 등급이 있다면 상단에 오는지
- 검색창에 키워드를 입력하면 "최근 주요 뉴스" 섹션은 그대로 유지되고, 하단 "기사 목록"만 필터링되는지 (필터 독립성 확인)
- 심각도 범례와 기사 목록(그리드/리스트 토글 포함)이 페이지 로드 시 항상 보이는지 (더 이상 "전체보기" 버튼이 없는지)
- 새로고침 버튼 클릭 시 아이콘이 회전하고 "최근 주요 뉴스"가 재조회되는지

- [ ] **Step 7: Commit**

```bash
git add src/app/news/page.tsx
git commit -m "Feat : 전체보기 토글 제거하고 필터 툴바를 상단에 항상 노출"
```
