"use client";

import Image from "next/image";
import { useState, useCallback } from "react";
import { Toast } from "@/components/ui/Toast";

const AUDIENCE_OPTIONS = ["일반인", "개발자", "보안직군"] as const;
const TIME_OPTIONS = ["오전 8시", "오후 12시", "오후 6시"] as const;

type AudienceType = (typeof AUDIENCE_OPTIONS)[number];
type TimeType = (typeof TIME_OPTIONS)[number];

export default function CTASection() {
  const [selectedAudience, setSelectedAudience] = useState<AudienceType>("개발자");
  const [selectedTime, setSelectedTime] = useState<TimeType>("오후 12시");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const handleSubscribe = useCallback(async () => {
    if (!email.trim()) {
      setToast({ message: "이메일 주소를 입력해 주세요.", type: "error" });
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setToast({ message: "올바른 이메일 형식이 아닙니다.", type: "error" });
      return;
    }

    setLoading(true);
    try {
      // TODO: 실제 API 연결 시 교체
      await new Promise((r) => setTimeout(r, 800));
      setToast({ message: `${email} 구독 완료! 내일 아침부터 받아보세요.`, type: "success" });
      setEmail("");
    } catch {
      setToast({ message: "구독 중 오류가 발생했습니다. 다시 시도해 주세요.", type: "error" });
    } finally {
      setLoading(false);
    }
  }, [email]);

  return (
    <section className="bg-[#1e2235] flex flex-col gap-5 items-center justify-center w-full px-6 md:px-16 lg:px-[120px] py-16 md:py-24">
      <div className="relative size-[120px] md:size-[140px] shrink-0">
        <Image src="/images/haru-wink.svg" alt="하루보안 윙크 캐릭터" fill className="object-contain" />
      </div>

      <h2 className="font-black text-2xl md:text-[40px] leading-[1.4] text-[#f5f6f8] text-center">
        지금 구독하고, 내일 아침부터 받아보세요
      </h2>
      <p className="font-normal text-base md:text-[18px] text-[#a8d8ea] text-center">
        무료 · 1일 1회 · 언제든 해지 가능
      </p>

      {/* 직군 선택 */}
      <div className="flex flex-wrap gap-3 items-center justify-center pt-2">
        {AUDIENCE_OPTIONS.map((option) => (
          <button
            key={option}
            onClick={() => setSelectedAudience(option)}
            className={`px-5 py-[10px] rounded-full font-bold text-[14px] cursor-pointer transition-colors ${
              selectedAudience === option
                ? "bg-[#6bb8d4] text-[#1e2235]"
                : "border-[1.5px] border-[#3d4f6e] text-[#f5f6f8] hover:border-[#6bb8d4]"
            }`}
          >
            {option}
          </button>
        ))}
      </div>

      {/* 시간 선택 */}
      <div className="flex flex-col gap-3 items-center justify-center">
        <p className="font-normal text-[#a8b8d0] text-[14px]">받을 시간을 선택해 주세요</p>
        <div className="flex flex-wrap gap-3 items-center justify-center">
          {TIME_OPTIONS.map((time) => (
            <button
              key={time}
              onClick={() => setSelectedTime(time)}
              className={`px-5 py-[10px] rounded-3xl font-medium text-[14px] text-[#e8eaed] cursor-pointer transition-colors ${
                selectedTime === time
                  ? "bg-[#6bb8d4]"
                  : "border-[1.5px] border-[rgba(107,184,212,0.5)] hover:border-[#6bb8d4]"
              }`}
            >
              {time}
            </button>
          ))}
        </div>
      </div>

      {/* 구독 폼 */}
      <div className="bg-[#f5f6f8] flex flex-col gap-2 items-center p-2 rounded-2xl w-full max-w-[416px]">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSubscribe()}
          placeholder="이메일 주소를 입력하세요"
          className="w-full px-4 py-3 rounded-xl bg-white text-[#1e2235] text-[15px] placeholder:text-[#a8b8d0] border border-[#e8eaed] focus:outline-none focus:border-[#6bb8d4] transition-colors"
        />
        <button
          onClick={handleSubscribe}
          disabled={loading}
          className="bg-[#6bb8d4] flex h-14 items-center justify-center px-8 rounded-xl w-full cursor-pointer hover:opacity-90 transition-opacity disabled:opacity-60 disabled:cursor-not-allowed"
        >
          <p className="font-bold text-[18px] text-[#1e2235]">
            {loading ? "구독 처리 중..." : "무료로 구독 시작하기"}
          </p>
        </button>
      </div>

      {/* 푸터 */}
      <div className="flex flex-col gap-3 items-center w-full mt-6 pt-6 border-t border-white/10">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 w-full max-w-[1280px]">
          <p className="font-bold text-[18px] text-white">하루보안</p>
          <div className="flex flex-wrap gap-4 sm:gap-7 items-center justify-center">
            {["서비스 소개", "개인정보 처리방침", "이용약관", "구독 해지"].map((link) => (
              <p key={link} className="font-normal text-[13px] text-[#8a9bbd] cursor-pointer hover:text-white transition-colors">
                {link}
              </p>
            ))}
          </div>
        </div>
        <p className="font-normal text-[12px] text-[#8a9bbd] text-center">
          © 2026 하루보안(HaruBoan). All rights reserved.
        </p>
      </div>

      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}
    </section>
  );
}
