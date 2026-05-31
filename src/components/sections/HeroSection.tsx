import Image from "next/image";

export default function HeroSection() {
  return (
    <section className="bg-[#1e2235] flex flex-col items-center justify-center gap-8 w-full px-6 md:px-16 lg:px-[120px] py-16 md:py-24 min-h-[600px] lg:min-h-[720px]">
      <div className="relative w-[140px] h-[140px] md:w-[200px] md:h-[200px] shrink-0">
        <Image
          src="/images/haru-hero.svg"
          alt="하루보안 캐릭터"
          fill
          className="object-contain"
        />
      </div>

      <h1 className="font-black text-3xl md:text-[42px] lg:text-[52px] leading-[1.3] text-[#f5f6f8] text-center">
        매일 아침, 당신에게 맞는 보안 뉴스
      </h1>

      <p className="font-normal text-base md:text-[18px] leading-[1.6] text-[#a8d8ea] text-center max-w-lg">
        보안 이슈를 자동 수집하고, AI가 당신의 직군에 맞게 풀어드립니다.
      </p>

      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-center pt-2 w-full sm:w-auto px-4 sm:px-0">
        <a href="#cta" className="bg-[#6bb8d4] text-[#1e2235] font-bold text-[16px] px-8 py-4 rounded-xl hover:opacity-90 transition-opacity w-full sm:w-auto text-center">
          등록하고 메일 받기
        </a>
        <button className="border-2 border-[#6bb8d4] text-[#6bb8d4] font-bold text-[16px] px-[30px] py-[14px] rounded-xl cursor-pointer hover:bg-[#6bb8d4]/10 transition-colors w-full sm:w-auto">
          서비스 자세히 보기
        </button>
      </div>
    </section>
  );
}
