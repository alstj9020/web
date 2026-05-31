/** S3 processed/enriched JSON 스키마 */
export interface ProcessedNews {
  summary: string;
  language: string;
  severity: {
    label: string;
    cvss_score: number | null;
    cvss_vector: string | null;
    epss_score: number | null;
  };
  affected: {
    vendor: string;
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
    categories: string[];
    cwe: { id: string; name: string }[];
    attack_vectors: string[];
    tech_stack: string[];
    topics: string[];
  };
  action: {
    required_action: string | null;
    remediation: string;
    references: string[];
  };
  audience: {
    scores: { general: number; developer: number; security: number };
    primary: string;
    confidence: number;
    recommended_for: string[];
    reason: string;
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
  sourceCount: number;
  audience: AudienceLabel;
  recommendedFor: AudienceLabel[];
  affected: { vendor: string; product: string; versions_fixed: string }[];
  kevListed: boolean;
  ransomwareKnown: boolean;
}
