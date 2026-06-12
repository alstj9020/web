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
  return (
    <div
      onClick={() => onClick(item)}
      className="bg-white rounded-xl border border-[#e8eaed] px-5 py-4 flex items-start gap-4 hover:shadow-sm hover:border-[#6bb8d4]/40 transition-all duration-200 cursor-pointer"
    >
      <div className="flex flex-col items-center gap-1 shrink-0 w-16">
        <span className={`px-2 py-0.5 rounded-md text-[11px] font-bold w-full text-center ${SEVERITY_STYLE[item.severity]}`}>
          {item.severity}
        </span>
        {item.cvss != null && (
          <span className="text-[#6bb8d4] text-[11px] font-medium">{item.cvss}</span>
        )}
      </div>

      <div className="flex-1 min-w-0">
        {item.cveIds.length > 0 && (
          <p className="text-[#6bb8d4] text-[11px] font-medium mb-1">
            {item.cveIds.slice(0, 2).join(" · ")}
          </p>
        )}
        <h3 className="font-bold text-[15px] text-[#1e2235] leading-snug mb-1 line-clamp-1">{item.title}</h3>
        <p className="text-[#3d4f6e] text-[12px] leading-[1.6] line-clamp-2 mb-2">{item.excerpt}</p>
        <div className="flex gap-1.5 flex-wrap">
          {item.techStack.slice(0, 4).map((tech) => (
            <span key={tech} className="bg-[#f5f6f8] text-[#3d4f6e] text-[10px] font-medium px-2 py-0.5 rounded-md border border-[#e8eaed]">
              {tech}
            </span>
          ))}
        </div>
      </div>

      <div className="shrink-0 text-right flex flex-col gap-1">
        <span className="text-[#8a9bbd] text-[11px]">{item.source}</span>
        <span className="text-[#a8b8d0] text-[11px]">
          {item.publishedAt
            ? new Date(item.publishedAt).toLocaleDateString("ko-KR", { month: "short", day: "numeric" })
            : ""}
        </span>
        {item.kevListed && (
          <span className="bg-[#ef4444]/20 text-[#ef4444] text-[10px] font-bold px-1.5 py-0.5 rounded self-end">KEV</span>
        )}
      </div>
    </div>
  );
}
