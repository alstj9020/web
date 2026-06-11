export const AUDIENCE_OPTIONS = ["일반인", "개발자", "보안직군"] as const;
export const TIME_OPTIONS = ["오전 8시", "오후 12시", "오후 6시"] as const;
export const TOPICS_BY_AUDIENCE = {
  개발자: [
    "프론트엔드/웹",
    "백엔드/API 서버",
    "DevOps/Cloud/IaC",
    "Kubernetes/Container/Platform",
    "AI/LLM 애플리케이션",
    "PHP/CMS/템플릿",
    "Python/Data/AI Backend",
    "Go/Cloud Native",
    "Rust/Systems",
    ".NET/Java/엔터프라이즈",
  ],
  보안직군: [
    "프론트엔드/웹",
    "백엔드/API 서버",
    "DevOps/Cloud/IaC",
    "Kubernetes/Container/Platform",
    "AI/LLM 애플리케이션",
  ],
} as const;

export type AudienceType = (typeof AUDIENCE_OPTIONS)[number];
export type TimeType = (typeof TIME_OPTIONS)[number];
export type TopicsAudienceType = keyof typeof TOPICS_BY_AUDIENCE;
