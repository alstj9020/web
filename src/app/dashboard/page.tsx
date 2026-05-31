"use client";

import { useState, useEffect } from "react";
import type { DashboardStats, SeverityLabel } from "@/types/news";

const SEVERITY_BADGE: Record<SeverityLabel, string> = {
  Critical: "bg-[#ef4444] text-white",
  High: "bg-[#f97316] text-white",
  Medium: "bg-[#f59e0b] text-[#1e2235]",
  Low: "bg-[#22c55e] text-white",
  Info: "bg-[#6b7280] text-white",
};

const SEVERITY_COLOR: Record<string, string> = {
  critical: "#ef4444",
  high: "#f97316",
  medium: "#f59e0b",
  low: "#22c55e",
  info: "#6b7280",
};

function StatCard({
  label,
  value,
  unit,
  pending,
}: {
  label: string;
  value: number | null;
  unit: string;
  pending?: boolean;
}) {
  return (
    <div className="bg-white rounded-2xl border border-[#e8eaed] px-5 py-5 flex flex-col gap-2">
      <p className="text-[#3d4f6e] text-[13px]">{label}</p>
      <div className="flex items-baseline gap-1">
        {pending || value === null ? (
          <span className="font-black text-[28px] md:text-[32px] text-[#a8b8d0]">–</span>
        ) : (
          <>
            <span className="font-black text-[28px] md:text-[32px] text-[#1e2235]">
              {value.toLocaleString()}
            </span>
            <span className="text-[#3d4f6e] text-[13px]">{unit}</span>
          </>
        )}
      </div>
      {pending && (
        <span className="text-[12px] text-[#a8b8d0]">백엔드 연동 후 제공</span>
      )}
    </div>
  );
}

function SkeletonBlock({ className }: { className: string }) {
  return <div className={`bg-[#e8eaed] rounded animate-pulse ${className}`} />;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/stats")
      .then((res) => {
        if (!res.ok) throw new Error("통계를 불러오지 못했습니다.");
        return res.json() as Promise<DashboardStats>;
      })
      .then((data) => setStats(data))
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const severityTotal = stats
    ? Object.values(stats.severityDist).reduce((s, n) => s + n, 0)
    : 0;

  return (
    <main className="min-h-screen bg-[#f5f6f8]">
      <section className="bg-[#1e2235] px-6 md:px-16 lg:px-[120px] py-12 md:py-16">
        <div className="max-w-[1200px] mx-auto">
          <p className="text-[#6bb8d4] text-[13px] font-medium tracking-wider mb-3">Dashboard</p>
          <h1 className="font-black text-3xl md:text-[44px] text-[#f5f6f8] leading-tight mb-3">
            보안 현황 대시보드
          </h1>
          <p className="text-[#a8d8ea] text-base md:text-[18px]">
            {new Date().toLocaleDateString("ko-KR", {
              year: "numeric", month: "long", day: "numeric", weekday: "long",
            })}{" "}기준
          </p>
        </div>
      </section>

      <div className="max-w-[1200px] mx-auto px-6 md:px-16 lg:px-[120px] py-10 flex flex-col gap-8">

        {error && (
          <div className="bg-white rounded-2xl border border-[#e8eaed] px-6 py-5 text-center">
            <p className="text-[#ef4444] text-[15px] mb-1">데이터를 불러오지 못했습니다.</p>
            <p className="text-[#a8b8d0] text-[13px]">{error}</p>
          </div>
        )}

        {/* 통계 카드 */}
        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-[#e8eaed] px-5 py-5 flex flex-col gap-3">
                <SkeletonBlock className="h-3 w-24" />
                <SkeletonBlock className="h-8 w-16" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard label="오늘 수집된 이슈" value={stats?.collectedToday ?? 0} unit="건" />
            <StatCard label="Critical CVE" value={stats?.criticalCount ?? 0} unit="건" />
            <StatCard label="오늘 발송 완료" value={null} unit="건" pending />
            <StatCard label="누적 구독자" value={null} unit="명" pending />
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* CVE 심각도 분포 */}
          <div className="bg-white rounded-2xl border border-[#e8eaed] p-6">
            <h2 className="font-bold text-[18px] text-[#1e2235] mb-1">CVE 심각도 분포</h2>
            <p className="text-[#3d4f6e] text-[13px] mb-6">
              최근 수집 {loading ? "–" : severityTotal}건 기준
            </p>

            {loading ? (
              <div className="flex flex-col gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <SkeletonBlock className="h-3 w-16" />
                    <SkeletonBlock className="flex-1 h-3" />
                    <SkeletonBlock className="h-3 w-8" />
                  </div>
                ))}
              </div>
            ) : severityTotal === 0 ? (
              <p className="text-[#a8b8d0] text-[14px] py-6 text-center">
                수집된 데이터가 없습니다.
              </p>
            ) : (
              <>
                <div className="flex flex-col gap-4">
                  {(["critical", "high", "medium", "low"] as const).map((key) => {
                    const count = stats?.severityDist[key] ?? 0;
                    const pct = severityTotal > 0 ? (count / severityTotal) * 100 : 0;
                    return (
                      <div key={key} className="flex items-center gap-3">
                        <span className="text-[13px] font-medium text-[#3d4f6e] w-16 shrink-0 capitalize">
                          {key.charAt(0).toUpperCase() + key.slice(1)}
                        </span>
                        <div className="flex-1 bg-[#e8eaed] rounded-full h-3 overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all"
                            style={{ width: `${pct}%`, background: SEVERITY_COLOR[key] }}
                          />
                        </div>
                        <span className="text-[13px] font-bold text-[#1e2235] w-8 text-right shrink-0">
                          {count}
                        </span>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-6 pt-5 border-t border-[#e8eaed] flex gap-4 flex-wrap">
                  {(["critical", "high", "medium", "low"] as const).map((key) => {
                    const count = stats?.severityDist[key] ?? 0;
                    const pct = severityTotal > 0 ? Math.round((count / severityTotal) * 100) : 0;
                    return (
                      <div key={key} className="flex items-center gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ background: SEVERITY_COLOR[key] }} />
                        <span className="text-[12px] text-[#3d4f6e] capitalize">
                          {key.charAt(0).toUpperCase() + key.slice(1)}{" "}
                          <strong>{pct}%</strong>
                        </span>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>

          {/* 수집 소스 현황 */}
          <div className="bg-white rounded-2xl border border-[#e8eaed] p-6">
            <h2 className="font-bold text-[18px] text-[#1e2235] mb-1">수집 소스 현황</h2>
            <p className="text-[#3d4f6e] text-[13px] mb-6">크롤링 소스별 수집 현황</p>

            {loading ? (
              <div className="flex flex-col gap-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex items-center justify-between py-2.5 border-b border-[#f5f6f8]">
                    <SkeletonBlock className="h-4 w-32" />
                    <SkeletonBlock className="h-4 w-16" />
                  </div>
                ))}
              </div>
            ) : (stats?.sources ?? []).length === 0 ? (
              <p className="text-[#a8b8d0] text-[14px] py-6 text-center">
                수집된 소스가 없습니다.
              </p>
            ) : (
              <div className="flex flex-col gap-3">
                {(stats?.sources ?? []).map(({ name, count, active }) => (
                  <div
                    key={name}
                    className="flex items-center justify-between py-2.5 border-b border-[#f5f6f8] last:border-0"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-2 h-2 rounded-full ${active ? "bg-[#22c55e]" : "bg-[#f59e0b]"}`}
                      />
                      <span className="text-[14px] text-[#1e2235] font-medium">{name}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-[13px] text-[#3d4f6e]">{count}건</span>
                      <span
                        className={`text-[11px] px-2 py-0.5 rounded-md font-medium ${
                          active
                            ? "text-[#22c55e] bg-[#f0fdf4]"
                            : "text-[#f59e0b] bg-[#fffbeb]"
                        }`}
                      >
                        {active ? "정상" : "점검중"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 최근 주요 CVE 테이블 */}
        <div className="bg-white rounded-2xl border border-[#e8eaed] overflow-hidden">
          <div className="px-6 py-5 border-b border-[#e8eaed]">
            <h2 className="font-bold text-[18px] text-[#1e2235]">최근 주요 CVE</h2>
            <p className="text-[#3d4f6e] text-[13px] mt-0.5">CVSS 6.0 이상 최신 취약점</p>
          </div>

          {loading ? (
            <div className="px-6 py-4 flex flex-col gap-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <SkeletonBlock key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : (stats?.recentCVEs ?? []).length === 0 ? (
            <div className="px-6 py-12 text-center text-[#a8b8d0]">
              <p className="text-[15px]">현재 CVSS 6.0 이상 취약점이 없습니다.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-[#f5f6f8] text-left">
                    {["CVE ID", "제목", "CVSS", "심각도", "출처"].map((h) => (
                      <th
                        key={h}
                        className="px-5 py-3 text-[12px] font-bold text-[#3d4f6e] whitespace-nowrap"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {(stats?.recentCVEs ?? []).map((issue, i) => (
                    <tr
                      key={issue.cveId}
                      className={`border-t border-[#f5f6f8] hover:bg-[#fafbfc] transition-colors ${
                        i % 2 === 0 ? "" : "bg-[#fafbfc]"
                      }`}
                    >
                      <td className="px-5 py-4 text-[13px] text-[#6bb8d4] font-medium whitespace-nowrap">
                        {issue.cveId}
                      </td>
                      <td className="px-5 py-4 text-[13px] text-[#1e2235] font-medium max-w-[240px]">
                        {issue.title}
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-[13px] font-bold text-[#1e2235]">
                          {issue.cvss ?? "–"}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`px-2 py-0.5 rounded-md text-[11px] font-bold ${SEVERITY_BADGE[issue.severity]}`}
                        >
                          {issue.severity}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-[12px] text-[#3d4f6e]">{issue.source}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </main>
  );
}
