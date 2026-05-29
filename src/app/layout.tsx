import type { Metadata } from "next";
import { Noto_Sans_KR } from "next/font/google";
import NavBar from "@/components/NavBar";
import "./globals.css";

const notoSansKR = Noto_Sans_KR({
  variable: "--font-noto",
  subsets: ["latin"],
  weight: ["400", "500", "700", "900"],
});

export const metadata: Metadata = {
  title: "하루보안 — 매일 아침, 당신에게 맞는 보안 뉴스",
  description:
    "보안 이슈를 자동 수집하고, AI가 당신의 직군에 맞게 풀어드립니다.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className={`${notoSansKR.variable} antialiased`}>
      <body className="pt-16">
        <NavBar />
        {children}
      </body>
    </html>
  );
}
