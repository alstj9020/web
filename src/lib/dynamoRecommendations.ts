import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand, ScanCommand } from "@aws-sdk/lib-dynamodb";
import type { NewsletterArticle } from "@/lib/ses";

const ddb = DynamoDBDocumentClient.from(
  new DynamoDBClient({ region: process.env.AWS_REGION ?? "ap-northeast-2" })
);

export const RECOMMENDATIONS_TABLE = "2026-inha-cc-07-recommendations";

export async function countTodayPending(): Promise<number> {
  const kstOffset = 9 * 60 * 60 * 1000;
  const today = new Date(Date.now() + kstOffset).toISOString().slice(0, 10);
  let count = 0;
  let lastKey: Record<string, unknown> | undefined;
  do {
    const resp = await ddb.send(
      new ScanCommand({
        TableName: RECOMMENDATIONS_TABLE,
        FilterExpression: "#d = :today",
        ExpressionAttributeNames: { "#d": "date" },
        ExpressionAttributeValues: { ":today": today },
        Select: "COUNT",
        ExclusiveStartKey: lastKey,
      })
    );
    count += resp.Count ?? 0;
    lastKey = resp.LastEvaluatedKey as Record<string, unknown> | undefined;
  } while (lastKey);
  return count;
}

export async function getRecommendations(email: string): Promise<NewsletterArticle[]> {
  const kstOffset = 9 * 60 * 60 * 1000;
  const today = new Date(Date.now() + kstOffset).toISOString().slice(0, 10);

  // TODO: 테이블 스키마에 맞게 Key 구조 수정 (현재는 email + date 복합키 가정)
  const resp = await ddb.send(
    new GetCommand({
      TableName: RECOMMENDATIONS_TABLE,
      Key: { email, date: today },
    })
  );

  if (!resp.Item || !Array.isArray(resp.Item.articles)) return [];

  // TODO: 팀원 테이블의 필드명에 맞게 매핑 수정
  return (resp.Item.articles as Record<string, unknown>[]).map((a) => ({
    title: String(a.title ?? ""),
    summary: String(a.summary ?? ""),
    severity: String(a.severity ?? "Info"),
    cvss: typeof a.cvss_score === "number" ? a.cvss_score : null,
    cveIds: Array.isArray(a.cve_ids) ? (a.cve_ids as string[]) : [],
    action: String(a.action ?? ""),
    sourceUrl: String(a.source_url ?? ""),
  }));
}
