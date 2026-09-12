import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CarbonSphere — Carbon-Aware Waste Pathway Optimization Platform",
  description: "Don't optimize waste disposal. Optimize waste utilization. Optimize circular pathways, conversion facilities, freight routes, and carbon/economic dividends.",
  keywords: ["carbon accounting", "biochar", "biogas", "circular economy", "waste valorization", "optimization", "logistics"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col bg-[#080c0b] text-[#f1f5f4] selection:bg-emerald-500/30 selection:text-emerald-300">
        {children}
      </body>
    </html>
  );
}
