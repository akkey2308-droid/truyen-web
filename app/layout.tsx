import ThemeProvider from "@/components/theme-provider";
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
    <html lang="vi" suppressHydrationWarning>
      <body className="min-h-screen bg-zinc-100 text-zinc-950 dark:bg-zinc-950 dark:text-zinc-100">
        <ThemeProvider>
          <BrowserIdSync />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}