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
      className="bg-white border-b border-[#e8eaed] px-4 py-3 flex items-center gap-3 hover:bg-[#f5f6f8] transition-colors duration-150 cursor-pointer first:rounded-t-xl last:rounded-b-xl"
    >
      <span className={`px-2 py-0.5 rounded text-[10px] font-bold shrink-0 ${SEVERITY_STYLE[item.severity]}`}>
        {item.severity}
      </span>

      {item.kevListed && (
        <span className="bg-[#ef4444]/15 text-[#ef4444] text-[10px] font-bold px-1.5 py-0.5 rounded shrink-0">
          KEV
        </span>
      )}

      {item.cveIds.length > 0 && (
        <span className="text-[#6bb8d4] text-[11px] font-medium shrink-0 hidden sm:block">
          {item.cveIds[0]}
        </span>
      )}

      <h3 className="flex-1 text-[14px] font-medium text-[#1e2235] truncate">{item.title}</h3>

      <span className="text-[#a8b8d0] text-[11px] shrink-0">
        {item.publishedAt
          ? new Date(item.publishedAt).toLocaleDateString("ko-KR", { month: "short", day: "numeric" })
          : ""}
      </span>
    </div>
  );
}
