"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useT } from "@/components/i18n-provider";
import { NAV, isActive } from "./nav-items";

// 헤더 네비 — xl+ 인라인. xl 미만은 하단 탭바(BottomNav)가 담당하므로 렌더하지 않는다.
// 현재 위치 강조(UX-5).
export function HeaderNav() {
  const t = useT();
  const pathname = usePathname();

  return (
    <nav className="ml-2 hidden items-center gap-1 xl:flex" aria-label={t("탐색")}>
      {NAV.map((n) => {
        const active = isActive(pathname, n.href);
        return (
          <Link
            key={n.label}
            href={n.href}
            aria-current={active ? "page" : undefined}
            className={`whitespace-nowrap rounded-lg px-2.5 py-1.5 text-sm font-medium ${
              active
                ? "bg-zinc-100 text-zinc-900 dark:bg-zinc-900 dark:text-zinc-50"
                : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-900"
            }`}
          >
            {t(n.label)}
          </Link>
        );
      })}
    </nav>
  );
}
