import Image from "next/image";

interface ProblemCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

function ProblemCard({ icon, title, description }: ProblemCardProps) {
  return (
    <div className="bg-[#e8eaed] flex flex-col gap-4 items-start px-7 py-8 rounded-2xl w-full lg:w-[528px] shrink-0">
      {icon}
      <p className="font-bold text-[22px] text-[#1e2235]">{title}</p>
      <p className="font-normal text-[15px] leading-[1.65] text-[#3d4f6e]">{description}</p>
    </div>
  );
}

const InfoIcon = () => (
  <div className="relative rounded-xl size-10 overflow-hidden shrink-0 bg-gradient-to-b from-[#60a5fa] to-[#7c3aed] shadow-[0px_4px_10px_0px_rgba(124,58,237,0.35)]">
    <div className="absolute bg-white h-[2.5px] left-2 rounded-[1.5px] top-[10px] w-6" />
    <div className="absolute bg-white h-[2.5px] left-2 rounded-[1.5px] top-[17px] w-5" />
    <div className="absolute bg-white/70 h-[2.5px] left-2 rounded-[1.5px] top-6 w-4" />
    <div className="absolute bg-white/70 h-[2.5px] left-2 rounded-[1.5px] top-[31px] w-3" />
  </div>
);

function SvgIcon({ src, alt }: { src: string; alt: string }) {
  return (
    <div className="relative size-10 shrink-0">
      <Image src={src} alt={alt} fill className="object-contain" />
    </div>
  );
}

export default function ProblemSection() {
  return (
    <section className="bg-[#f5f6f8] flex flex-col gap-12 items-center justify-center w-full px-6 md:px-16 lg:px-[120px] py-16 md:py-24">
      <div className="flex flex-col gap-4 items-center justify-center text-center">
        <div className="relative size-[120px] shrink-0">
          <Image
            src="/images/haru-serious.svg"
            alt="하루보안 진지한 캐릭터"
            fill
            className="object-contain"
          />
        </div>
        <h2 className="font-black text-2xl md:text-[36px] leading-[1.4] text-[#1e2235]">
          보안 뉴스, 매일 보기 어렵지 않으셨나요?
        </h2>
        <p className="font-normal text-base md:text-[18px] text-[#3d4f6e] max-w-xl">
          요즘 해킹 위험도 커지고, 맨날 보안사고가 터집니다. 그런데 나는 괜찮은 걸까요?
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-[1080px]">
        <ProblemCard
          icon={<InfoIcon />}
          title="너무 많은 정보"
          description="매일 쏟아지는 보안 기사와 CVE, 전부 확인할 시간이 없습니다."
        />
        <ProblemCard
          icon={<SvgIcon src="/images/icon-question.svg" alt="어려운 용어 아이콘" />}
          title="어려운 용어"
          description="취약점 설명은 대부분 전문가용. 일반인과 개발자에겐 장벽입니다."
        />
        <ProblemCard
          icon={<SvgIcon src="/images/icon-alert.svg" alt="보안사고 아이콘" />}
          title="매일 터지는 보안사고"
          description="해킹, 랜섬웨어, 개인정보 유출… 나와 관련된 사고인지조차 알기 어렵습니다."
        />
        <ProblemCard
          icon={<SvgIcon src="/images/icon-help.svg" alt="대응 방법 아이콘" />}
          title="어떻게 대응해야 하지?"
          description="보안사고가 터졌다는데, 내가 무엇을 해야 할지 아무도 알려주지 않습니다."
        />
      </div>
    </section>
  );
}
