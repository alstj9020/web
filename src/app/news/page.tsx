"use client";

import { useState, useEffect } from "react";
import type { NewsDisplayItem, AudienceLabel } from "@/types/news";
import NewsCard from "@/components/news/NewsCard";
import NewsListItem from "@/components/news/NewsListItem";
import NewsDetailModal from "@/components/news/NewsDetailModal";
import SkeletonCard from "@/components/news/SkeletonCard";

const TABS = ["전체", "일반인", "개발자", "보안직군"] as const;
type Tab = (typeof TABS)[number];

const TAB_KEY: Record<Tab, AudienceLabel | null> = {
  전체: null,
  일반인: "일반인",
  개발자: "개발자",
  보안직군: "보안직군",
};

export default function NewsPage() {
  const [activeTab, setActiveTab] = useState<Tab>("전체");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [news, setNews] = useState<NewsDisplayItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<NewsDisplayItem | null>(null);

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

  const tabKey = TAB_KEY[activeTab];
  const filtered = news
    .filter((n) => !tabKey || n.recommendedFor.includes(tabKey))
    .filter((n) => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        n.title.toLowerCase().includes(q) ||
        n.excerpt.toLowerCase().includes(q) ||
        n.cveIds.some((c) => c.toLowerCase().includes(q)) ||
        n.techStack.some((t) => t.toLowerCase().includes(q))
      );
    });

  const countFor = (tab: Tab) => {
    const key = TAB_KEY[tab];
    return key ? news.filter((n) => n.recommendedFor.includes(key)).length : news.length;
  };

  return (
    <main className="min-h-screen bg-[#f5f6f8]">
      <NewsDetailModal item={selectedItem} onClose={() => setSelectedItem(null)} />

      <section className="bg-[#1e2235] px-6 md:px-16 lg:px-[120px] py-12 md:py-16">
        <div className="max-w-[1200px] mx-auto">
          <p className="text-[#6bb8d4] text-[13px] font-medium tracking-wider mb-3">News Feed</p>
          <h1 className="font-black text-3xl md:text-[44px] text-[#f5f6f8] leading-tight mb-3">
            오늘의 보안 뉴스
          </h1>
          <p className="text-[#a8d8ea] text-base md:text-[18px]">
            {new Date().toLocaleDateString("ko-KR", {
              year: "numeric",
              month: "long",
              day: "numeric",
              weekday: "long",
            })}{" "}
            기준
          </p>
        </div>
      </section>

      <div className="bg-white border-b border-[#e8eaed] sticky top-16 z-40">
        <div className="max-w-[1200px] mx-auto px-6 md:px-16 lg:px-[120px] flex items-center gap-2">
          {/* 탭 (좌측) */}
          <div className="flex gap-1 overflow-x-auto flex-1">
            {TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-5 py-4 text-[14px] font-medium whitespace-nowrap border-b-2 transition-colors ${
                  activeTab === tab
                    ? "border-[#6bb8d4] text-[#6bb8d4]"
                    : "border-transparent text-[#3d4f6e] hover:text-[#1e2235]"
                }`}
              >
                {tab}
                <span className="ml-1.5 text-[12px] text-[#a8b8d0]">
                  ({loading ? "–" : countFor(tab)})
                </span>
              </button>
            ))}
          </div>

          {/* 검색 + 뷰 토글 (우측, 데스크탑만) */}
          <div className="hidden md:flex items-center gap-2 shrink-0 py-2">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="제목, CVE, 기술스택..."
                className="w-48 pl-9 pr-3 py-2 text-[13px] border border-[#e8eaed] rounded-xl bg-white text-[#1e2235] placeholder-[#c0ccd8] focus:outline-none focus:border-[#6bb8d4] focus:shadow-[0_0_0_3px_rgba(107,184,212,0.15)] transition-all shadow-sm"
              />
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#a8b8d0]" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
              </svg>
              {searchQuery && (
                <button onClick={() => setSearchQuery("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#a8b8d0] hover:text-[#3d4f6e] text-[14px] leading-none">✕</button>
              )}
            </div>

            <div className="flex border border-[#e8eaed] rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode("grid")}
                className={`px-3 py-1.5 text-[14px] transition-colors ${
                  viewMode === "grid" ? "bg-[#1e2235] text-white" : "bg-white text-[#3d4f6e] hover:bg-[#f5f6f8]"
                }`}
                title="카드 보기"
              >
                ⊞
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`px-3 py-1.5 text-[14px] transition-colors ${
                  viewMode === "list" ? "bg-[#1e2235] text-white" : "bg-white text-[#3d4f6e] hover:bg-[#f5f6f8]"
                }`}
                title="리스트 보기"
              >
                ☰
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-6 md:px-16 lg:px-[120px] py-10">
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
              {searchQuery ? `"${searchQuery}" 검색 결과가 없습니다.` : "해당 직군의 뉴스가 없습니다."}
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
