import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, ScanCommand } from "@aws-sdk/lib-dynamodb";
import type { ProcessedNews, SeverityLabel } from "@/types/news";

const ddb = DynamoDBDocumentClient.from(
  new DynamoDBClient({ region: process.env.AWS_REGION ?? "ap-northeast-2" })
);

export const TABLE = "haruboan-db";

export const SOURCE_NAME_MAP: Record<string, string> = {
  github: "GitHub Advisory",
  github_advisory: "GitHub Advisory",
  nvd: "NVD",
  cisa: "CISA",
  kisa: "KISA",
  reddit: "Reddit",
};

export const SEVERITY_ORDER: Record<string, number> = {
  critical: 0, high: 1, medium: 2, low: 3, info: 4, unknown: 5,
};

export const SEVERITY_MAP: Record<string, SeverityLabel> = {
  critical: "Critical", high: "High", medium: "Medium", low: "Low", info: "Info",
};

export async function scanAllNews(): Promise<ProcessedNews[]> {
  const items: ProcessedNews[] = [];
  let lastKey: Record<string, unknown> | undefined;

  do {
    const resp = await ddb.send(
      new ScanCommand({ TableName: TABLE, ExclusiveStartKey: lastKey })
    );
    if (resp.Items) items.push(...(resp.Items as ProcessedNews[]));
    lastKey = resp.LastEvaluatedKey as Record<string, unknown> | undefined;
  } while (lastKey);

  return items;
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

export function isToday(dateStr: string): boolean {
  const kstOffset = 9 * 60 * 60 * 1000;
  const d = new Date(new Date(dateStr).getTime() + kstOffset);
  const now = new Date(Date.now() + kstOffset);
  return d.toISOString().slice(0, 10) === now.toISOString().slice(0, 10);
}
