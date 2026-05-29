"use client";

import { useEffect } from "react";

export interface ToastState {
  message: string;
  type: "success" | "error";
}

interface ToastProps extends ToastState {
  onClose: () => void;
}

export function Toast({ message, type, onClose }: ToastProps) {
  useEffect(() => {
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div
      className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-5 py-3 rounded-xl shadow-lg min-w-[280px] max-w-[90vw] ${
        type === "success" ? "bg-[#6bb8d4] text-[#1e2235]" : "bg-[#ef4444] text-white"
      }`}
    >
      <span className="text-[18px] shrink-0">{type === "success" ? "✓" : "✕"}</span>
      <p className="font-medium text-[14px] flex-1">{message}</p>
      <button onClick={onClose} className="opacity-70 hover:opacity-100 text-[20px] leading-none shrink-0">
        ×
      </button>
    </div>
  );
}
