import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { BottomNav } from "@/components/layout/bottom-nav";
import { SanctionBanner } from "@/components/layout/sanction-banner";
import { I18nProvider } from "@/components/i18n-provider";
import { ConfirmProvider } from "@/components/ui/confirm-dialog";
import { ReconsentGate } from "@/components/legal/reconsent-gate";
import { getConsentStatus } from "@/lib/api";
import { getLocale, getT } from "@/lib/i18n-server";
import { SITE_URL } from "@/lib/site";

// 첫 페인트 전에 테마(.dark)·color-scheme 적용 — 깜빡임(FOUC) 방지.
// raw <script>로 body 최상단에 인라인 → HTML 파싱 중 동기 실행. (next/script beforeInteractive는 App Router에서
// 첫 페인트 전 실행이 보장되지 않아 다크모드 새로고침 시 흰색 번쩍이 발생했음 — QA5-9.)
const themeScript = `(function(){try{var t=localStorage.getItem('theme')||'system';var d=t==='dark'||(t==='system'&&matchMedia('(prefers-color-scheme: dark)').matches);var e=document.documentElement;if(d)e.classList.add('dark');e.style.colorScheme=d?'dark':'light';}catch(e){}})();`;

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
  const description = t("음악을 듣고 평가하고 기록하세요.");
  return {
    // 상대 OG 경로·canonical을 절대 URL로 해석하는 기준(sitemap/robots와 동일 오리진).
    metadataBase: new URL(SITE_URL),
    title: "UmByul",
    description,
    openGraph: { siteName: "UmByul", type: "website", description },
    twitter: { card: "summary_large_image" },
    // 네이버 서치어드바이저 소유확인(공개 메타값).
    verification: { other: { "naver-site-verification": "50da5bc8249570fbd61adf5d0514dd139f51e780" } },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [locale, t] = await Promise.all([getLocale(), getT()]);
  // 약관/개인정보 재동의 필요 시 앱 대신 게이트 노출(LEG-2/5, NON-148). 비로그인·오류면 null → 통과.
  const consent = await getConsentStatus(locale);
  const pendingConsent = consent?.docs.filter((d) => d.required) ?? [];

  return (
    <html
      lang={locale}
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        {/* 키보드 사용자용 본문 바로가기(A11Y-12) — 포커스 시에만 노출 */}
        <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:z-50 focus:rounded focus:bg-white focus:px-3 focus:py-2 focus:text-sm focus:font-medium focus:text-zinc-900 focus:shadow dark:focus:bg-zinc-900 dark:focus:text-zinc-100">
          {t("본문으로 건너뛰기")}
        </a>
        <I18nProvider locale={locale}>
          <ConfirmProvider>
            {pendingConsent.length > 0 ? (
              <ReconsentGate docs={pendingConsent} />
            ) : (
              <>
                <Header />
                <SanctionBanner />
                <main id="main" className="flex flex-1 flex-col">{children}</main>
                <Footer />
                {/* 하단 탭바(xl 미만 고정) — 위 spacer가 푸터 마지막 줄을 가리지 않도록 높이를 비워둔다.
                    h-14(56px) + 아이폰 홈 인디케이터 safe-area. */}
                <div className="xl:hidden" style={{ height: "calc(3.5rem + env(safe-area-inset-bottom))" }} aria-hidden="true" />
                <BottomNav />
              </>
            )}
          </ConfirmProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
