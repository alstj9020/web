"use client";

import { useState } from "react";
import { motion } from "framer-motion";

interface EmailCardData {
  type: "일반인" | "개발자" | "보안직군";
  badgeBg: string;
  badgeTextColor: string;
  date: string;
  title: string;
  body: string;
  tip: string;
  badgeLabel: string;
  badgeColor: string;
}

const emails: EmailCardData[] = [
  {
    type: "일반인",
    badgeBg: "#6bb8d4",
    badgeTextColor: "white",
    date: "[하루보안] 오늘의 보안 브리핑 — 4월 19일",
    title: "국내 대형 쇼핑몰 개인정보 유출",
    body: "오늘 오전, 국내 대형 온라인 쇼핑몰에서 약 230만 명의 개인정보가 유출된 것으로 확인됐습니다. 이름, 전화번호, 배송지 주소가 포함되어 있으니 비밀번호를 즉시 변경하고 스팸 전화에 주의하세요.",
    tip: "보안 팁: 동일한 비밀번호를 여러 사이트에 사용하지 마세요.",
    badgeLabel: "위협",
    badgeColor: "#ff6b6b",
  },
  {
    type: "개발자",
    badgeBg: "#1e2235",
    badgeTextColor: "white",
    date: "[하루보안] CVE 브리핑 — 2026-04-19",
    title: "CVE-2026-1234 · CVSS 9.8 Critical",
    body: "Apache Log4j2 ≤ 2.20 원격코드 실행 취약점이 발견되었습니다. log4j-core를 포함하는 모든 Java 서비스에 영향을 줍니다. 2.21.0 즉시 업그레이드를 권장합니다.",
    tip: "$ mvn versions:use-latest-versions -Dincludes=org.apache.logging.log4j:log4j-core",
    badgeLabel: "Critical",
    badgeColor: "#ef4444",
  },
  {
    type: "보안직군",
    badgeBg: "#323c50",
    badgeTextColor: "white",
    date: "[하루보안] 위협 인텔리전스 — 2026-04-19",
    title: "Lazarus Group 신규 캠페인 탐지",
    body: "MITRE ATT&CK T1566.001 (Spearphishing). IOC — IP: 103.45.67.89 | 도메인: cdn-update[.]net. 한국 금융권 대상 워터링홀 공격이 확인되었습니다.",
    tip: "관련 컴플라이언스: ISMS-P 2.9.1 | Firewall 차단 및 EDR 룰 업데이트 권장",
    badgeLabel: "APT",
    badgeColor: "#8b5cf6",
  },
];

function EmailCard({ data, delay }: { data: EmailCardData; delay: number }) {
  return (
    <motion.div
      className="bg-white rounded-2xl overflow-hidden w-full"
      style={{ boxShadow: "0 4px 24px rgba(0,0,0,0.10)", border: "1px solid #e8eaed" }}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.55 }}
    >
      <div className="bg-[#1e2235] h-14 flex items-center px-5 relative shrink-0">
        <p className="font-bold text-[14px] text-white">하루보안</p>
        <div
          className="absolute right-5 h-6 rounded-[6px] w-14 flex items-center justify-center"
          style={{ background: data.badgeBg }}
        >
          <p className="font-bold text-[11px]" style={{ color: data.badgeTextColor }}>
            {data.type}
          </p>
        </div>
      </div>

      <div className="flex flex-col px-6 py-5 flex-1 min-h-[280px]">
        <p className="text-[#3d4f6e] text-[10px] mb-3">{data.date}</p>
        <div className="bg-[#e8eaed] h-px mb-3" />

        <div className="flex items-start justify-between gap-2 mb-3">
          <p className="font-bold text-[#1e2235] text-[14px] flex-1">{data.title}</p>
          <div
            className="h-5 px-2 rounded-[5px] flex items-center justify-center shrink-0"
            style={{ background: data.badgeColor }}
          >
            <p className="font-bold text-[10px] text-white whitespace-nowrap">{data.badgeLabel}</p>
          </div>
        </div>

        <p className="text-[#3d4f6e] text-[12px] leading-[1.75] flex-1">{data.body}</p>
        <p className="text-[#6bb8d4] text-[11px] leading-[1.6] mt-4 break-all">{data.tip}</p>
      </div>
    </motion.div>
  );
}

export default function EmailPreviewSection() {
  const [active, setActive] = useState(0);

  return (
    <section className="snap-section flex items-center justify-center bg-[#e8eaed]" aria-label="이메일 예시">
      <div className="max-w-6xl mx-auto px-6 md:px-12 w-full py-20">
        <motion.div
          className="flex flex-col gap-3 items-center text-center mb-14"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <p className="font-medium text-[#6bb8d4] text-[13px] tracking-[0.65px] uppercase">Email Preview</p>
          <h2 className="font-bold text-[#1e2235] text-3xl md:text-4xl">이런 보고서를 받게 돼요</h2>
          <p className="text-[#3d4f6e] text-base md:text-[16px]">
            직군에 따라 다른 시각으로 같은 보안 이슈를 전달합니다
          </p>
        </motion.div>

        {/* 모바일 탭 */}
        <div className="flex gap-3 justify-center mb-8 md:hidden">
          {emails.map((e, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className="px-4 py-2 rounded-xl text-sm font-semibold transition-all"
              style={
                active === i
                  ? { background: "#1e2235", color: "#fff" }
                  : { background: "#fff", color: "#3d4f6e", border: "1px solid #e8eaed" }
              }
            >
              {e.type}
            </button>
          ))}
        </div>

        {/* 데스크탑: 3열 grid */}
        <div className="hidden md:grid grid-cols-3 gap-6">
          {emails.map((e, i) => (
            <EmailCard key={i} data={e} delay={i * 0.1} />
          ))}
        </div>

        {/* 모바일: 활성 탭 */}
        <div className="md:hidden">
          <EmailCard data={emails[active]} delay={0} />
        </div>
      </div>
    </section>
  );
}
