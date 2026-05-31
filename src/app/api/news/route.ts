import { NextResponse } from "next/server";
import {
  S3Client,
  ListObjectsV2Command,
  GetObjectCommand,
  type _Object,
} from "@aws-sdk/client-s3";
import type { ProcessedNews, NewsDisplayItem, SeverityLabel, AudienceLabel } from "@/types/news";

export const revalidate = 300; // 5분 캐시

const s3 = new S3Client({ region: process.env.AWS_REGION ?? "ap-northeast-2" });
const BUCKET = "2026-inha-cc-07-s3";
const MAX_FETCH = 100;

const SEVERITY_ORDER: Record<string, number> = {
  critical: 0, high: 1, medium: 2, low: 3, info: 4, unknown: 5,
};

const SEVERITY_MAP: Record<string, SeverityLabel> = {
  critical: "Critical", high: "High", medium: "Medium", low: "Low", info: "Info",
};

const AUDIENCE_MAP: Record<string, AudienceLabel> = {
  general: "일반인", developer: "개발자", security: "보안직군",
};

const SOURCE_NAME_MAP: Record<string, string> = {
  github_advisory: "GitHub Advisory",
  nvd: "NVD",
  cisa: "CISA",
  kisa: "KISA",
};

type EnrichedEntry = { key: string; lastModified: Date; source: string };
type TaggedNews = ProcessedNews & { _source: string; _key: string };

async function listEnrichedKeys(): Promise<EnrichedEntry[]> {
  // 소스 폴더 목록 조회
  const sourcesResp = await s3.send(
    new ListObjectsV2Command({ Bucket: BUCKET, Delimiter: "/" })
  );
  const sourcePrefixes = sourcesResp.CommonPrefixes?.map((p) => p.Prefix!) ?? [];

  const allEntries: EnrichedEntry[] = [];

  await Promise.all(
    sourcePrefixes.map(async (sourcePrefix) => {
      const enrichedPrefix = `${sourcePrefix}enriched/`;
      let continuationToken: string | undefined;

      do {
        const resp = await s3.send(
          new ListObjectsV2Command({
            Bucket: BUCKET,
            Prefix: enrichedPrefix,
            ContinuationToken: continuationToken,
          })
        );

        (resp.Contents ?? [])
          .filter((obj: _Object) => obj.Key?.endsWith(".json"))
          .forEach((obj: _Object) => {
            allEntries.push({
              key: obj.Key!,
              lastModified: obj.LastModified ?? new Date(0),
              source: sourcePrefix.replace(/\/$/, ""),
            });
          });

        continuationToken = resp.IsTruncated ? resp.NextContinuationToken : undefined;
      } while (continuationToken);
    })
  );

  return allEntries;
}

async function fetchJson(entry: EnrichedEntry): Promise<TaggedNews | null> {
  try {
    const resp = await s3.send(new GetObjectCommand({ Bucket: BUCKET, Key: entry.key }));
    const body = await resp.Body?.transformToString();
    if (!body) return null;
    const parsed = JSON.parse(body) as ProcessedNews;
    return { ...parsed, _source: entry.source, _key: entry.key };
  } catch {
    return null;
  }
}

/** CVE ID 기준 중복 제거 (공유 CVE가 있으면 같은 그룹으로 merge) */
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
      if (cveToGroup.has(cve)) {
        groupKey = cveToGroup.get(cve)!;
        break;
      }
    }

    if (!groupKey) {
      groupKey = cveIds[0];
      groups.set(groupKey, []);
    }

    groups.get(groupKey)!.push(item);
    for (const cve of cveIds) {
      cveToGroup.set(cve, groupKey);
    }
  }

  return [...groups.values(), ...noCveGroups];
}

function mergeGroup(group: TaggedNews[]): TaggedNews {
  // CVSS 또는 severity 기준으로 가장 중요한 항목 선택
  const best = group.reduce((a, b) => {
    const aOrd = SEVERITY_ORDER[a.severity.label] ?? 5;
    const bOrd = SEVERITY_ORDER[b.severity.label] ?? 5;
    if (aOrd !== bOrd) return aOrd < bOrd ? a : b;
    return (a.severity.cvss_score ?? 0) >= (b.severity.cvss_score ?? 0) ? a : b;
  });

  // affected 합집합 (vendor+product 기준 중복 제거)
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

function deriveTitle(item: ProcessedNews): string {
  const cves = item.identifiers.cve_ids;
  const vendor = item.affected[0]?.vendor;
  const product = item.affected[0]?.product;

  if (cves.length > 0) {
    const cveLabel = cves.length === 1 ? cves[0] : `${cves[0]} 外 ${cves.length - 1}건`;
    const prefix = vendor ? `${vendor}${product ? ` ${product}` : ""}` : "";
    return prefix ? `${prefix} (${cveLabel})` : cveLabel;
  }

  const first = item.summary.split(/(?<=[.!。])\s/)[0] ?? item.summary;
  return first.length > 60 ? `${first.slice(0, 57)}...` : first;
}

function toDisplayItem(item: TaggedNews, sourceCount: number): NewsDisplayItem {
  const allCveIds = [
    ...new Set(item.identifiers.cve_ids),
  ];

  const sourceName =
    SOURCE_NAME_MAP[item._source] ??
    item._source.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

  const recommendedFor = (item.audience.recommended_for ?? [])
    .map((a) => AUDIENCE_MAP[a])
    .filter(Boolean) as AudienceLabel[];

  const primary: AudienceLabel = AUDIENCE_MAP[item.audience.primary] ?? "보안직군";

  return {
    id: allCveIds[0] ?? item._key,
    title: deriveTitle(item),
    excerpt: item.summary,
    severity: SEVERITY_MAP[item.severity.label?.toLowerCase()] ?? "Info",
    cvss: item.severity.cvss_score,
    cveIds: allCveIds,
    action: item.action.remediation ?? item.action.required_action ?? "",
    source: sourceName,
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

    // 최신 MAX_FETCH개만 처리 (LastModified 내림차순)
    const topEntries = allEntries
      .sort((a, b) => b.lastModified.getTime() - a.lastModified.getTime())
      .slice(0, MAX_FETCH);

    const rawItems = (await Promise.all(topEntries.map(fetchJson))).filter(
      (item): item is TaggedNews => item !== null
    );

    const groups = deduplicateByCve(rawItems);
    const merged = groups.map((group) => ({
      item: mergeGroup(group),
      count: group.length,
    }));

    const displayItems = merged
      .map(({ item, count }) => toDisplayItem(item, count))
      .sort(
        (a, b) =>
          SEVERITY_ORDER[a.severity.toLowerCase()] -
          SEVERITY_ORDER[b.severity.toLowerCase()]
      );

    return NextResponse.json(displayItems);
  } catch (error) {
    console.error("[api/news] S3 fetch error:", error);
    return NextResponse.json({ error: "뉴스를 불러오는 중 오류가 발생했습니다." }, { status: 500 });
  }
}
