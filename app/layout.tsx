import type { Metadata } from "next";
import Script from "next/script";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { SanctionBanner } from "@/components/layout/sanction-banner";
import { I18nProvider } from "@/components/i18n-provider";
import { getLocale, getT } from "@/lib/i18n-server";

// 첫 페인트 전에 테마(.dark) 적용 — 깜빡임(FOUC) 방지
const themeScript = `(function(){try{var t=localStorage.getItem('theme')||'system';var d=t==='dark'||(t==='system'&&matchMedia('(prefers-color-scheme: dark)').matches);if(d)document.documentElement.classList.add('dark');}catch(e){}})();`;

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return {
    title: "Glitter",
    description: t("음악을 듣고 평가하고 기록하세요."),
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [locale, t] = await Promise.all([getLocale(), getT()]);

  return (
    <html
      lang={locale}
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Script id="theme-init" strategy="beforeInteractive">
          {themeScript}
        </Script>
        {/* 키보드 사용자용 본문 바로가기(A11Y-12) — 포커스 시에만 노출 */}
        <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:z-50 focus:rounded focus:bg-white focus:px-3 focus:py-2 focus:text-sm focus:font-medium focus:text-zinc-900 focus:shadow dark:focus:bg-zinc-900 dark:focus:text-zinc-100">
          {t("본문으로 건너뛰기")}
        </a>
        <I18nProvider locale={locale}>
          <Header />
          <SanctionBanner />
          <main id="main" className="flex flex-1 flex-col">{children}</main>
          <Footer />
        </I18nProvider>
      </body>
    </html>
  );
}
