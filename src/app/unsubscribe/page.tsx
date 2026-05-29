"use client";

import Image from "next/image";
import Link from "next/link";
import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Toast, type ToastState } from "@/components/ui/Toast";

function UnsubscribeContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email") ?? "등록된 이메일";
  const [status, setStatus] = useState<"idle" | "loading" | "done">("idle");
  const [toast, setToast] = useState<ToastState | null>(null);

  const handleUnsubscribe = async () => {
    setStatus("loading");
    try {
      // TODO: 실제 API 연결
      await new Promise((r) => setTimeout(r, 700));
      setStatus("done");
    } catch {
      setStatus("idle");
      setToast({ message: "처리 중 오류가 발생했습니다. 다시 시도해 주세요.", type: "error" });
    }
  };

  if (status === "done") {
    return (
      <div className="flex flex-col items-center gap-6 text-center">
        <div className="relative size-[120px]">
          <Image src="/images/haru-serious.svg" alt="하루보안 캐릭터" fill className="object-contain" />
        </div>
        <h2 className="font-black text-2xl md:text-[32px] text-[#f5f6f8]">구독이 해지되었습니다</h2>
        <p className="text-[#a8d8ea] text-[16px] max-w-sm">
          <span className="font-bold">{email}</span> 주소로의 발송을 중단했습니다.
          <br />그동안 하루보안을 이용해 주셔서 감사합니다.
        </p>
        <Link
          href="/"
          className="mt-2 bg-[#6bb8d4] text-[#1e2235] font-bold text-[16px] px-8 py-4 rounded-xl hover:opacity-90 transition-opacity"
        >
          다시 구독하기
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col items-center gap-6 text-center">
        <div className="relative size-[120px]">
          <Image src="/images/haru-serious.svg" alt="하루보안 캐릭터" fill className="object-contain" />
        </div>

        <div className="flex flex-col gap-2">
          <h2 className="font-black text-2xl md:text-[32px] text-[#f5f6f8]">정말 떠나시는 건가요?</h2>
          <p className="text-[#a8d8ea] text-[16px]">매일 아침 보안 뉴스를 보내드리고 있었는데요.</p>
        </div>

        <div className="bg-[#2a3147] border border-[#3d4f6e] rounded-xl px-6 py-4 w-full max-w-sm">
          <p className="text-[#a8b8d0] text-[12px] mb-1">해지할 이메일</p>
          <p className="text-[#f5f6f8] font-bold text-[16px] break-all">{email}</p>
        </div>

        <div className="flex flex-col gap-3 w-full max-w-sm">
          <button
            onClick={handleUnsubscribe}
            disabled={status === "loading"}
            className="bg-[#ef4444] text-white font-bold text-[16px] px-8 py-4 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-60 disabled:cursor-not-allowed w-full"
          >
            {status === "loading" ? "처리 중..." : "구독 해지하기"}
          </button>
          <Link
            href="/"
            className="border-2 border-[#3d4f6e] text-[#a8b8d0] font-medium text-[15px] px-8 py-3.5 rounded-xl hover:border-[#6bb8d4] hover:text-[#6bb8d4] transition-colors text-center"
          >
            취소하고 돌아가기
          </Link>
        </div>

        <p className="text-[#8a9bbd] text-[12px] max-w-xs">
          해지 후에도 언제든 다시 구독할 수 있습니다.
        </p>
      </div>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </>
  );
}

export default function UnsubscribePage() {
  return (
    <main className="min-h-screen bg-[#1e2235] flex items-center justify-center px-6 py-16">
      <Suspense fallback={<div className="text-[#a8d8ea] text-[16px]">로딩 중...</div>}>
        <UnsubscribeContent />
      </Suspense>
    </main>
  );
}
