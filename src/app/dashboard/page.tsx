type Severity = "Critical" | "High" | "Medium" | "Low";

const STATS = [
  { label: "오늘 수집된 이슈", value: "47", unit: "건", delta: "+12", positive: false },
  { label: "Critical CVE", value: "3", unit: "건", delta: "+1", positive: false },
  { label: "오늘 발송 완료", value: "1,284", unit: "건", delta: "100%", positive: true },
  { label: "누적 구독자", value: "1,284", unit: "명", delta: "+38", positive: true },
];

const SEVERITY_DIST: { label: Severity; count: number; color: string }[] = [
  { label: "Critical", count: 3, color: "#ef4444" },
  { label: "High", count: 12, color: "#f97316" },
  { label: "Medium", count: 18, color: "#f59e0b" },
  { label: "Low", count: 14, color: "#22c55e" },
];
const TOTAL = SEVERITY_DIST.reduce((s, d) => s + d.count, 0);

const RECENT_ISSUES = [
  { cve: "CVE-2026-3812", title: "Apache Log4j2 원격 코드 실행", cvss: 9.8, severity: "Critical" as Severity, date: "2026-05-29", source: "NVD" },
  { cve: "CVE-2026-2891", title: "Next.js Server Actions SSRF", cvss: 8.1, severity: "High" as Severity, date: "2026-05-28", source: "GitHub" },
  { cve: "CVE-2026-1544", title: "OpenSSL 힙 버퍼 오버플로우", cvss: 7.5, severity: "High" as Severity, date: "2026-05-27", source: "OpenSSL" },
  { cve: "CVE-2026-0993", title: "Kubernetes API 서버 인증 우회", cvss: 7.2, severity: "High" as Severity, date: "2026-05-26", source: "CNCF" },
  { cve: "CVE-2026-0712", title: "Linux Kernel 권한 상승 취약점", cvss: 6.7, severity: "Medium" as Severity, date: "2026-05-25", source: "NVD" },
];

const SEVERITY_BADGE: Record<Severity, string> = {
  Critical: "bg-[#ef4444] text-white",
  High: "bg-[#f97316] text-white",
  Medium: "bg-[#f59e0b] text-[#1e2235]",
  Low: "bg-[#22c55e] text-white",
};

export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-[#f5f6f8]">
      {/* 헤더 */}
      <section className="bg-[#1e2235] px-6 md:px-16 lg:px-[120px] py-12 md:py-16">
        <div className="max-w-[1200px] mx-auto">
          <p className="text-[#6bb8d4] text-[13px] font-medium tracking-wider mb-3">Dashboard</p>
          <h1 className="font-black text-3xl md:text-[44px] text-[#f5f6f8] leading-tight mb-3">
            보안 현황 대시보드
          </h1>
          <p className="text-[#a8d8ea] text-base md:text-[18px]">
            {new Date().toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric", weekday: "long" })} 기준
          </p>
        </div>
      </section>

      <div className="max-w-[1200px] mx-auto px-6 md:px-16 lg:px-[120px] py-10 flex flex-col gap-8">

        {/* 통계 카드 */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {STATS.map(({ label, value, unit, delta, positive }) => (
            <div key={label} className="bg-white rounded-2xl border border-[#e8eaed] px-5 py-5 flex flex-col gap-2">
              <p className="text-[#3d4f6e] text-[13px]">{label}</p>
              <div className="flex items-baseline gap-1">
                <span className="font-black text-[28px] md:text-[32px] text-[#1e2235]">{value}</span>
                <span className="text-[#3d4f6e] text-[13px]">{unit}</span>
              </div>
              <span className={`text-[12px] font-medium ${positive ? "text-[#22c55e]" : "text-[#ef4444]"}`}>
                {positive ? "▲" : "▲"} {delta} 어제 대비
              </span>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* CVE 심각도 분포 */}
          <div className="bg-white rounded-2xl border border-[#e8eaed] p-6">
            <h2 className="font-bold text-[18px] text-[#1e2235] mb-1">CVE 심각도 분포</h2>
            <p className="text-[#3d4f6e] text-[13px] mb-6">오늘 수집된 {TOTAL}건 기준</p>

            <div className="flex flex-col gap-4">
              {SEVERITY_DIST.map(({ label, count, color }) => (
                <div key={label} className="flex items-center gap-3">
                  <span className="text-[13px] font-medium text-[#3d4f6e] w-16 shrink-0">{label}</span>
                  <div className="flex-1 bg-[#e8eaed] rounded-full h-3 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${(count / TOTAL) * 100}%`, background: color }}
                    />
                  </div>
                  <span className="text-[13px] font-bold text-[#1e2235] w-8 text-right shrink-0">{count}</span>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-5 border-t border-[#e8eaed] flex gap-4 flex-wrap">
              {SEVERITY_DIST.map(({ label, count, color }) => (
                <div key={label} className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: color }} />
                  <span className="text-[12px] text-[#3d4f6e]">{label} <strong>{Math.round((count / TOTAL) * 100)}%</strong></span>
                </div>
              ))}
            </div>
          </div>

          {/* 수집 소스 현황 */}
          <div className="bg-white rounded-2xl border border-[#e8eaed] p-6">
            <h2 className="font-bold text-[18px] text-[#1e2235] mb-1">수집 소스 현황</h2>
            <p className="text-[#3d4f6e] text-[13px] mb-6">오늘 활성 크롤링 소스</p>

            <div className="flex flex-col gap-3">
              {[
                { name: "NVD (미국)", count: 18, status: "정상" },
                { name: "KISA (한국)", count: 9, status: "정상" },
                { name: "GitHub Advisory", count: 11, status: "정상" },
                { name: "Reddit r/netsec", count: 6, status: "정상" },
                { name: "CISA Alerts", count: 3, status: "정상" },
              ].map(({ name, count, status }) => (
                <div key={name} className="flex items-center justify-between py-2.5 border-b border-[#f5f6f8] last:border-0">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-[#22c55e]" />
                    <span className="text-[14px] text-[#1e2235] font-medium">{name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[13px] text-[#3d4f6e]">{count}건</span>
                    <span className="text-[11px] text-[#22c55e] bg-[#f0fdf4] px-2 py-0.5 rounded-md font-medium">{status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 최근 주요 CVE 테이블 */}
        <div className="bg-white rounded-2xl border border-[#e8eaed] overflow-hidden">
          <div className="px-6 py-5 border-b border-[#e8eaed]">
            <h2 className="font-bold text-[18px] text-[#1e2235]">최근 주요 CVE</h2>
            <p className="text-[#3d4f6e] text-[13px] mt-0.5">CVSS 6.0 이상 최신 취약점</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-[#f5f6f8] text-left">
                  {["CVE ID", "제목", "CVSS", "심각도", "날짜", "출처"].map((h) => (
                    <th key={h} className="px-5 py-3 text-[12px] font-bold text-[#3d4f6e] whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {RECENT_ISSUES.map((issue, i) => (
                  <tr
                    key={issue.cve}
                    className={`border-t border-[#f5f6f8] hover:bg-[#fafbfc] transition-colors ${i % 2 === 0 ? "" : "bg-[#fafbfc]"}`}
                  >
                    <td className="px-5 py-4 text-[13px] text-[#6bb8d4] font-medium whitespace-nowrap">
                      {issue.cve}
                    </td>
                    <td className="px-5 py-4 text-[13px] text-[#1e2235] font-medium max-w-[240px]">
                      {issue.title}
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-[13px] font-bold text-[#1e2235]">{issue.cvss}</span>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`px-2 py-0.5 rounded-md text-[11px] font-bold ${SEVERITY_BADGE[issue.severity]}`}>
                        {issue.severity}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-[12px] text-[#a8b8d0] whitespace-nowrap">{issue.date}</td>
                    <td className="px-5 py-4 text-[12px] text-[#3d4f6e]">{issue.source}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </main>
  );
}
