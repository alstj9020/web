"use client";

import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";

function ConfirmContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const email = searchParams.get("email");
  const audience = searchParams.get("audience") ?? "개발자";
  const deliveryTime = searchParams.get("deliveryTime") ?? "오후 12시";
  const topics = searchParams.get("topics")?.split(",").filter(Boolean) ?? [];

  if (!email) {
    router.replace("/");
    return null;
  }

  return (
    <div className="flex flex-col items-center gap-6 text-center max-w-md">
      <div className="relative size-[140px]">
        <Image src="/images/haru-wink.svg" alt="하루보안 캐릭터" fill className="object-contain" />
      </div>

      <div className="flex flex-col gap-3">
        <h1 className="font-black text-2xl md:text-[36px] text-[#f5f6f8] leading-tight">
          구독이 완료됐어요!
        </h1>
        <p className="text-[#a8d8ea] text-[16px] leading-relaxed">
          내일부터 선택하신 시간에<br />맞춤 보안 뉴스를 보내드릴게요.
        </p>
      </div>

      <div className="bg-[#2a3147] border border-[#3d4f6e] rounded-2xl w-full px-6 py-5 flex flex-col items-center gap-5">
        <p className="text-[#6bb8d4] text-[12px] font-medium tracking-wide">구독 정보</p>
        <div className="w-full border-t border-[#3d4f6e] -my-2" />

        <div className="flex flex-col gap-2 w-full">
          <div className="flex justify-between">
            <span className="text-[#a8b8d0] text-[13px]">이메일</span>
            <span className="text-[#f5f6f8] font-medium text-[13px] break-all text-right">{email}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#a8b8d0] text-[13px]">직군</span>
            <span className="text-[#f5f6f8] font-medium text-[13px]">{audience}</span>
          </div>
          {topics.length > 0 && (
            <div className="flex flex-wrap justify-end gap-1">
              {topics.map((topic) => (
                <span key={topic} className="bg-[#3d4f6e] text-[#a8b8d0] text-[11px] px-2 py-0.5 rounded-full">
                  {topic}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-2 w-full">
          {[
            { label: "발송 시간", value: deliveryTime },
            { label: "발송 주기", value: "매일 1회" },
          ].map(({ label, value }) => (
            <div key={label} className="flex justify-between">
              <span className="text-[#a8b8d0] text-[13px]">{label}</span>
              <span className="text-[#f5f6f8] font-medium text-[13px]">{value}</span>
            </div>
          ))}
        </div>
      </div>

      <Link
        href="/news"
        className="bg-[#6bb8d4] text-[#1e2235] font-bold text-[16px] px-8 py-4 rounded-xl hover:opacity-90 transition-opacity w-full text-center"
      >
        오늘의 보안 뉴스 보기
      </Link>
      <Link href="/" className="text-[#8a9bbd] text-[13px] hover:text-[#a8d8ea] transition-colors">
        홈으로 돌아가기
      </Link>
    </div>
  );
}

export default function SubscribeConfirmPage() {
  return (
    <main className="min-h-screen bg-[#1e2235] flex justify-center px-6 pt-16 pb-16">
      <Suspense fallback={<div className="text-[#a8d8ea] text-[16px]">로딩 중...</div>}>
        <ConfirmContent />
      </Suspense>
    </main>
  );
}
