import Image from "next/image";
import Link from "next/link";

export default function SubscribeConfirmPage() {
  return (
    <main className="min-h-screen bg-[#1e2235] flex items-center justify-center px-6 py-16">
      <div className="flex flex-col items-center gap-6 text-center max-w-md">
        <div className="relative size-[140px]">
          <Image src="/images/haru-wink.svg" alt="하루보안 캐릭터" fill className="object-contain" />
        </div>

        <div className="flex flex-col gap-3">
          <h1 className="font-black text-2xl md:text-[36px] text-[#f5f6f8] leading-tight">
            구독이 완료됐어요!
          </h1>
          <p className="text-[#a8d8ea] text-[16px] leading-relaxed">
            내일 아침부터 선택하신 시간에<br />맞춤 보안 뉴스를 보내드릴게요.
          </p>
        </div>

        <div className="bg-[#2a3147] border border-[#3d4f6e] rounded-2xl px-6 py-5 w-full text-left flex flex-col gap-3">
          <p className="text-[#6bb8d4] text-[12px] font-medium tracking-wide">구독 정보</p>
          {[
            { label: "직군", value: "개발자" },
            { label: "발송 시간", value: "오후 12시" },
            { label: "발송 주기", value: "매일 1회" },
          ].map(({ label, value }) => (
            <div key={label} className="flex items-center justify-between">
              <span className="text-[#a8b8d0] text-[13px]">{label}</span>
              <span className="text-[#f5f6f8] font-medium text-[14px]">{value}</span>
            </div>
          ))}
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
    </main>
  );
}
