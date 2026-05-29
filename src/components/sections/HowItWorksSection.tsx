import Image from "next/image";

interface StepCardProps {
  step: string;
  iconSrc: string;
  iconAlt: string;
  title: string;
  lines: string[];
}

function StepCard({ step, iconSrc, iconAlt, title, lines }: StepCardProps) {
  return (
    <div className="bg-[#e8eaed] flex flex-col gap-4 items-start px-7 py-8 rounded-2xl w-full lg:w-[336px] shrink-0">
      <div className="bg-[#6bb8d4] px-3 py-1.5 rounded-lg shrink-0">
        <p className="font-bold text-[12px] text-[#1e2235]">{step}</p>
      </div>

      <div className="relative size-10 shrink-0">
        <Image src={iconSrc} alt={iconAlt} fill className="object-contain" />
      </div>

      <p className="font-bold text-[22px] text-[#1e2235]">{title}</p>

      <div className="text-[15px] text-[#3d4f6e] leading-[1.7]">
        {lines.map((line, i) => (
          <p key={i}>{line}</p>
        ))}
      </div>
    </div>
  );
}

export default function HowItWorksSection() {
  return (
    <section className="bg-[#f5f6f8] flex flex-col gap-12 md:gap-14 items-center justify-center w-full px-6 md:px-16 lg:px-[120px] py-16 md:py-24">
      <div className="flex flex-col gap-4 items-center text-center">
        <div className="relative size-[120px] shrink-0">
          <Image
            src="/images/haru-explain.svg"
            alt="하루보안 설명 캐릭터"
            fill
            className="object-contain"
          />
        </div>
        <h2 className="font-black text-2xl md:text-[36px] text-[#1e2235]">
          하루보안은 이렇게 작동합니다
        </h2>
        <p className="font-normal text-base md:text-[18px] text-[#3d4f6e]">
          수집 → 분석 → 발송. 매일 아침 자동으로.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 items-center w-full max-w-[1104px]">
        <StepCard
          step="STEP 01"
          iconSrc="/images/icon-search.svg"
          iconAlt="검색 아이콘"
          title="자동 크롤링"
          lines={[
            "KISA · NVD · Reddit 등 주요 소스에서",
            "매일 새 보안 이슈를 수집합니다.",
          ]}
        />

        {/* 데스크탑: →, 모바일: ↓ */}
        <span className="font-bold text-[32px] text-[#6bb8d4] hidden lg:block">→</span>
        <span className="font-bold text-[32px] text-[#6bb8d4] block lg:hidden">↓</span>

        <StepCard
          step="STEP 02"
          iconSrc="/images/icon-brain.svg"
          iconAlt="AI 분석 아이콘"
          title="AI 분석·재작성"
          lines={[
            "AI가 핵심을 요약하고",
            "당장 어떻게 해야할지 알려줍니다",
          ]}
        />

        <span className="font-bold text-[32px] text-[#6bb8d4] hidden lg:block">→</span>
        <span className="font-bold text-[32px] text-[#6bb8d4] block lg:hidden">↓</span>

        <StepCard
          step="STEP 03"
          iconSrc="/images/icon-mail.svg"
          iconAlt="메일 아이콘"
          title="매일 08시 발송"
          lines={[
            "구독하신 이메일로",
            "직군 맞춤 리포트가 배달됩니다.",
          ]}
        />
      </div>
    </section>
  );
}
