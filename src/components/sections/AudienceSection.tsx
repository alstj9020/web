"use client";

import Image from "next/image";
import { motion } from "framer-motion";

interface BulletItem {
  text: string;
}

interface AudienceCardProps {
  badge: string;
  badgeBg: string;
  iconSrc: string;
  iconAlt: string;
  title: string;
  bullets: BulletItem[];
  highlighted?: boolean;
  delay: number;
}

function BulletPoint({ text }: { text: string }) {
  return (
    <div className="flex gap-[10px] items-center">
      <div className="w-2 h-2 rounded-full bg-[#6bb8d4] shrink-0" />
      <p className="font-normal text-[15px] text-[#3d4f6e]">{text}</p>
    </div>
  );
}

function AudienceCard({ badge, badgeBg, iconSrc, iconAlt, title, bullets, highlighted = false, delay }: AudienceCardProps) {
  return (
    <motion.div
      className={`bg-[#f5f6f8] flex flex-col gap-[18px] items-start px-7 py-8 rounded-2xl w-full ${
        highlighted ? "border-2 border-[#6bb8d4]" : "border border-[#e8eaed]"
      }`}
      style={{ boxShadow: "0 4px 16px rgba(0,0,0,0.08)" }}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.55 }}
    >
      <div className="px-3 py-1.5 rounded-lg shrink-0" style={{ background: badgeBg }}>
        <p className="font-bold text-[13px] text-[#1e2235]">{badge}</p>
      </div>

      <div className="relative size-10 shrink-0">
        <Image src={iconSrc} alt={iconAlt} fill className="object-contain" />
      </div>

      <p className="font-bold text-[20px] leading-[1.4] text-[#1e2235]">{title}</p>

      <div className="flex flex-col gap-[18px]">
        {bullets.map((b, i) => (
          <BulletPoint key={i} text={b.text} />
        ))}
      </div>
    </motion.div>
  );
}

export default function AudienceSection() {
  return (
    <section className="snap-section flex items-center justify-center bg-[#e8eaed]" aria-label="직군별 서비스">
      <div className="max-w-6xl mx-auto px-6 md:px-12 w-full py-10 md:py-16 lg:py-20">
        <motion.div
          className="flex flex-col gap-3 items-center text-center mb-8 md:mb-12"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <p className="text-[#6bb8d4] font-semibold text-sm uppercase tracking-wider">For Everyone</p>
          <h2 className="font-black text-3xl md:text-4xl text-[#1e2235]">당신의 직군에 맞춘 뉴스레터</h2>
          <p className="font-normal text-base md:text-[18px] text-[#3d4f6e] max-w-xl">
            같은 이슈도, 누구에게 전달하느냐에 따라 다르게 읽혀야 합니다.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-[1104px] mx-auto">
          <AudienceCard
            badge="일반인"
            badgeBg="#6bb8d4"
            iconSrc="/images/icon-person.svg"
            iconAlt="일반인 아이콘"
            title="쉽게 풀어쓴 보안 뉴스"
            bullets={[
              { text: "어려운 용어 없이 핵심만" },
              { text: "내 계정·기기에 미치는 영향" },
              { text: "지금 해야 할 행동 정리" },
            ]}
            delay={0}
          />
          <AudienceCard
            badge="개발자"
            badgeBg="#a8d8ea"
            iconSrc="/images/icon-terminal.svg"
            iconAlt="개발자 아이콘"
            title="코드 관점의 위협 분석"
            bullets={[
              { text: "관련 라이브러리·프레임워크" },
              { text: "취약점 패턴과 재현 예시" },
              { text: "패치·마이그레이션 가이드" },
            ]}
            highlighted
            delay={0.12}
          />
          <AudienceCard
            badge="보안직군"
            badgeBg="#6bb8d4"
            iconSrc="/images/icon-shield.svg"
            iconAlt="보안직군 아이콘"
            title="실무용 상세 리포트"
            bullets={[
              { text: "CVE·IOC·CVSS 스코어" },
              { text: "공격 체인 및 방어 관점" },
              { text: "조직 대응 체크리스트" },
            ]}
            delay={0.24}
          />
        </div>
      </div>
    </section>
  );
}
