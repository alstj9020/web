import { NextResponse } from "next/server";
import {
  listEnrichedKeys,
  fetchEnrichedBatch,
  getSourceName,
  mapSeverity,
  isToday,
  type TaggedNews,
  type EnrichedEntry,
} from "@/lib/s3News";
import type { DashboardStats } from "@/types/news";

export const revalidate = 300;

const MAX_BATCH_FILES = 10;

export async function GET() {
  try {
    const allEntries = await listEnrichedKeys();

    if (allEntries.length === 0) {
      return NextResponse.json(emptyStats());
    }

    // 소스별 현황 — JSON 읽기 불필요, S3 메타데이터만 활용
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

    // 최신 배치 파일들 읽기
    const topEntries = allEntries
      .sort((a, b) => b.lastModified.getTime() - a.lastModified.getTime())
      .slice(0, MAX_BATCH_FILES);

    // 배치 파일별 fetch 결과를 (배치메타 + 아이템[]) 쌍으로 유지
    const batches: { entry: EnrichedEntry; items: TaggedNews[] }[] = await Promise.all(
      topEntries.map(async (entry) => ({
        entry,
        items: await fetchEnrichedBatch(entry),
      }))
    );

    // 오늘(KST) enriched_at인 배치의 아이템 수 합산
    const collectedToday = batches
      .filter(({ entry }) => isToday(entry.lastModified))
      .reduce((sum, { items }) => sum + items.length, 0);

    // 전체 아이템 flatten
    const allItems = batches.flatMap(({ items }) => items);

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
        title: item.title,
        cvss: item.severity.cvss_score,
        severity: mapSeverity(item.severity.label),
        source: getSourceName(item._source),
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
