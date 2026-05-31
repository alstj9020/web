import { NextRequest, NextResponse } from "next/server";

const VALID_AUDIENCES = ["일반인", "개발자", "보안직군"] as const;
const VALID_TIMES = ["오전 8시", "오후 12시", "오후 6시"] as const;

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

  const { email, audience, deliveryTime } = body;

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
