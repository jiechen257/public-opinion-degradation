import type { Metadata } from "next";
import { Noto_Sans_SC, Noto_Serif_SC } from "next/font/google";
import "./globals.css";

const bodySans = Noto_Sans_SC({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["400", "500", "700"],
});

const displaySerif = Noto_Serif_SC({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["500", "700"],
});

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
      <body className={`${bodySans.variable} ${displaySerif.variable}`}>
        {children}
      </body>
    </html>
  );
}
