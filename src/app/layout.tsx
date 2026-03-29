import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "agent-hub | 圆桌舆论操盘台",
  description: "你来决定平台奖励什么，看一张圆桌如何一步步滑向失控。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
