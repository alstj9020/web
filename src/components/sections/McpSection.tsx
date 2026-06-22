"use client";

import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";

const MCP_JSON = `{
  "mcpServers": {
    "haruboan": {
      "type": "http",
      "url": "https://ghnxmv63ot4gyorrfnbs2djvnm0mlotu.lambda-url.ap-northeast-2.on.aws/"
    }
  }
}`;

const steps = [
  {
    num: "01",
    title: "Claude 앱 열기",
    desc: "Claude Desktop 또는 Claude Code CLI를 실행합니다. MCP는 두 환경 모두 지원합니다.",
  },
  {
    num: "02",
    title: "설정 파일에 추가",
    desc: "파일이 없으면 아래 JSON 전체를 .mcp.json으로 저장하세요. 이미 있다면 mcpServers 안에 haruboan 블록만 추가하면 됩니다.",
  },
  {
    num: "03",
    title: "재시작 후 질문",
    desc: "Claude를 재시작하면 하루보안 MCP가 연결됩니다. 취약점 영향을 바로 물어보세요.",
  },
];

export default function McpSection() {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    void navigator.clipboard.writeText(MCP_JSON);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([MCP_JSON], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = ".mcp.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <section
      id="mcp"
      className="snap-section flex flex-col bg-[#f5f6f8] relative overflow-hidden"
      aria-label="하루보안 MCP 사용법"
    >
      <div className="flex-1 flex items-center justify-center">
        <div className="max-w-4xl mx-auto px-6 md:px-8 w-full py-10 md:py-16">
          {/* 헤더 */}
          <motion.div
            className="text-center mb-10"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <p className="text-[#FF9900] font-semibold text-xs mb-2 uppercase tracking-wider">
              MCP Integration
            </p>
            <h2 className="font-black text-2xl md:text-3xl text-[#1e2235] leading-tight mb-3">
              하루보안 MCP 사용법
            </h2>
            <p className="text-[#3d4f6e] text-sm md:text-base max-w-xl mx-auto leading-relaxed">
              Claude에 하루보안 MCP를 연결하면 보안 취약점이 내 프로젝트에
              <br className="hidden md:block" />
              실제로 영향을 주는지 AI가 즉시 분석해줍니다.
            </p>
          </motion.div>

          {/* 스텝 카드 3개 */}
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            {steps.map(({ num, title, desc }, i) => (
              <motion.div
                key={i}
                className="flex-1 bg-white rounded-2xl p-6 border border-[#e8eaed] shadow-sm hover:border-[#FF9900]/40 transition-colors"
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15, duration: 0.55 }}
              >
                <span className="text-xs font-bold text-[#FF9900] tracking-widest">{num}</span>
                <h3 className="font-bold text-base text-[#1e2235] mt-2 mb-2">{title}</h3>
                <p className="text-[#3d4f6e] text-[13px] leading-relaxed">{desc}</p>
              </motion.div>
            ))}
          </div>

          {/* JSON 코드 블록 */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            <div className="bg-white rounded-2xl overflow-hidden border border-[#e8eaed] shadow-sm">
              <div className="flex items-center justify-between px-5 py-3 border-b border-[#e8eaed] bg-[#f5f6f8]">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-[#ef4444]/70" />
                  <div className="w-3 h-3 rounded-full bg-[#f59e0b]/70" />
                  <div className="w-3 h-3 rounded-full bg-[#22c55e]/70" />
                </div>
                <span className="text-[#6b7280] text-[12px] font-mono">.mcp.json</span>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-[#9ca3af] whitespace-nowrap">저장 후 .mcp.json으로 변경</span>
                  <button
                    onClick={handleDownload}
                    className="text-[12px] font-semibold px-3 py-1 rounded-md bg-[#e8eaed] text-[#3d4f6e] hover:bg-[#d1d5db] transition-colors cursor-pointer"
                  >
                    ↓ 다운로드
                  </button>
                  <button
                    onClick={handleCopy}
                    className="text-[12px] font-semibold px-3 py-1 rounded-md bg-[#FF9900]/10 text-[#FF9900] hover:bg-[#FF9900]/20 transition-colors cursor-pointer"
                  >
                    {copied ? "✓ 복사됨" : "복사"}
                  </button>
                </div>
              </div>
              <pre className="px-6 py-5 text-[13px] leading-relaxed overflow-x-auto font-mono bg-white">
                <code>
                  <span className="text-[#24292f]">{"{"}</span>{"\n"}
                  {"  "}<span className="text-[#0550ae]">&quot;mcpServers&quot;</span>
                  <span className="text-[#24292f]">{": {"}</span>{"\n"}
                  {"    "}<span className="text-[#116329]">&quot;haruboan&quot;</span>
                  <span className="text-[#24292f]">{": {"}</span>{"\n"}
                  {"      "}<span className="text-[#0550ae]">&quot;type&quot;</span>
                  <span className="text-[#24292f]">{": "}</span>
                  <span className="text-[#0a3069]">&quot;http&quot;</span>
                  <span className="text-[#24292f]">{","}</span>{"\n"}
                  {"      "}<span className="text-[#0550ae]">&quot;url&quot;</span>
                  <span className="text-[#24292f]">{": "}</span>
                  <span className="text-[#0a3069]">&quot;https://ghnxmv63ot4gyorrfnbs2djvnm0mlotu.lambda-url.ap-northeast-2.on.aws/&quot;</span>{"\n"}
                  {"    "}<span className="text-[#24292f]">{"}"}</span>{"\n"}
                  {"  "}<span className="text-[#24292f]">{"}"}</span>{"\n"}
                  <span className="text-[#24292f]">{"}"}</span>
                </code>
              </pre>
            </div>
          </motion.div>

          {/* 사용 예시 */}
          <motion.div
            className="mt-5 bg-white rounded-2xl p-5 border border-[#e8eaed] shadow-sm"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.45, duration: 0.6 }}
          >
            <p className="text-[#FF9900] text-[11px] font-bold mb-3 uppercase tracking-wider">
              💬 사용 예시
            </p>
            <div className="flex flex-col gap-2">
              <div className="bg-[#f5f6f8] rounded-xl px-4 py-3">
                <p className="text-[#1e2235] text-[13px] italic">
                  &quot;CVE-2024-1234가 우리 Next.js 16 프로젝트에 영향을 주나요?&quot;
                </p>
              </div>
              <div className="flex items-start gap-2 px-1">
                <span className="text-[#FF9900] text-[12px] mt-0.5 shrink-0">→</span>
                <p className="text-[#3d4f6e] text-[12px] leading-relaxed">
                  하루보안 MCP가 최신 취약점 정보를 조회하고, 프로젝트 스택과 비교해 영향 여부를 분석합니다.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* 푸터 */}
      <div className="flex flex-col gap-3 items-center w-full px-6 md:px-8 py-5 bg-[#1e2235] border-t border-white/10">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 w-full max-w-[1280px]">
          <p className="font-bold text-[18px] text-white">하루보안</p>
          <div className="flex flex-wrap gap-4 sm:gap-7 items-center justify-center">
            {["개인정보 처리방침", "이용약관"].map((link) => (
              <p
                key={link}
                className="font-normal text-[13px] text-[#8a9bbd] cursor-pointer hover:text-white transition-colors"
              >
                {link}
              </p>
            ))}
            <Link
              href="/unsubscribe"
              className="font-normal text-[13px] text-[#8a9bbd] hover:text-white transition-colors"
            >
              구독 해지
            </Link>
          </div>
        </div>
        <p className="font-normal text-[12px] text-[#8a9bbd] text-center">
          © 2026 하루보안(HaruBoan). All rights reserved.
        </p>
      </div>
    </section>
  );
}
