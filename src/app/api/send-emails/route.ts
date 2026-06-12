import { NextRequest, NextResponse } from "next/server";
import { scanSubscribersByDeliveryTime } from "@/lib/dynamoSubscriber";
import { getRecommendations, RECOMMENDATIONS_TABLE } from "@/lib/dynamoRecommendations";
import { sendNewsletter, SES_FROM } from "@/lib/ses";

// EventBridge Scheduler가 호출할 때 전달하는 시크릿 (무단 호출 방지)
const CRON_SECRET = process.env.CRON_SECRET ?? "";

// KST 시각(시) → deliveryTime 값 매핑
const HOUR_TO_DELIVERY: Record<number, string> = {
  8: "오전 8시",
  12: "오후 12시",
  18: "오후 6시",
};

export async function POST(req: NextRequest) {
  // 시크릿 검증
  const secret = req.headers.get("x-cron-secret");
  if (CRON_SECRET && secret !== CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 환경변수 누락 조기 확인
  if (!SES_FROM) {
    return NextResponse.json({ error: "GMAIL_USER 환경변수가 설정되지 않았습니다." }, { status: 500 });
  }

  // 현재 KST 시각으로 대상 deliveryTime 결정
  const kstOffset = 9 * 60 * 60 * 1000;
  const kstHour = new Date(Date.now() + kstOffset).getUTCHours();
  const deliveryTime = HOUR_TO_DELIVERY[kstHour];

  if (!deliveryTime) {
    return NextResponse.json({ message: `발송 시간대 없음 (KST ${kstHour}시)`, sent: 0 });
  }

  // 해당 시간대 구독자 조회
  const subscribers = await scanSubscribersByDeliveryTime(deliveryTime);
  if (subscribers.length === 0) {
    return NextResponse.json({ message: "해당 시간대 구독자 없음", sent: 0 });
  }

  // 구독자별 발송
  let sent = 0;
  const errors: string[] = [];

  await Promise.allSettled(
    subscribers.map(async (sub) => {
      try {
        const articles = await getRecommendations(sub.email);
        await sendNewsletter({ to: sub.email, audience: sub.audience, articles });
        sent++;
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        errors.push(`${sub.email}: ${msg}`);
      }
    })
  );

  return NextResponse.json({
    deliveryTime,
    total: subscribers.length,
    sent,
    errors: errors.length > 0 ? errors : undefined,
  });
}

// 설정 상태 확인용 (GET)
export async function GET() {
  return NextResponse.json({
    sesFrom: SES_FROM || "(미설정)",
    recommendationsTable: RECOMMENDATIONS_TABLE,
    cronSecretSet: !!CRON_SECRET,
  });
}
