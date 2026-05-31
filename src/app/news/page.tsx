"use client";

import { useState, useEffect } from "react";
import type { NewsDisplayItem, SeverityLabel, AudienceLabel } from "@/types/news";

const SEVERITY_STYLE: Record<SeverityLabel, string> = {
  Critical: "bg-[#ef4444] text-white",
  High: "bg-[#f97316] text-white",
  Medium: "bg-[#f59e0b] text-[#1e2235]",
  Low: "bg-[#22c55e] text-white",
  Info: "bg-[#6b7280] text-white",
};

const TABS = ["전체", "일반인", "개발자", "보안직군"] as const;
type Tab = (typeof TABS)[number];

const TAB_KEY: Record<Tab, AudienceLabel | null> = {
  전체: null,
  일반인: "일반인",
  개발자: "개발자",
  보안직군: "보안직군",
};

function NewsCard({ item }: { item: NewsDisplayItem }) {
  return (
    <div className="bg-white rounded-2xl border border-[#e8eaed] overflow-hidden flex flex-col hover:shadow-md transition-shadow">
      <div className="bg-[#1e2235] px-5 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={`px-2 py-0.5 rounded-md text-[11px] font-bold ${SEVERITY_STYLE[item.severity]}`}>
            {item.severity}
          </span>
          {item.cvss !== null && (
            <span className="text-[#a8d8ea] text-[11px] font-medium">CVSS {item.cvss}</span>
          )}
          {item.kevListed && (
            <span className="bg-[#ef4444]/20 text-[#ef4444] text-[10px] font-bold px-1.5 py-0.5 rounded">KEV</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {item.sourceCount > 1 && (
            <span className="text-[#6bb8d4] text-[11px]">출처 {item.sourceCount}개</span>
          )}
          <span className="text-[#8a9bbd] text-[11px]">{item.source}</span>
        </div>
      </div>

      <div className="flex flex-col gap-3 p-5 flex-1">
        {item.cveIds.length > 0 && (
          <p className="text-[#6bb8d4] text-[12px] font-medium">
            {item.cveIds.slice(0, 2).join(" · ")}
            {item.cveIds.length > 2 && ` 外 ${item.cveIds.length - 2}건`}
          </p>
        )}
        <h3 className="font-bold text-[16px] text-[#1e2235] leading-snug">{item.title}</h3>
        <p className="text-[#3d4f6e] text-[13px] leading-[1.7] flex-1 line-clamp-4">{item.excerpt}</p>

        {item.action && (
          <div className="bg-[#f5f6f8] rounded-lg px-4 py-3 mt-1">
            <p className="text-[#3d4f6e] text-[12px]">
              <span className="font-bold text-[#6bb8d4]">대응 :</span> {item.action}
            </p>
          </div>
        )}
      </div>

      <div className="px-5 pb-4 flex items-center justify-between flex-wrap gap-2">
        <div className="flex gap-1.5 flex-wrap">
          {item.recommendedFor.map((aud) => (
            <span key={aud} className="bg-[#e8eaed] text-[#3d4f6e] text-[11px] font-bold px-2.5 py-1 rounded-lg">
              {aud}
            </span>
          ))}
        </div>
        <span className="text-[#a8b8d0] text-[11px]">
          {item.publishedAt
            ? new Date(item.publishedAt).toLocaleDateString("ko-KR", { month: "short", day: "numeric" })
            : item.affected[0]?.vendor ?? ""}
        </span>
      </div>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl border border-[#e8eaed] overflow-hidden animate-pulse">
      <div className="bg-[#1e2235] h-10" />
      <div className="p-5 flex flex-col gap-3">
        <div className="h-3 bg-[#e8eaed] rounded w-1/3" />
        <div className="h-5 bg-[#e8eaed] rounded w-4/5" />
        <div className="h-3 bg-[#e8eaed] rounded w-full" />
        <div className="h-3 bg-[#e8eaed] rounded w-3/4" />
        <div className="h-10 bg-[#f5f6f8] rounded-lg mt-1" />
      </div>
    </div>
  );
}

export default function NewsPage() {
  const [activeTab, setActiveTab] = useState<Tab>("전체");
  const [news, setNews] = useState<NewsDisplayItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
  const filtered = tabKey
    ? news.filter((n) => n.recommendedFor.includes(tabKey))
    : news;

  const countFor = (tab: Tab) => {
    const key = TAB_KEY[tab];
    return key ? news.filter((n) => n.recommendedFor.includes(key)).length : news.length;
  };

  return (
    <main className="min-h-screen bg-[#f5f6f8]">
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
        <div className="max-w-[1200px] mx-auto px-6 md:px-16 lg:px-[120px] flex gap-1 overflow-x-auto">
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
            <p className="text-[18px]">해당 직군의 뉴스가 없습니다.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((item) => (
              <NewsCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
