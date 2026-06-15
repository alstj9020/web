"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import type { NewsDisplayItem, AudienceLabel } from "@/types/news";
import NewsCard from "@/components/news/NewsCard";
import NewsListItem from "@/components/news/NewsListItem";
import NewsDetailModal from "@/components/news/NewsDetailModal";
import SkeletonCard from "@/components/news/SkeletonCard";

type SortBy = "date-desc" | "date-asc" | "severity" | "cvss";

const SORT_OPTIONS: { value: SortBy; label: string }[] = [
  { value: "date-desc", label: "최신순" },
  { value: "date-asc", label: "오래된순" },
  { value: "severity", label: "심각도 높은순" },
  { value: "cvss", label: "CVSS 높은순" },
];

const SEVERITY_RANK: Record<string, number> = {
  critical: 0, high: 1, medium: 2, low: 3, info: 4,
};

const SEVERITY_LEGEND = [
  { label: "Critical", color: "#ef4444", desc: "즉시 대응 필요" },
  { label: "High", color: "#f97316", desc: "빠른 패치 권장" },
  { label: "Medium", color: "#f59e0b", desc: "계획적 대응" },
  { label: "Low", color: "#22c55e", desc: "낮은 위험도" },
  { label: "Info", color: "#6b7280", desc: "참고 정보" },
];

const AUDIENCES: AudienceLabel[] = ["일반인", "개발자", "보안직군"];

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
  const [error, setError] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<NewsDisplayItem | null>(null);
  const filterRef = useRef<HTMLDivElement>(null);
  const sortRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/news")
      .then((res) => {
        if (!res.ok) throw new Error("뉴스를 불러오지 못했습니다.");
        return res.json() as Promise<NewsDisplayItem[]>;
      })
      .then((data) => setNews(data))
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) setFilterOpen(false);
      if (sortRef.current && !sortRef.current.contains(e.target as Node)) setSortOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const allSources = useMemo(
    () => [...new Set(news.map((n) => n.source))].sort(),
    [news]
  );

  const filtered = useMemo(() => {
    let items = news;
    if (filterSources.size > 0) items = items.filter((n) => filterSources.has(n.source));
    if (filterAudiences.size > 0) items = items.filter((n) => n.recommendedFor.some((a) => filterAudiences.has(a)));
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      items = items.filter(
        (n) =>
          n.title.toLowerCase().includes(q) ||
          n.excerpt.toLowerCase().includes(q) ||
          n.cveIds.some((c) => c.toLowerCase().includes(q)) ||
          n.techStack.some((t) => t.toLowerCase().includes(q))
      );
    }
    return [...items].sort((a, b) => {
      switch (sortBy) {
        case "date-asc": return new Date(a.publishedAt).getTime() - new Date(b.publishedAt).getTime();
        case "severity": return (SEVERITY_RANK[a.severity.toLowerCase()] ?? 5) - (SEVERITY_RANK[b.severity.toLowerCase()] ?? 5);
        case "cvss": return (b.cvss ?? -1) - (a.cvss ?? -1);
        default: return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
      }
    });
  }, [news, filterSources, filterAudiences, searchQuery, sortBy]);

  const activeFilterCount = filterSources.size + filterAudiences.size;
  const currentSortLabel = SORT_OPTIONS.find((o) => o.value === sortBy)?.label ?? "최신순";

  function toggleSource(source: string) {
    setFilterSources((prev) => { const n = new Set(prev); n.has(source) ? n.delete(source) : n.add(source); return n; });
  }
  function toggleAudience(aud: AudienceLabel) {
    setFilterAudiences((prev) => { const n = new Set(prev); n.has(aud) ? n.delete(aud) : n.add(aud); return n; });
  }

  return (
    <main className="min-h-screen bg-[#f5f6f8]">
      <NewsDetailModal item={selectedItem} onClose={() => setSelectedItem(null)} />

      <section className="bg-[#1e2235] px-6 md:px-16 lg:px-[120px] py-6 md:py-8">
        <div className="max-w-[1200px] mx-auto">
          <p className="text-[#6bb8d4] text-[12px] font-medium tracking-wider mb-2">News Feed</p>
          <h1 className="font-black text-2xl md:text-[32px] text-[#f5f6f8] leading-tight mb-2">
            오늘의 보안 뉴스
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
        {error ? (
          <div className="text-center py-24">
            <p className="text-[#ef4444] text-[16px] mb-2">데이터를 불러오지 못했습니다.</p>
            <p className="text-[#a8b8d0] text-[13px]">{error}</p>
          </div>
        ) : loading ? (
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
