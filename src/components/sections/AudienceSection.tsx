"use client";

import Image from "next/image";
import { motion } from "framer-motion";

const audiences = [
  {
    badge: "일반인",
    badgeBg: "#6bb8d4",
    iconSrc: "/images/icon-person.svg",
    iconAlt: "일반인 아이콘",
    title: "쉽게 풀어쓴 보안 뉴스",
    desc: "어려운 기술 용어 없이, 내 일상과 연결된 보안 이슈를 쉬운 말로 전달합니다.",
    bullets: [
      "어려운 용어 없이 핵심만",
      "내 계정·기기에 미치는 영향",
      "지금 해야 할 행동 정리",
    ],
    highlighted: false,
  },
  {
    badge: "개발자",
    badgeBg: "#a8d8ea",
    iconSrc: "/images/icon-terminal.svg",
    iconAlt: "개발자 아이콘",
    title: "코드 관점의 위협 분석",
    desc: "내 스택과 관련된 취약점, 최신 패치, 보안 업데이트를 코드 수준으로 안내합니다.",
    bullets: [
      "관련 라이브러리·프레임워크",
      "취약점 패턴과 재현 예시",
      "패치·마이그레이션 가이드",
    ],
    highlighted: true,
  },
  {
    badge: "보안직군",
    badgeBg: "#6bb8d4",
    iconSrc: "/images/icon-shield.svg",
    iconAlt: "보안직군 아이콘",
    title: "실무용 상세 리포트",
    desc: "위협 행위자 프로파일, IOC, MITRE ATT&CK 매핑까지 실무에 필요한 정보를 제공합니다.",
    bullets: [
      "CVE·IOC·CVSS 스코어",
      "공격 체인 및 방어 관점",
      "조직 대응 체크리스트",
    ],
    highlighted: false,
  },
];

export default function AudienceSection() {
  return (
    <section
      className="snap-section flex items-center justify-center bg-[#e8eaed]"
      aria-label="직군별 서비스"
    >
      <div className="max-w-4xl mx-auto px-6 md:px-8 w-full py-6 md:py-14">
        <motion.div
          className="flex flex-col gap-2 items-center text-center mb-5 md:mb-12"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <p className="text-[#6bb8d4] font-semibold text-xs uppercase tracking-wider">
            For Everyone
          </p>
          <h2 className="font-black text-xl md:text-3xl text-[#1e2235]">
            당신의 직군에 맞춘 뉴스레터
          </h2>
          <p className="font-normal text-sm md:text-base text-[#3d4f6e] max-w-xl">
            같은 이슈도, 누구에게 전달하느냐에 따라 다르게 읽혀야 합니다.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 w-full">
          {audiences.map(
            (
              {
                badge,
                badgeBg,
                iconSrc,
                iconAlt,
                title,
                desc,
                bullets,
                highlighted,
              },
              i,
            ) => (
              <motion.div
                key={i}
                className={`bg-[#f5f6f8] rounded-2xl p-4 flex flex-col ${
                  highlighted
                    ? "border-2 border-[#6bb8d4]"
                    : "border border-[#e8eaed]"
                }`}
                style={{ boxShadow: "0 4px 16px rgba(0,0,0,0.08)" }}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12, duration: 0.55 }}
              >
                {/* 아이콘 + 배지 가로 배치 (참조 프로젝트 레이아웃) */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="relative size-[44px] shrink-0">
                    <Image
                      src={iconSrc}
                      alt={iconAlt}
                      fill
                      className="object-contain"
                    />
                  </div>
                  <span
                    className="px-3 py-1 rounded-lg text-sm font-semibold text-[#1e2235] leading-none flex items-center h-7"
                    style={{ background: badgeBg }}
                  >
                    {badge}
                  </span>
                </div>

                <h3 className="text-base font-bold text-[#1e2235] mb-2 whitespace-pre-line">
                  {title}
                </h3>
                <p className="text-[#3d4f6e] text-xs leading-relaxed mb-4">
                  {desc}
                </p>

                <ul className="mt-auto space-y-2">
                  {bullets.map((pt, j) => (
                    <li
                      key={j}
                      className="flex items-center gap-2 text-sm text-[#3d4f6e]"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-[#6bb8d4] flex-shrink-0" />
                      {pt}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ),
          )}
        </div>
      </div>
    </section>
  );
}
