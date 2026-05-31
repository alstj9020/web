import {
  S3Client,
  ListObjectsV2Command,
  GetObjectCommand,
  type _Object,
} from "@aws-sdk/client-s3";
import type { ProcessedNews, BatchEnrichedFile, SeverityLabel } from "@/types/news";

export const s3 = new S3Client({ region: process.env.AWS_REGION ?? "ap-northeast-2" });
export const BUCKET = "2026-inha-cc-07-s3";

export const SOURCE_NAME_MAP: Record<string, string> = {
  github: "GitHub Advisory",
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

/** 배치 파일의 개별 아이템 + 메타 */
export type TaggedNews = ProcessedNews & {
  _source: string;
  _key: string;
  _enriched_at: string;
};

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

/** 배치 파일 1개를 읽어 아이템 배열로 반환. 파싱 실패 시 빈 배열 반환 */
export async function fetchEnrichedBatch(entry: EnrichedEntry): Promise<TaggedNews[]> {
  try {
    const resp = await s3.send(new GetObjectCommand({ Bucket: BUCKET, Key: entry.key }));
    const body = await resp.Body?.transformToString();
    if (!body) return [];

    const batch = JSON.parse(body) as BatchEnrichedFile;

    if (!Array.isArray(batch.items) || batch.items.length === 0) return [];

    return batch.items.map((item) => ({
      ...item,
      _source: batch.source ?? entry.source,
      _key: entry.key,
      _enriched_at: batch.enriched_at ?? entry.lastModified.toISOString(),
    }));
  } catch {
    return [];
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

/** enriched_at 또는 S3 LastModified 기준 오늘(KST) 여부 */
export function isToday(date: Date): boolean {
  const kstOffset = 9 * 60 * 60 * 1000;
  const d = new Date(date.getTime() + kstOffset);
  const now = new Date(Date.now() + kstOffset);
  return d.toISOString().slice(0, 10) === now.toISOString().slice(0, 10);
}
