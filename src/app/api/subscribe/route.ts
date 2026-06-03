import { NextRequest, NextResponse } from "next/server";
import { AUDIENCE_OPTIONS, TIME_OPTIONS, TOPICS_BY_AUDIENCE, AudienceType, TimeType } from "@/constants/subscription";

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
    !AUDIENCE_OPTIONS.includes(audience as AudienceType)
  ) {
    return NextResponse.json(
      { error: "직군 선택이 올바르지 않습니다." },
      { status: 400 }
    );
  }

  const validTopics = TOPICS_BY_AUDIENCE[audience as AudienceType];
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
    !TIME_OPTIONS.includes(deliveryTime as TimeType)
  ) {
    return NextResponse.json(
      { error: "수신 시간 선택이 올바르지 않습니다." },
      { status: 400 }
    );
  }

  return NextResponse.json({ success: true });
}
