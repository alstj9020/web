"use client";

import { useState } from "react";

type Severity = "Critical" | "High" | "Medium" | "Low";
type Audience = "일반인" | "개발자" | "보안직군";

interface NewsItem {
  id: number;
  title: string;
  excerpt: string;
  severity: Severity;
  audience: Audience;
  source: string;
  date: string;
  cve?: string;
  cvss?: number;
  action: string;
}

const NEWS: NewsItem[] = [
  {
    id: 1,
    title: "국내 대형 쇼핑몰 개인정보 230만 건 유출",
    excerpt: "국내 A 쇼핑몰에서 230만 명의 이름, 연락처, 배송지 주소가 유출됐습니다. 해당 서비스 이용자라면 즉시 비밀번호를 변경하세요.",
    severity: "High",
    audience: "일반인",
    source: "KISA",
    date: "2026-05-29",
    action: "비밀번호 즉시 변경 및 이상 거래 내역 확인",
  },
  {
    id: 2,
    title: "CVE-2026-3812 · Apache Log4j2 원격 코드 실행",
    excerpt: "Log4j2 2.21 이하 버전에서 원격 코드 실행 취약점 발견. JNDI lookup 처리 과정의 입력값 검증 미흡이 원인.",
    severity: "Critical",
    audience: "개발자",
    source: "NVD",
    date: "2026-05-29",
    cve: "CVE-2026-3812",
    cvss: 9.8,
    action: "log4j-core 2.22.0 이상으로 즉시 업그레이드",
  },
  {
    id: 3,
    title: "Lazarus Group, 국내 금융권 대상 워터링홀 캠페인",
    excerpt: "MITRE ATT&CK T1566.001 기반 스피어피싱 확인. IOC: IP 103.45.67.89, 도메인 cdn-update[.]net 즉시 차단 권고.",
    severity: "Critical",
    audience: "보안직군",
    source: "CISA",
    date: "2026-05-29",
    action: "IOC 기반 방화벽 차단 및 EDR 룰 업데이트",
  },
  {
    id: 4,
    title: "카카오 계정 피싱 사이트 급증, 주의 요망",
    excerpt: "카카오 로그인 화면을 모방한 피싱 사이트가 대량 유포되고 있습니다. URL 주소를 반드시 확인하세요.",
    severity: "Medium",
    audience: "일반인",
    source: "KISA",
    date: "2026-05-28",
    action: "URL 확인 후 접속, 2단계 인증 활성화",
  },
  {
    id: 5,
    title: "CVE-2026-2891 · Next.js 서버 사이드 요청 위조",
    excerpt: "Next.js 14.2 이하 Server Actions에서 SSRF 취약점 발견. 내부 네트워크 접근 가능성 있음. CVSS 8.1.",
    severity: "High",
    audience: "개발자",
    source: "GitHub Advisory",
    date: "2026-05-28",
    cve: "CVE-2026-2891",
    cvss: 8.1,
    action: "Next.js 14.3.0 이상 업그레이드",
  },
  {
    id: 6,
    title: "BlackCat 랜섬웨어 변종, 의료 기관 공격 확산",
    excerpt: "ALPHV/BlackCat 랜섬웨어 그룹이 의료 EHR 시스템을 타겟으로 한 변종을 배포 중. ESXi 환경 집중 공격.",
    severity: "Critical",
    audience: "보안직군",
    source: "FBI Advisory",
    date: "2026-05-28",
    action: "ESXi 패치 적용 및 오프라인 백업 점검",
  },
  {
    id: 7,
    title: "구글 계정 2단계 인증 우회 취약점 패치",
    excerpt: "구글이 OAuth 토큰 재사용을 통한 2FA 우회 취약점을 패치했습니다. 자동 업데이트로 이미 적용된 사용자가 대부분입니다.",
    severity: "Medium",
    audience: "일반인",
    source: "Google Security Blog",
    date: "2026-05-27",
    action: "앱 버전 확인 후 최신 업데이트 적용",
  },
  {
    id: 8,
    title: "CVE-2026-1544 · OpenSSL 버퍼 오버플로우",
    excerpt: "OpenSSL 3.3.x에서 TLS 핸드셰이크 처리 중 힙 버퍼 오버플로우 발생. 서비스 거부 및 코드 실행 가능성.",
    severity: "High",
    audience: "개발자",
    source: "OpenSSL Security Advisory",
    date: "2026-05-27",
    cve: "CVE-2026-1544",
    cvss: 7.5,
    action: "OpenSSL 3.3.2 패치 버전 즉시 적용",
  },
  {
    id: 9,
    title: "APT41, 반도체 기업 대상 산업 스파이 활동 포착",
    excerpt: "중국 연계 APT41 그룹이 국내외 반도체 기업을 대상으로 지식재산권 탈취를 목적으로 한 침투 활동을 전개 중.",
    severity: "Critical",
    audience: "보안직군",
    source: "Mandiant",
    date: "2026-05-27",
    action: "내부망 접근 로그 분석 및 DLP 정책 점검",
  },
];

const SEVERITY_STYLE: Record<Severity, string> = {
  Critical: "bg-[#ef4444] text-white",
  High: "bg-[#f97316] text-white",
  Medium: "bg-[#f59e0b] text-[#1e2235]",
  Low: "bg-[#22c55e] text-white",
};

const TABS = ["전체", "일반인", "개발자", "보안직군"] as const;

function NewsCard({ item }: { item: NewsItem }) {
  return (
    <div className="bg-white rounded-2xl border border-[#e8eaed] overflow-hidden flex flex-col hover:shadow-md transition-shadow">
      <div className="bg-[#1e2235] px-5 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={`px-2 py-0.5 rounded-md text-[11px] font-bold ${SEVERITY_STYLE[item.severity]}`}>
            {item.severity}
          </span>
          {item.cvss && (
            <span className="text-[#a8d8ea] text-[11px] font-medium">CVSS {item.cvss}</span>
          )}
        </div>
        <span className="text-[#8a9bbd] text-[11px]">{item.source}</span>
      </div>

      <div className="flex flex-col gap-3 p-5 flex-1">
        {item.cve && (
          <p className="text-[#6bb8d4] text-[12px] font-medium">{item.cve}</p>
        )}
        <h3 className="font-bold text-[16px] text-[#1e2235] leading-snug">{item.title}</h3>
        <p className="text-[#3d4f6e] text-[13px] leading-[1.7] flex-1">{item.excerpt}</p>

        <div className="bg-[#f5f6f8] rounded-lg px-4 py-3 mt-1">
          <p className="text-[#3d4f6e] text-[12px]">
            <span className="font-bold text-[#6bb8d4]">대응 :</span> {item.action}
          </p>
        </div>
      </div>

      <div className="px-5 pb-4 flex items-center justify-between">
        <span className="bg-[#e8eaed] text-[#3d4f6e] text-[11px] font-bold px-2.5 py-1 rounded-lg">
          {item.audience}
        </span>
        <span className="text-[#a8b8d0] text-[11px]">{item.date}</span>
      </div>
    </div>
  );
}

export default function NewsPage() {
  const [activeTab, setActiveTab] = useState<(typeof TABS)[number]>("전체");

  const filtered = activeTab === "전체" ? NEWS : NEWS.filter((n) => n.audience === activeTab);

  return (
    <main className="min-h-screen bg-[#f5f6f8]">
      {/* 헤더 */}
      <section className="bg-[#1e2235] px-6 md:px-16 lg:px-[120px] py-12 md:py-16">
        <div className="max-w-[1200px] mx-auto">
          <p className="text-[#6bb8d4] text-[13px] font-medium tracking-wider mb-3">News Feed</p>
          <h1 className="font-black text-3xl md:text-[44px] text-[#f5f6f8] leading-tight mb-3">
            오늘의 보안 뉴스
          </h1>
          <p className="text-[#a8d8ea] text-base md:text-[18px]">
            {new Date().toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric", weekday: "long" })} 기준
          </p>
        </div>
      </section>

      {/* 필터 탭 */}
      <div className="bg-white border-b border-[#e8eaed] sticky top-16 z-40">
        <div className="max-w-[1200px] mx-auto px-6 md:px-16 lg:px-[120px] flex gap-1 overflow-x-auto">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-4 text-[14px] font-medium whitespace-nowrap border-b-2 transition-colors ${
                activeTab === tab
                  ? "border-[#6bb8d4] text-[#6bb8d4]"
                  : "border-transparent text-[#3d4f6e] hover:text-[#1e2235]"
              }`}
            >
              {tab}
              <span className="ml-1.5 text-[12px] text-[#a8b8d0]">
                ({tab === "전체" ? NEWS.length : NEWS.filter((n) => n.audience === tab).length})
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* 뉴스 그리드 */}
      <div className="max-w-[1200px] mx-auto px-6 md:px-16 lg:px-[120px] py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((item) => (
            <NewsCard key={item.id} item={item} />
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-24 text-[#a8b8d0]">
            <p className="text-[18px]">해당 직군의 뉴스가 없습니다.</p>
          </div>
        )}
      </div>
    </main>
  );
}
