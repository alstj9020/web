import { NextResponse } from "next/server";
import {
  listEnrichedKeys,
  fetchEnrichedJson,
  getSourceName,
  mapSeverity,
  deriveTitle,
  SEVERITY_ORDER,
  type TaggedNews,
} from "@/lib/s3News";
import type { ProcessedNews, NewsDisplayItem, AudienceLabel } from "@/types/news";

export const revalidate = 300;

const MAX_FETCH = 100;

const AUDIENCE_MAP: Record<string, AudienceLabel> = {
  general: "일반인", developer: "개발자", security: "보안직군",
};

/** CVE ID 공유 여부 기준 중복 그룹핑 */
function deduplicateByCve(items: TaggedNews[]): TaggedNews[][] {
  const cveToGroup = new Map<string, string>();
  const groups = new Map<string, TaggedNews[]>();
  const noCveGroups: TaggedNews[][] = [];

  for (const item of items) {
    const cveIds = item.identifiers.cve_ids;

    if (cveIds.length === 0) {
      noCveGroups.push([item]);
      continue;
    }

    let groupKey: string | undefined;
    for (const cve of cveIds) {
      if (cveToGroup.has(cve)) { groupKey = cveToGroup.get(cve)!; break; }
    }

    if (!groupKey) {
      groupKey = cveIds[0];
      groups.set(groupKey, []);
    }

    groups.get(groupKey)!.push(item);
    for (const cve of cveIds) cveToGroup.set(cve, groupKey);
  }

  return [...groups.values(), ...noCveGroups];
}

function mergeGroup(group: TaggedNews[]): TaggedNews {
  const best = group.reduce((a, b) => {
    const aOrd = SEVERITY_ORDER[a.severity.label] ?? 5;
    const bOrd = SEVERITY_ORDER[b.severity.label] ?? 5;
    if (aOrd !== bOrd) return aOrd < bOrd ? a : b;
    return (a.severity.cvss_score ?? 0) >= (b.severity.cvss_score ?? 0) ? a : b;
  });

  const seen = new Set<string>();
  const mergedAffected = group
    .flatMap((item) => item.affected)
    .filter((a) => {
      const k = `${a.vendor}|${a.product}`;
      if (seen.has(k)) return false;
      seen.add(k);
      return true;
    });

  return { ...best, affected: mergedAffected };
}

function toDisplayItem(item: TaggedNews, sourceCount: number): NewsDisplayItem {
  const allCveIds = [...new Set(item.identifiers.cve_ids)];

  const recommendedFor = (item.audience.recommended_for ?? [])
    .map((a) => AUDIENCE_MAP[a])
    .filter(Boolean) as AudienceLabel[];

  const primary: AudienceLabel = AUDIENCE_MAP[item.audience.primary] ?? "보안직군";

  return {
    id: allCveIds[0] ?? item._key,
    title: deriveTitle(item as ProcessedNews),
    excerpt: item.summary,
    severity: mapSeverity(item.severity.label),
    cvss: item.severity.cvss_score,
    cveIds: allCveIds,
    action: item.action.remediation ?? item.action.required_action ?? "",
    source: getSourceName(item._source),
    sourceCount,
    audience: primary,
    recommendedFor: recommendedFor.length > 0 ? recommendedFor : [primary],
    affected: item.affected.map((a) => ({
      vendor: a.vendor,
      product: a.product,
      versions_fixed: a.versions_fixed,
    })),
    kevListed: item.identifiers.kev_listed,
    ransomwareKnown: item.identifiers.ransomware_known,
  };
}

export async function GET() {
  try {
    const allEntries = await listEnrichedKeys();

    const topEntries = allEntries
      .sort((a, b) => b.lastModified.getTime() - a.lastModified.getTime())
      .slice(0, MAX_FETCH);

    const rawItems = (await Promise.all(topEntries.map(fetchEnrichedJson))).filter(
      (item): item is TaggedNews => item !== null
    );

    const groups = deduplicateByCve(rawItems);
    const displayItems = groups
      .map((group) => toDisplayItem(mergeGroup(group), group.length))
      .sort(
        (a, b) =>
          (SEVERITY_ORDER[a.severity.toLowerCase()] ?? 5) -
          (SEVERITY_ORDER[b.severity.toLowerCase()] ?? 5)
      );

    return NextResponse.json(displayItems);
  } catch (error) {
    console.error("[api/news] S3 fetch error:", error);
    return NextResponse.json(
      { error: "뉴스를 불러오는 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
