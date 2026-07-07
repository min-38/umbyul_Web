"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useT } from "@/components/i18n-provider";

// 피드=홈 리뷰 타임라인(로고로도 진입). 발견=신규·급상승 허브, 차트=랭킹, 믹스=DJ 세트.
const NAV = [
  { label: "피드", href: "/" },
  { label: "발견", href: "/discover" },
  { label: "차트", href: "/chart" },
  { label: "믹스", href: "/mixes" },
];

const isActive = (pathname: string, href: string) =>
  href === "/" ? pathname === "/" : pathname.startsWith(href);

// 헤더 네비 — 데스크톱 인라인 + 모바일 햄버거 드로어(A11Y-2) + 현재 위치 강조(UX-5).
export function HeaderNav() {
  const t = useT();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const linkCls = (active: boolean, block: boolean) =>
    `${block ? "block" : "whitespace-nowrap"} rounded-lg px-2.5 py-1.5 text-sm font-medium ${
      active
        ? "bg-zinc-100 text-zinc-900 dark:bg-zinc-900 dark:text-zinc-50"
        : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-900"
    }`;

  return (
    <>
      <nav className="ml-2 hidden items-center gap-1 sm:flex" aria-label={t("탐색")}>
        {NAV.map((n) => (
          <Link key={n.label} href={n.href} aria-current={isActive(pathname, n.href) ? "page" : undefined} className={linkCls(isActive(pathname, n.href), false)}>
            {t(n.label)}
          </Link>
        ))}
      </nav>

      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-label={t("메뉴")}
        className="ml-1 rounded-lg p-2 text-zinc-600 hover:bg-zinc-100 sm:hidden dark:text-zinc-300 dark:hover:bg-zinc-900"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
          {open ? <path d="M18 6 6 18M6 6l12 12" /> : <path d="M4 6h16M4 12h16M4 18h16" />}
        </svg>
      </button>

      {open && (
        <nav className="absolute left-0 right-0 top-full flex flex-col gap-0.5 border-b border-zinc-200 bg-white p-2 shadow-sm sm:hidden dark:border-zinc-800 dark:bg-black" aria-label={t("탐색")}>
          {NAV.map((n) => (
            <Link key={n.label} href={n.href} onClick={() => setOpen(false)} aria-current={isActive(pathname, n.href) ? "page" : undefined} className={linkCls(isActive(pathname, n.href), true)}>
              {t(n.label)}
            </Link>
          ))}
        </nav>
      )}
    </>
  );
}
