import { NextResponse } from "next/server";
import {
  scanAllNews,
  getSourceName,
  mapSeverity,
  isToday,
} from "@/lib/dynamoNews";
import type { DashboardStats } from "@/types/news";

export const revalidate = 0;

export async function GET() {
  try {
    const allItems = await scanAllNews();

    if (allItems.length === 0) {
      return NextResponse.json(emptyStats());
    }

    // 소스별 현황 — item.source + fetched_at 기준
    const sourceMap = new Map<string, { count: number; lastSeen: Date }>();
    for (const item of allItems) {
      const lastSeen = new Date(item.fetched_at);
      const curr = sourceMap.get(item.source);
      sourceMap.set(item.source, {
        count: (curr?.count ?? 0) + 1,
        lastSeen: curr && curr.lastSeen >= lastSeen ? curr.lastSeen : lastSeen,
      });
    }

    const now = Date.now();
    const sources: DashboardStats["sources"] = [...sourceMap.entries()].map(
      ([key, val]) => ({
        name: getSourceName(key),
        count: val.count,
        lastSeen: val.lastSeen.toISOString(),
        active: now - val.lastSeen.getTime() < 24 * 60 * 60 * 1000,
      })
    );

    // 오늘(KST) fetched_at인 아이템 수
    const collectedToday = allItems.filter((item) => isToday(item.fetched_at)).length;

    // severity 분포 집계
    const severityDist: DashboardStats["severityDist"] = {
      critical: 0, high: 0, medium: 0, low: 0, info: 0,
    };
    let criticalCount = 0;
    let kevCount = 0;

    for (const item of allItems) {
      const label = item.severity.label?.toLowerCase() as keyof typeof severityDist;
      if (label in severityDist) {
        severityDist[label]++;
        if (label === "critical") criticalCount++;
      }
      if (item.identifiers.kev_listed) kevCount++;
    }

    // 최근 주요 CVE — CVSS 6.0 이상, 상위 10개
    const recentCVEs: DashboardStats["recentCVEs"] = allItems
      .filter(
        (item) =>
          (item.severity.cvss_score ?? 0) >= 6.0 &&
          item.identifiers.cve_ids.length > 0
      )
      .sort((a, b) => (b.severity.cvss_score ?? 0) - (a.severity.cvss_score ?? 0))
      .slice(0, 10)
      .map((item) => ({
        cveId: item.identifiers.cve_ids[0],
        title: item.title_ko ?? item.title,
        cvss: item.severity.cvss_score,
        severity: mapSeverity(item.severity.label),
        source: getSourceName(item.source),
      }));

    return NextResponse.json({
      collectedToday,
      criticalCount,
      kevCount,
      severityDist,
      sources,
      recentCVEs,
      subscribers: null,
      emailsSentToday: null,
    } satisfies DashboardStats);
  } catch (error) {
    console.error("[api/stats] error:", error);
    return NextResponse.json(
      { error: "통계를 불러오는 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

function emptyStats(): DashboardStats {
  return {
    collectedToday: 0,
    criticalCount: 0,
    kevCount: 0,
    severityDist: { critical: 0, high: 0, medium: 0, low: 0, info: 0 },
    sources: [],
    recentCVEs: [],
    subscribers: null,
    emailsSentToday: null,
  };
}
