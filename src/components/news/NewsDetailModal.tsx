"use client";

import { motion, AnimatePresence } from "framer-motion";
import type { NewsDisplayItem, SeverityLabel } from "@/types/news";

const SEVERITY_STYLE: Record<SeverityLabel, string> = {
  Critical: "bg-[#ef4444] text-white",
  High: "bg-[#f97316] text-white",
  Medium: "bg-[#f59e0b] text-[#1e2235]",
  Low: "bg-[#22c55e] text-white",
  Info: "bg-[#6b7280] text-white",
};

interface Props {
  item: NewsDisplayItem | null;
  onClose: () => void;
}

export default function NewsDetailModal({ item, onClose }: Props) {
  return (
    <AnimatePresence>
      {item && (
        <>
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />

          <motion.div
            key="modal"
            initial={{ opacity: 0, y: 40, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.97 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed inset-x-4 top-[5vh] bottom-[5vh] md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:w-[680px] bg-white rounded-2xl z-50 overflow-y-auto shadow-2xl"
          >
            <div className="bg-[#1e2235] px-6 py-4 flex items-start justify-between sticky top-0 rounded-t-2xl">
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`px-2.5 py-1 rounded-md text-[12px] font-bold ${SEVERITY_STYLE[item.severity]}`}>
                  {item.severity}
                </span>
                {item.cvss != null && (
                  <span className="text-[#a8d8ea] text-[12px] font-medium">CVSS {item.cvss}</span>
                )}
                {item.kevListed && (
                  <span className="bg-[#ef4444]/20 text-[#ef4444] text-[11px] font-bold px-2 py-0.5 rounded">KEV</span>
                )}
                {item.ransomwareKnown && (
                  <span className="bg-[#f97316]/20 text-[#f97316] text-[11px] font-bold px-2 py-0.5 rounded">랜섬웨어</span>
                )}
              </div>
              <button
                onClick={onClose}
                className="text-[#a8b8d0] hover:text-white transition-colors text-xl leading-none ml-4 shrink-0"
                aria-label="닫기"
              >
                ✕
              </button>
            </div>

            <div className="p-6 flex flex-col gap-5">
              {item.cveIds.length > 0 && (
                <div className="flex gap-2 flex-wrap">
                  {item.cveIds.map((cve) => (
                    <span key={cve} className="bg-[#e8f4fb] text-[#6bb8d4] text-[12px] font-bold px-3 py-1 rounded-lg">
                      {cve}
                    </span>
                  ))}
                </div>
              )}

              <h2 className="font-black text-[20px] text-[#1e2235] leading-snug">{item.title}</h2>

              <p className="text-[#3d4f6e] text-[14px] leading-[1.8]">{item.excerpt}</p>

              {item.action && (
                <div className="bg-[#f5f6f8] rounded-xl px-5 py-4 border-l-4 border-[#6bb8d4]">
                  <p className="text-[13px] font-bold text-[#6bb8d4] mb-1">대응 방안</p>
                  <p className="text-[#3d4f6e] text-[13px] leading-[1.7]">{item.action}</p>
                </div>
              )}

              {item.affected.length > 0 && (
                <div>
                  <p className="text-[13px] font-bold text-[#1e2235] mb-2">영향 범위</p>
                  <div className="flex flex-col gap-2">
                    {item.affected.map((a, i) => (
                      <div key={i} className="bg-[#f5f6f8] rounded-lg px-4 py-3 text-[12px] text-[#3d4f6e]">
                        <span className="font-bold">{a.product}</span>
                        {a.vendor && <span className="text-[#8a9bbd]"> — {a.vendor}</span>}
                        {a.versions_fixed && (
                          <span className="block mt-0.5 text-[#22c55e]">수정 버전: {a.versions_fixed}</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {item.techStack.length > 0 && (
                <div>
                  <p className="text-[13px] font-bold text-[#1e2235] mb-2">관련 기술</p>
                  <div className="flex gap-2 flex-wrap">
                    {item.techStack.map((tech) => (
                      <span key={tech} className="bg-[#1e2235] text-[#6bb8d4] text-[11px] font-medium px-3 py-1 rounded-full">
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {item.sourceUrl && (
                <a
                  href={item.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 bg-[#1e2235] hover:bg-[#2a3251] text-[#6bb8d4] font-bold text-[14px] px-6 py-3.5 rounded-xl transition-colors duration-200 mt-2"
                >
                  <span>→ 원본 기사 보기</span>
                  <span className="text-[#8a9bbd] text-[12px]">{item.source}</span>
                </a>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
