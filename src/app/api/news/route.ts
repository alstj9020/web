import { NextResponse } from "next/server";
import {
  scanAllNews,
  getSourceName,
  mapSeverity,
  SEVERITY_ORDER,
} from "@/lib/dynamoNews";
import type { NewsDisplayItem, AudienceLabel, ProcessedNews } from "@/types/news";

export const revalidate = 0;

const AUDIENCE_MAP: Record<string, AudienceLabel> = {
  general: "일반인", developer: "개발자", security: "보안직군",
};

function toDisplayItem(item: ProcessedNews): NewsDisplayItem {
  const cveIds = [...new Set(item.identifiers?.cve_ids ?? [])];
  const recommendedFor = (item.audience?.recommended_for ?? [])
    .map((a) => AUDIENCE_MAP[a])
    .filter(Boolean) as AudienceLabel[];
  const primary: AudienceLabel = AUDIENCE_MAP[item.audience?.primary ?? ""] ?? "보안직군";

  return {
    id: item.id,
    title: item.title_ko ?? item.title,
    excerpt: item.summary ?? "",
    severity: mapSeverity(item.severity?.label),
    cvss: item.severity?.cvss_score ?? null,
    cveIds,
    action: item.action?.steps?.[0] ?? "",
    source: getSourceName(item.source),
    sourceCount: 1,
    audience: primary,
    recommendedFor: recommendedFor.length > 0 ? recommendedFor : [primary],
    affected: (item.affected ?? []).map((a) => ({
      vendor: a.vendor,
      product: a.product,
      versions_fixed: a.versions_fixed,
    })),
    kevListed: item.identifiers?.kev_listed ?? false,
    ransomwareKnown: item.identifiers?.ransomware_known ?? false,
    publishedAt: item.published_at ?? "",
    techStack: item.tags?.tech_stack ?? [],
    sourceUrl: item.source_url ?? "",
  };
}

export async function GET() {
  try {
    const items = await scanAllNews();

    if (items.length === 0) {
      return NextResponse.json([]);
    }

    const displayItems = items
      .flatMap((item) => {
        try {
          return [toDisplayItem(item)];
        } catch (e) {
          console.warn(`[api/news] skipped item id=${item.id}:`, e);
          return [];
        }
      })
      .sort((a, b) => {
        const severityDiff =
          (SEVERITY_ORDER[a.severity.toLowerCase()] ?? 5) -
          (SEVERITY_ORDER[b.severity.toLowerCase()] ?? 5);
        if (severityDiff !== 0) return severityDiff;
        return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
      });

    return NextResponse.json(displayItems);
  } catch (error) {
    console.error("[api/news] error:", error);
    return NextResponse.json(
      { error: "뉴스를 불러오는 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
