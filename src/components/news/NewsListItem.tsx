"use client";

import type { NewsDisplayItem, SeverityLabel } from "@/types/news";

const SEVERITY_STYLE: Record<SeverityLabel, string> = {
  Critical: "bg-[#ef4444] text-white",
  High: "bg-[#f97316] text-white",
  Medium: "bg-[#f59e0b] text-[#1e2235]",
  Low: "bg-[#22c55e] text-white",
  Info: "bg-[#6b7280] text-white",
};

interface Props {
  item: NewsDisplayItem;
  onClick: (item: NewsDisplayItem) => void;
}

export default function NewsListItem({ item, onClick }: Props) {
  const date = item.publishedAt
    ? new Date(item.publishedAt).toLocaleDateString("ko-KR", { month: "short", day: "numeric" })
    : "";

  return (
    <div
      onClick={() => onClick(item)}
      className="bg-white border-b border-[#e8eaed] last:border-b-0 px-5 py-4 flex items-start gap-4 hover:bg-[#f8f9fb] transition-colors duration-150 cursor-pointer"
    >
      {/* 왼쪽: severity 뱃지 */}
      <div className="shrink-0 pt-0.5">
        <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold w-[58px] text-center ${SEVERITY_STYLE[item.severity]}`}>
          {item.severity}
        </span>
        {item.cvss != null && (
          <p className="text-[#6bb8d4] text-[10px] font-medium text-center mt-1">{item.cvss}</p>
        )}
      </div>

      {/* 중앙: 제목 + 요약 + 태그 */}
      <div className="flex-1 min-w-0">
        {item.cveIds.length > 0 && (
          <p className="text-[#6bb8d4] text-[11px] font-semibold mb-0.5">
            {item.cveIds.slice(0, 2).join(" · ")}
            {item.cveIds.length > 2 && ` +${item.cveIds.length - 2}`}
          </p>
        )}
        <h3 className="text-[14px] font-semibold text-[#1e2235] leading-snug mb-1 line-clamp-2">
          {item.title}
        </h3>
        <p className="text-[12px] text-[#6b7c93] leading-[1.65] line-clamp-2 mb-2">
          {item.excerpt}
        </p>
        {item.techStack.length > 0 && (
          <div className="flex gap-1.5 flex-wrap">
            {item.techStack.slice(0, 4).map((tech) => (
              <span key={tech} className="bg-[#f0f2f5] text-[#3d4f6e] text-[10px] font-medium px-2 py-0.5 rounded-md">
                {tech}
              </span>
            ))}
            {item.techStack.length > 4 && (
              <span className="text-[#a8b8d0] text-[10px] self-center">+{item.techStack.length - 4}</span>
            )}
          </div>
        )}
      </div>

      {/* 오른쪽: 출처 + 날짜 + KEV */}
      <div className="shrink-0 flex flex-col items-end gap-1 pt-0.5">
        <span className="text-[11px] text-[#8a9bbd] font-medium">{item.source}</span>
        <span className="text-[11px] text-[#c0ccd8]">{date}</span>
        {item.kevListed && (
          <span className="bg-[#fef2f2] text-[#ef4444] text-[10px] font-bold px-1.5 py-0.5 rounded border border-[#fecaca]">
            KEV
          </span>
        )}
      </div>
    </div>
  );
}
