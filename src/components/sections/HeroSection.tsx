"use client";

import Image from "next/image";
import { motion } from "framer-motion";

export default function HeroSection() {
  const scrollTo = (id: string) => {
    const container = document.querySelector(".snap-container");
    const target = document.getElementById(id);
    if (container && target) {
      container.scrollTo({ top: target.offsetTop, behavior: "smooth" });
    }
  };

  return (
    <section
      className="snap-section flex items-center justify-center bg-[#1e2235] relative overflow-hidden"
      aria-label="히어로"
    >
      {/* 배경 그라디언트 */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 70% 40%, rgba(107,184,212,0.15) 0%, transparent 70%)",
        }}
      />

      <div className="max-w-6xl mx-auto px-6 md:px-12 w-full flex flex-col md:flex-row items-center gap-12 md:gap-20 py-24">
        {/* 텍스트 */}
        <motion.div
          className="flex-1 text-center md:text-left"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <motion.div
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full mb-6"
            style={{
              background: "rgba(107,184,212,0.15)",
              border: "1px solid rgba(107,184,212,0.3)",
            }}
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1, duration: 0.5 }}
          >
            <span className="w-2 h-2 rounded-full bg-[#6bb8d4] inline-block" />
            <span className="text-[#6bb8d4] text-sm font-medium">매일 아침, 보안 브리핑</span>
          </motion.div>

          <h1 className="font-black text-4xl md:text-5xl lg:text-6xl leading-tight text-white mb-6">
            복잡한 보안 이슈,
            <br />
            <span className="text-[#6bb8d4]">하루보안</span>이
            <br />
            쉽게 풀어드려요
          </h1>

          <p className="text-lg leading-relaxed mb-10 max-w-lg mx-auto md:mx-0" style={{ color: "#8A9BBD" }}>
            AI가 매일 보안 뉴스를 분석해
            <br className="hidden md:inline" />
            나의 직군에 맞는 보고서로 전달합니다
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
            <button
              onClick={() => scrollTo("cta")}
              className="inline-flex items-center justify-center px-8 py-4 rounded-xl font-semibold text-[#1e2235] text-base bg-[#6bb8d4] transition-all hover:brightness-110 active:scale-95"
            >
              무료로 시작하기
            </button>
            <button
              onClick={() => scrollTo("how-it-works")}
              className="inline-flex items-center justify-center px-8 py-4 rounded-xl font-semibold text-base border-2 transition-all hover:bg-white/5"
              style={{ color: "#6bb8d4", borderColor: "rgba(107,184,212,0.4)" }}
            >
              서비스 알아보기
            </button>
          </div>
        </motion.div>

        {/* 캐릭터 */}
        <motion.div
          className="flex-shrink-0 flex items-center justify-center"
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2, duration: 0.8, type: "spring" }}
        >
          <div className="haru-float relative w-[160px] h-[160px] md:w-[220px] md:h-[220px]">
            <Image src="/images/haru-hero.svg" alt="하루보안 캐릭터" fill className="object-contain" />
          </div>
        </motion.div>
      </div>

      {/* 스크롤 힌트 */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.6 }}
      >
        <span className="text-xs" style={{ color: "#8A9BBD" }}>스크롤</span>
        <motion.div
          className="w-0.5 h-8 rounded-full"
          style={{ background: "rgba(107,184,212,0.4)" }}
          animate={{ scaleY: [1, 0.4, 1] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
        />
      </motion.div>
    </section>
  );
}
