"use client";

import Image from "next/image";
import { motion } from "framer-motion";

const steps = [
  {
    step: "01",
    iconSrc: "/images/icon-search.svg",
    iconAlt: "검색 아이콘",
    title: "자동 크롤링",
    desc: "KISA · NVD · Reddit 등 주요 소스에서 매일 새 보안 이슈를 수집합니다.",
  },
  {
    step: "02",
    iconSrc: "/images/icon-brain.svg",
    iconAlt: "AI 분석 아이콘",
    title: "AI 분석·요약",
    desc: "AI가 핵심을 요약하고 당장 어떻게 해야할지 알려줍니다.",
  },
  {
    step: "03",
    iconSrc: "/images/icon-mail.svg",
    iconAlt: "메일 아이콘",
    title: "맞춤 이메일 발송",
    desc: "직군에 최적화된 보안 브리핑이 매일 아침 이메일로 도착합니다.",
  },
];

export default function HowItWorksSection() {
  return (
    <section
      id="how-it-works"
      className="snap-section flex items-center justify-center bg-[#f5f6f8]"
      aria-label="작동 방식"
    >
      <div className="max-w-4xl mx-auto px-6 md:px-8 w-full py-6 md:py-14">
        <div className="flex flex-col md:flex-row items-center gap-5 mb-5 md:mb-14">
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="relative size-[80px] md:size-[100px] haru-float">
              <Image src="/images/haru-explain.svg" alt="하루보안 설명 캐릭터" fill className="object-contain" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <p className="text-[#6bb8d4] font-semibold text-xs mb-2 uppercase tracking-wider">How It Works</p>
            <h2 className="font-black text-2xl md:text-3xl text-[#1e2235] leading-tight">
              3단계로 완성되는
              <br />
              나만의 보안 브리핑
            </h2>
          </motion.div>
        </div>

        <div className="flex flex-col md:flex-row gap-0 relative">
          {/* 데스크탑 연결선 */}
          <div
            className="hidden md:block absolute top-[52px] left-0 right-0 h-0.5"
            style={{
              background:
                "linear-gradient(90deg, transparent 8%, #e8eaed 20%, #e8eaed 80%, transparent 92%)",
            }}
          />

          {steps.map(({ step, iconSrc, iconAlt, title, desc }, i) => (
            <motion.div
              key={i}
              className="flex-1 flex flex-col items-center text-center px-4 py-4 relative"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15, duration: 0.55 }}
            >
              <div className="relative size-[48px] md:size-[64px] mb-3 z-10">
                <Image src={iconSrc} alt={iconAlt} fill className="object-contain" />
              </div>
              <span className="text-xs font-bold text-[#6bb8d4] tracking-widest mb-2">{step}</span>
              <h3 className="font-bold text-base text-[#1e2235] mb-2">{title}</h3>
              <p className="text-[#3d4f6e] text-xs leading-relaxed max-w-xs">{desc}</p>
              {i < steps.length - 1 && (
                <div className="md:hidden text-[#e8eaed] text-2xl mt-4">↓</div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
