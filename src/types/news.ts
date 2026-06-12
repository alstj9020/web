/** DynamoDB haruboan-db 테이블 아이템 스키마 */
export interface ProcessedNews {
  id: string;
  title: string;
  title_ko?: string;
  source: string;
  source_url: string;
  published_at: string;
  fetched_at: string;
  summary: string;
  severity: {
    label: string;
    cvss_score: number | null;
    cvss_vector: string | null;
    epss_score: number | null;
  };
  affected: {
    vendor: string | null;
    product: string;
    ecosystem: string;
    versions_affected: string;
    versions_fixed: string;
  }[];
  identifiers: {
    cve_ids: string[];
    ghsa_id: string | null;
    kev_listed: boolean;
    ransomware_known: boolean;
  };
  tags: {
    attack_vectors: string[];
    tech_stack: string[];
    topics: string[];
  };
  action: {
    priority: string;
    steps: string[];
    target: string[];
    timeline: string;
    type: string;
  };
  audience: {
    scores: { general: number; developer: number; security: number };
    primary: string;
    confidence: number;
    recommended_for: string[];
    reason: string;
    developer_roles: string[];
  };
}

export type SeverityLabel = "Critical" | "High" | "Medium" | "Low" | "Info";
export type AudienceLabel = "일반인" | "개발자" | "보안직군";

/** API /api/stats 응답 */
export interface DashboardStats {
  collectedToday: number;
  criticalCount: number;
  kevCount: number;
  severityDist: {
    critical: number;
    high: number;
    medium: number;
    low: number;
    info: number;
  };
  sources: {
    name: string;
    count: number;
    lastSeen: string;
    active: boolean;
  }[];
  recentCVEs: {
    cveId: string;
    title: string;
    cvss: number | null;
    severity: SeverityLabel;
    source: string;
  }[];
  subscribers: null;
  emailsSentToday: null;
}

/** API /api/news 응답 아이템 */
export interface NewsDisplayItem {
  id: string;
  title: string;
  excerpt: string;
  severity: SeverityLabel;
  cvss: number | null;
  cveIds: string[];
  action: string;
  source: string;
  sourceUrl: string;
  sourceCount: number;
  audience: AudienceLabel;
  recommendedFor: AudienceLabel[];
  affected: { vendor: string | null; product: string; versions_fixed: string }[];
  kevListed: boolean;
  ransomwareKnown: boolean;
  publishedAt: string;
  techStack: string[];
}
