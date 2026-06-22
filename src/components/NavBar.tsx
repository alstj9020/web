"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, useRef } from "react";

const NAV_LINKS = [
  { label: "뉴스 피드", href: "/news" },
  { label: "대시보드", href: "/dashboard" },
];

export default function NavBar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [hidden, setHidden] = useState(false);
  const lastScrollY = useRef(0);
  const pathname = usePathname();

  useEffect(() => {
    lastScrollY.current = 0;

    if (pathname !== "/") return;

    function handleScroll() {
      if (window.innerWidth >= 768) return;
      const currentY = window.scrollY;
      if (currentY > lastScrollY.current && currentY > 64) {
        setHidden(true);
        setMenuOpen(false);
      } else {
        setHidden(false);
      }
      lastScrollY.current = currentY;
    }

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      setHidden(false);
    };
  }, [pathname]);

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 bg-[#1e2235]/95 backdrop-blur-sm border-b border-white/10 transition-transform duration-300 ${hidden ? "-translate-y-full" : "translate-y-0"}`}>
      <nav className="flex items-center justify-between px-6 md:px-16 lg:px-[120px] h-16 max-w-[1440px] mx-auto">

        {/* 좌측: 로고 + 브랜드명 */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <div className="relative w-8 h-8">
            <Image
              src="/images/haru-hero.svg"
              alt="하루보안 로고"
              fill
              className="object-contain"
            />
          </div>
          <span className="font-bold text-[18px] text-white">하루보안</span>
        </Link>

        {/* 우측: 데스크탑 네비게이션 */}
        <div className="hidden md:flex items-center gap-8">
          <button
            onClick={() => {
              if (pathname === "/") {
                window.scrollTo({ top: 0, behavior: "smooth" });
              } else {
                window.location.href = "/";
              }
            }}
            className={`font-medium text-[15px] transition-colors cursor-pointer ${
              pathname === "/" ? "text-[#6bb8d4]" : "text-[#a8b8d0] hover:text-white"
            }`}
          >
            홈
          </button>

          <Link
            href="/#cta"
            className="font-medium text-[13px] px-4 py-1.5 rounded-full border border-[#6bb8d4] text-[#6bb8d4] hover:bg-[#6bb8d4] hover:text-[#1e2235] transition-all duration-200"
          >
            구독하기
          </Link>

          <Link
            href="/#mcp"
            className="font-medium text-[13px] px-4 py-1.5 rounded-full border border-[#FF9900] text-[#FF9900] hover:bg-[#FF9900] hover:text-[#1e2235] transition-all duration-200"
          >
            MCP 사용법
          </Link>

          {NAV_LINKS.map(({ label, href }) => {
            const isActive = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`font-medium text-[15px] transition-colors ${
                  isActive ? "text-[#6bb8d4]" : "text-[#a8b8d0] hover:text-white"
                }`}
              >
                {label}
              </Link>
            );
          })}
        </div>

        {/* 모바일 햄버거 버튼 */}
        <button
          aria-label="메뉴 열기"
          className="md:hidden flex flex-col justify-center gap-[5px] cursor-pointer p-1"
          onClick={() => setMenuOpen((prev) => !prev)}
        >
          <span
            className={`block w-6 h-[2px] bg-white rounded transition-transform origin-center ${
              menuOpen ? "rotate-45 translate-y-[7px]" : ""
            }`}
          />
          <span
            className={`block w-6 h-[2px] bg-white rounded transition-opacity ${
              menuOpen ? "opacity-0" : ""
            }`}
          />
          <span
            className={`block w-6 h-[2px] bg-white rounded transition-transform origin-center ${
              menuOpen ? "-rotate-45 -translate-y-[7px]" : ""
            }`}
          />
        </button>
      </nav>

      {/* 모바일 드롭다운 메뉴 */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-200 ${
          menuOpen ? "max-h-64" : "max-h-0"
        }`}
      >
        <div className="bg-[#1e2235] border-t border-white/10 px-6 py-3 flex flex-col">
          <button
            onClick={() => {
              setMenuOpen(false);
              if (pathname === "/") {
                window.scrollTo({ top: 0, behavior: "smooth" });
              } else {
                window.location.href = "/";
              }
            }}
            className={`font-medium text-[15px] py-3 border-b border-white/5 transition-colors text-left cursor-pointer ${
              pathname === "/" ? "text-[#6bb8d4]" : "text-[#a8b8d0] hover:text-white"
            }`}
          >
            홈
          </button>
          <Link
            href="/#cta"
            onClick={() => setMenuOpen(false)}
            className="font-medium text-[15px] py-3 border-b border-white/5 text-[#6bb8d4]"
          >
            구독하기
          </Link>
          <Link
            href="/#mcp"
            onClick={() => setMenuOpen(false)}
            className="font-medium text-[15px] py-3 border-b border-white/5 text-[#FF9900]"
          >
            MCP 사용법
          </Link>
          {NAV_LINKS.map(({ label, href }) => {
            const isActive = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setMenuOpen(false)}
                className={`font-medium text-[15px] py-3 border-b border-white/5 last:border-0 transition-colors ${
                  isActive ? "text-[#6bb8d4]" : "text-[#a8b8d0] hover:text-white"
                }`}
              >
                {label}
              </Link>
            );
          })}
        </div>
      </div>
    </header>
  );
}
