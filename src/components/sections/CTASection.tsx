"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Toast } from "@/components/ui/Toast";
import {
  AUDIENCE_OPTIONS,
  TIME_OPTIONS,
  TOPICS_BY_AUDIENCE,
  AudienceType,
  TimeType,
  TopicsAudienceType,
} from "@/constants/subscription";

export default function CTASection() {
  const router = useRouter();

  const [selectedAudience, setSelectedAudience] = useState<AudienceType | null>(
    null,
  );
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [selectedTime, setSelectedTime] = useState<TimeType>("오후 12시");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  const toggleTopic = useCallback((topic: string) => {
    setSelectedTopics((prev) =>
      prev.includes(topic) ? prev.filter((t) => t !== topic) : [...prev, topic],
    );
  }, []);

  const handleSubscribe = useCallback(async () => {
    if (!selectedAudience) {
      setToast({ message: "직군을 선택해 주세요.", type: "error" });
      return;
    }
    if (selectedAudience !== "일반인" && selectedTopics.length === 0) {
      setToast({
        message: "관심 주제를 하나 이상 선택해 주세요.",
        type: "error",
      });
      return;
    }
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
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          audience: selectedAudience,
          deliveryTime: selectedTime,
          topics: selectedTopics,
        }),
      });

      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        throw new Error(data.error ?? "구독 중 오류가 발생했습니다.");
      }

      const params = new URLSearchParams({
        email,
        audience: selectedAudience,
        deliveryTime: selectedTime,
        topics: selectedTopics.join(","),
      });
      router.push(`/subscribe/confirm?${params.toString()}`);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "구독 중 오류가 발생했습니다. 다시 시도해 주세요.";
      setToast({ message, type: "error" });
    } finally {
      setLoading(false);
    }
  }, [email, selectedAudience, selectedTopics, selectedTime, router]);

  return (
    <section
      id="cta"
      className="snap-section-cta flex flex-col bg-[#1e2235] relative overflow-hidden"
      aria-label="구독 신청"
    >
      {/* 배경 그라디언트 */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 50% 60% at 20% 60%, rgba(107,184,212,0.12) 0%, transparent 70%)",
        }}
      />

      <div className="flex-1 flex items-center justify-center relative">
        <div className="max-w-lg mx-auto px-6 md:px-8 w-full py-6 md:py-14 text-center">
          <motion.div
            className="flex justify-center mb-4"
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="haru-float relative size-[90px] md:size-[140px]">
              <Image
                src="/images/haru-wink.svg"
                alt="하루보안 윙크 캐릭터"
                fill
                className="object-contain"
              />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.15, duration: 0.6 }}
          >
            <p className="text-[#6bb8d4] font-semibold text-xs mb-2 uppercase tracking-wider">
              무료 구독
            </p>
            <h2 className="font-black text-xl md:text-[28px] leading-[1.4] text-[#f5f6f8] text-center mb-3">
              오늘부터 하루보안 받아보기
            </h2>
            <p
              className="font-normal text-sm md:text-base text-center mb-5"
              style={{ color: "#8A9BBD" }}
            >
              매일 아침, 나에게 맞는 보안 브리핑을 무료로 받으세요.
            </p>
          </motion.div>

          <div className="flex flex-col gap-4 items-center">
            {/* 직군 선택 */}
            <div className="flex flex-col gap-3 items-center justify-center pt-2">
              <p className="font-normal text-[#a8b8d0] text-[13px]">
                직군을 선택해 주세요
              </p>
              <div className="flex flex-wrap gap-3 items-center justify-center">
                {AUDIENCE_OPTIONS.map((option) => (
                  <button
                    key={option}
                    onClick={() => {
                      setSelectedAudience(option);
                      setSelectedTopics([]);
                    }}
                    className={`px-4 py-2 rounded-full font-bold text-[13px] cursor-pointer transition-colors ${
                      selectedAudience === option
                        ? "bg-[#6bb8d4] text-[#1e2235]"
                        : "border-[1.5px] border-[#3d4f6e] text-[#f5f6f8] hover:border-[#6bb8d4]"
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>

            {/* 관심 주제 선택 — 일반인 제외, 직군 선택 후 표시 */}
            {selectedAudience && selectedAudience !== "일반인" && (
              <div className="flex flex-col gap-3 items-center justify-center">
                <p className="font-normal text-[#a8b8d0] text-[13px]">
                  관심 주제를 선택해 주세요
                </p>
                <div className="flex flex-wrap gap-3 items-center justify-center">
                  {TOPICS_BY_AUDIENCE[
                    selectedAudience as TopicsAudienceType
                  ].map((topic) => (
                    <button
                      key={topic}
                      onClick={() => toggleTopic(topic)}
                      className={`px-4 py-2 rounded-full font-medium text-[13px] cursor-pointer transition-colors ${
                        selectedTopics.includes(topic)
                          ? "bg-[#6bb8d4] text-[#1e2235]"
                          : "border-[1.5px] border-[#3d4f6e] text-[#f5f6f8] hover:border-[#6bb8d4]"
                      }`}
                    >
                      {topic}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 시간 선택 */}
            <div className="flex flex-col gap-3 items-center justify-center">
              <p className="font-normal text-[#a8b8d0] text-[13px]">
                받을 시간을 선택해 주세요
              </p>
              <div className="flex flex-wrap gap-3 items-center justify-center">
                {TIME_OPTIONS.map((time) => (
                  <button
                    key={time}
                    onClick={() => setSelectedTime(time)}
                    className={`px-4 py-2 rounded-3xl font-medium text-[13px] text-[#e8eaed] cursor-pointer transition-colors ${
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
                <p className="font-bold text-[15px] text-[#1e2235]">
                  {loading ? "구독 처리 중..." : "무료로 구독 시작하기"}
                </p>
              </button>
            </div>
          </div>
        </div>
      </div>


      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </section>
  );
}
