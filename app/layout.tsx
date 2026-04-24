import type { Metadata } from "next";
import "./globals.css";
import BrowserIdSync from "@/components/browser-id-sync";

export const metadata: Metadata = {
  title: "Bãi Rác Vũ Trụ",
  description: "循此苦旅，终抵繁星",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body className="min-h-screen bg-black text-zinc-100">
        <BrowserIdSync />
        {children}
      </body>
    </html>
  );
}