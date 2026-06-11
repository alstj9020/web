import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand } from "@aws-sdk/lib-dynamodb";
import type { NewsletterArticle } from "@/lib/ses";

const ddb = DynamoDBDocumentClient.from(
  new DynamoDBClient({ region: process.env.AWS_REGION ?? "ap-northeast-2" })
);

// TODO: 팀원과 테이블명 및 스키마 확정 후 아래 상수와 조회 로직 수정
// 예상 스키마:
//   PK: email (String)
//   SK 또는 date: "YYYY-MM-DD" (오늘 날짜)
//   articles: List<{ title, summary, severity, cvss_score, cve_ids, action, source_url }>
export const RECOMMENDATIONS_TABLE = "haruboan-recommendations";

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
