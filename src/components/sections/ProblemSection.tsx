"use client";

import Image from "next/image";
import { motion } from "framer-motion";


function SvgIcon({ src, alt }: { src: string; alt: string }) {
  return (
    <div className="relative size-[44px] shrink-0">
      <Image src={src} alt={alt} fill className="object-contain" />
    </div>
  );
}

const problems = [
  {
    icon: <SvgIcon src="/images/icon-info.svg" alt="너무 많은 정보 아이콘" />,
    title: "너무 많은 정보",
    description: "매일 쏟아지는 보안 기사와 CVE, 전부 확인할 시간이 없습니다.",
  },
  {
    icon: <SvgIcon src="/images/icon-question.svg" alt="어려운 용어 아이콘" />,
    title: "어려운 용어",
    description: "취약점 설명은 대부분 전문가용. 일반인과 개발자에겐 장벽입니다.",
  },
  {
    icon: <SvgIcon src="/images/icon-alert.svg" alt="보안사고 아이콘" />,
    title: "매일 터지는 보안사고",
    description: "해킹, 랜섬웨어, 개인정보 유출… 나와 관련된 사고인지조차 알기 어렵습니다.",
  },
  {
    icon: <SvgIcon src="/images/icon-help.svg" alt="대응 방법 아이콘" />,
    title: "어떻게 대응해야 하지?",
    description: "보안사고가 터졌다는데, 내가 무엇을 해야 할지 아무도 알려주지 않습니다.",
  },
];

export default function ProblemSection() {
  return (
    <section id="problem" className="snap-section flex items-center justify-center bg-[#f5f6f8]" aria-label="문제점">
      <div className="max-w-4xl mx-auto px-6 md:px-8 w-full py-10">
        <div className="flex flex-col md:flex-row items-center gap-8 mb-8 md:mb-10">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="relative size-[100px] haru-float">
              <Image src="/images/haru-serious.svg" alt="하루보안 진지한 캐릭터" fill className="object-contain" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <p className="text-[#6bb8d4] font-semibold text-xs mb-2 uppercase tracking-wider">Problem</p>
            <h2 className="font-black text-2xl md:text-3xl text-[#1e2235] leading-tight">
              보안 정보,
              <br />
              제대로 보고 계신가요?
            </h2>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {problems.map(({ icon, title, description }, i) => (
            <motion.div
              key={i}
              className="bg-white rounded-2xl p-5 border border-[#e8eaed] flex flex-col gap-3"
              style={{ boxShadow: "0 4px 16px rgba(0,0,0,0.08)" }}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
            >
              {icon}
              <p className="font-bold text-base text-[#1e2235]">{title}</p>
              <p className="font-normal text-sm leading-[1.65] text-[#3d4f6e]">{description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
