// FILE: src/app/layout.tsx

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
  title: "Tu Tiên Chinese",
  description: "Hệ thống tu luyện tiếng Trung",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // "Bùa chú" 1: Thêm suppressHydrationWarning vào html
    <html lang="en" suppressHydrationWarning={true}>
      <body
        // "Bùa chú" 2: Thêm suppressHydrationWarning vào body (Quan trọng!)
        suppressHydrationWarning={true}
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}