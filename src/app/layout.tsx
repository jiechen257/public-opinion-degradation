import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "agent-hub | 舆论显影实验台",
  description: "把同一个问题放进双世界实验台，观察讨论如何一步步滑向失控。",
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
