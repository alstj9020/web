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

export default function NewsCard({ item, onClick }: Props) {
  return (
    <div
      onClick={() => onClick(item)}
      className="bg-white rounded-2xl border border-[#e8eaed] overflow-hidden flex flex-col hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
    >
      <div className="bg-[#1e2235] px-5 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={`px-2 py-0.5 rounded-md text-[11px] font-bold ${SEVERITY_STYLE[item.severity]}`}>
            {item.severity}
          </span>
          {item.cvss != null && (
            <span className="text-[#a8d8ea] text-[11px] font-medium">CVSS {item.cvss}</span>
          )}
          {item.kevListed && (
            <span className="bg-[#ef4444]/20 text-[#ef4444] text-[10px] font-bold px-1.5 py-0.5 rounded">KEV</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {item.sourceCount > 1 && (
            <span className="text-[#6bb8d4] text-[11px]">출처 {item.sourceCount}개</span>
          )}
          <span className="text-[#8a9bbd] text-[11px]">{item.source}</span>
        </div>
      </div>

      <div className="flex flex-col gap-3 p-5 flex-1">
        {item.cveIds.length > 0 && (
          <p className="text-[#6bb8d4] text-[12px] font-medium">
            {item.cveIds.slice(0, 2).join(" · ")}
            {item.cveIds.length > 2 && ` 外 ${item.cveIds.length - 2}건`}
          </p>
        )}
        <h3 className="font-bold text-[16px] text-[#1e2235] leading-snug">{item.title}</h3>
        <p className="text-[#3d4f6e] text-[13px] leading-[1.7] flex-1 line-clamp-4">{item.excerpt}</p>
        {item.action && (
          <div className="bg-[#f5f6f8] rounded-lg px-4 py-3 mt-1">
            <p className="text-[#3d4f6e] text-[12px]">
              <span className="font-bold text-[#6bb8d4]">대응 :</span> {item.action}
            </p>
          </div>
        )}
      </div>

      <div className="px-5 pb-4 flex items-center justify-between flex-wrap gap-2">
        <div className="flex gap-1.5 flex-wrap">
          {item.techStack.slice(0, 3).map((tech) => (
            <span key={tech} className="bg-[#f5f6f8] text-[#3d4f6e] text-[10px] font-medium px-2 py-0.5 rounded-md border border-[#e8eaed]">
              {tech}
            </span>
          ))}
          {item.techStack.length > 3 && (
            <span className="text-[#a8b8d0] text-[10px] px-1">+{item.techStack.length - 3}</span>
          )}
        </div>
        <span className="text-[#a8b8d0] text-[11px]">
          {item.publishedAt
            ? new Date(item.publishedAt).toLocaleDateString("ko-KR", { month: "short", day: "numeric" })
            : item.affected[0]?.vendor ?? ""}
        </span>
      </div>
    </div>
  );
}
