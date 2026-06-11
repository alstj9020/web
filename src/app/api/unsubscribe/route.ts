import { NextRequest, NextResponse } from "next/server";
import { deleteSubscriber } from "@/lib/dynamoSubscriber";

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await req.json() as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "요청 형식이 올바르지 않습니다." }, { status: 400 });
  }

  const { email } = body;

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

  try {
    await deleteSubscriber(email);
  } catch (err) {
    console.error("[api/unsubscribe] DynamoDB error:", err);
    return NextResponse.json({ error: "해지 처리 중 오류가 발생했습니다." }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
