import { NextResponse } from "next/server";
import {
  listEnrichedKeys,
  fetchEnrichedJson,
  getSourceName,
  mapSeverity,
  deriveTitle,
  isToday,
  type TaggedNews,
} from "@/lib/s3News";
import type { ProcessedNews, DashboardStats } from "@/types/news";

export const revalidate = 300;

const MAX_READ = 200;

export async function GET() {
  try {
    const allEntries = await listEnrichedKeys();

    // 파일이 하나도 없어도 정상 응답
    if (allEntries.length === 0) {
      return NextResponse.json(emptyStats());
    }

    // 오늘(KST) 수집 건수 — JSON 읽기 불필요, 메타데이터만 활용
    const collectedToday = allEntries.filter((e) => isToday(e.lastModified)).length;

    // 소스별 현황 — JSON 읽기 불필요
    const sourceMap = new Map<string, { count: number; lastSeen: Date }>();
    for (const entry of allEntries) {
      const curr = sourceMap.get(entry.source);
      sourceMap.set(entry.source, {
        count: (curr?.count ?? 0) + 1,
        lastSeen:
          curr && curr.lastSeen >= entry.lastModified
            ? curr.lastSeen
            : entry.lastModified,
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

    // 최신 MAX_READ개 JSON 읽기 — severity 집계 + 최근 CVE 테이블
    const recentEntries = allEntries
      .sort((a, b) => b.lastModified.getTime() - a.lastModified.getTime())
      .slice(0, MAX_READ);

    const items = (
      await Promise.all(recentEntries.map(fetchEnrichedJson))
    ).filter((item): item is TaggedNews => item !== null);

    // severity 분포 집계
    const severityDist: DashboardStats["severityDist"] = {
      critical: 0, high: 0, medium: 0, low: 0, info: 0,
    };
    let criticalCount = 0;
    let kevCount = 0;

    for (const item of items) {
      const label = item.severity.label?.toLowerCase() as keyof typeof severityDist;
      if (label in severityDist) {
        severityDist[label]++;
        if (label === "critical") criticalCount++;
      }
      if (item.identifiers.kev_listed) kevCount++;
    }

    // 최근 주요 CVE — CVSS 6.0 이상, 상위 10개
    const recentCVEs: DashboardStats["recentCVEs"] = items
      .filter(
        (item) =>
          (item.severity.cvss_score ?? 0) >= 6.0 &&
          item.identifiers.cve_ids.length > 0
      )
      .sort((a, b) => (b.severity.cvss_score ?? 0) - (a.severity.cvss_score ?? 0))
      .slice(0, 10)
      .map((item) => ({
        cveId: item.identifiers.cve_ids[0],
        title: deriveTitle(item as ProcessedNews),
        cvss: item.severity.cvss_score,
        severity: mapSeverity(item.severity.label),
        source: getSourceName(item._source),
      }));

    const stats: DashboardStats = {
      collectedToday,
      criticalCount,
      kevCount,
      severityDist,
      sources,
      recentCVEs,
      subscribers: null,
      emailsSentToday: null,
    };

    return NextResponse.json(stats);
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
