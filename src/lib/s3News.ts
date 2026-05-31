import {
  S3Client,
  ListObjectsV2Command,
  GetObjectCommand,
  type _Object,
} from "@aws-sdk/client-s3";
import type { ProcessedNews, SeverityLabel } from "@/types/news";

export const s3 = new S3Client({ region: process.env.AWS_REGION ?? "ap-northeast-2" });
export const BUCKET = "2026-inha-cc-07-s3";

export const SOURCE_NAME_MAP: Record<string, string> = {
  github_advisory: "GitHub Advisory",
  nvd: "NVD",
  cisa: "CISA",
  kisa: "KISA",
};

export const SEVERITY_ORDER: Record<string, number> = {
  critical: 0, high: 1, medium: 2, low: 3, info: 4, unknown: 5,
};

export const SEVERITY_MAP: Record<string, SeverityLabel> = {
  critical: "Critical", high: "High", medium: "Medium", low: "Low", info: "Info",
};

export type EnrichedEntry = { key: string; lastModified: Date; source: string };
export type TaggedNews = ProcessedNews & { _source: string; _key: string };

export async function listEnrichedKeys(): Promise<EnrichedEntry[]> {
  const sourcesResp = await s3.send(
    new ListObjectsV2Command({ Bucket: BUCKET, Delimiter: "/" })
  );
  const sourcePrefixes = sourcesResp.CommonPrefixes?.map((p) => p.Prefix!) ?? [];

  if (sourcePrefixes.length === 0) return [];

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

export async function fetchEnrichedJson(entry: EnrichedEntry): Promise<TaggedNews | null> {
  try {
    const resp = await s3.send(new GetObjectCommand({ Bucket: BUCKET, Key: entry.key }));
    const body = await resp.Body?.transformToString();
    if (!body) return null;
    return { ...(JSON.parse(body) as ProcessedNews), _source: entry.source, _key: entry.key };
  } catch {
    return null;
  }
}

export function getSourceName(key: string): string {
  return (
    SOURCE_NAME_MAP[key] ??
    key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
  );
}

export function mapSeverity(label: string): SeverityLabel {
  return SEVERITY_MAP[label?.toLowerCase()] ?? "Info";
}

export function deriveTitle(item: ProcessedNews): string {
  const cves = item.identifiers.cve_ids;
  const vendor = item.affected[0]?.vendor;
  const product = item.affected[0]?.product;

  if (cves.length > 0) {
    const cveLabel =
      cves.length === 1 ? cves[0] : `${cves[0]} 外 ${cves.length - 1}건`;
    const prefix = vendor ? `${vendor}${product ? ` ${product}` : ""}` : "";
    return prefix ? `${prefix} (${cveLabel})` : cveLabel;
  }

  const first = item.summary.split(/(?<=[.!。])\s/)[0] ?? item.summary;
  return first.length > 60 ? `${first.slice(0, 57)}...` : first;
}

/** S3 LastModified 기준 오늘(KST) 여부 */
export function isToday(date: Date): boolean {
  const kstOffset = 9 * 60 * 60 * 1000;
  const d = new Date(date.getTime() + kstOffset);
  const now = new Date(Date.now() + kstOffset);
  return d.toISOString().slice(0, 10) === now.toISOString().slice(0, 10);
}
