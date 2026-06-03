export const AUDIENCE_OPTIONS = ["일반인", "개발자", "보안직군"] as const;
export const TIME_OPTIONS = ["오전 8시", "오후 12시", "오후 6시"] as const;
export const TOPICS_BY_AUDIENCE = {
  일반인: ["개인정보 보호", "피싱·사기 예방", "랜섬웨어", "스마트폰 보안", "소셜미디어 보안"],
  개발자: ["취약점/CVE", "웹 보안", "의존성·공급망 보안", "클라우드 보안", "인증·접근제어"],
  보안직군: ["취약점/CVE", "위협 인텔리전스", "랜섬웨어·APT", "법규·컴플라이언스", "클라우드 보안"],
} as const satisfies Record<string, readonly string[]>;

export type AudienceType = (typeof AUDIENCE_OPTIONS)[number];
export type TimeType = (typeof TIME_OPTIONS)[number];
