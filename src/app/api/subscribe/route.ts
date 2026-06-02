import { NextRequest, NextResponse } from "next/server";

const VALID_AUDIENCES = ["일반인", "개발자", "보안직군"] as const;
const VALID_TIMES = ["오전 8시", "오후 12시", "오후 6시"] as const;
const VALID_TOPICS = {
  일반인: ["개인정보 보호", "피싱·사기 예방", "랜섬웨어", "스마트폰 보안", "소셜미디어 보안"],
  개발자: ["취약점/CVE", "웹 보안", "의존성·공급망 보안", "클라우드 보안", "인증·접근제어"],
  보안직군: ["취약점/CVE", "위협 인텔리전스", "랜섬웨어·APT", "법규·컴플라이언스", "클라우드 보안"],
} as const satisfies Record<string, readonly string[]>;

type Audience = (typeof VALID_AUDIENCES)[number];
type DeliveryTime = (typeof VALID_TIMES)[number];

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json(
      { error: "요청 형식이 올바르지 않습니다." },
      { status: 400 }
    );
  }

  const { email, audience, deliveryTime, topics } = body;

  if (
    !email ||
    typeof email !== "string" ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  ) {
    return NextResponse.json(
      { error: "이메일 주소가 올바르지 않습니다." },
      { status: 400 }
    );
  }

  if (
    typeof audience !== "string" ||
    !VALID_AUDIENCES.includes(audience as Audience)
  ) {
    return NextResponse.json(
      { error: "직군 선택이 올바르지 않습니다." },
      { status: 400 }
    );
  }

  const validTopics = VALID_TOPICS[audience as Audience];
  if (
    !Array.isArray(topics) ||
    topics.length === 0 ||
    !topics.every((t) => typeof t === "string" && (validTopics as readonly string[]).includes(t))
  ) {
    return NextResponse.json(
      { error: "관심 주제 선택이 올바르지 않습니다." },
      { status: 400 }
    );
  }

  if (
    typeof deliveryTime !== "string" ||
    !VALID_TIMES.includes(deliveryTime as DeliveryTime)
  ) {
    return NextResponse.json(
      { error: "수신 시간 선택이 올바르지 않습니다." },
      { status: 400 }
    );
  }

  return NextResponse.json({ success: true });
}
