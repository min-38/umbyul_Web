"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useT } from "@/components/i18n-provider";
import { NAV, isActive } from "./nav-items";

// 하단 탭바 — xl 미만(폰·패드)에서만. xl+는 헤더 인라인 네비(HeaderNav)가 담당.
// 좌측 셀은 max-w-6xl 상한 탓에 어떤 폭에서도 352px이 최대인데, 최장 로케일 ja 네비는 364.6px를 요구한다.
// → xl 미만에서 인라인 네비를 넣으려면 검색창을 굶겨야 하고 그러면 ja placeholder가 잘린다. 그래서 xl 경계.
// safe-area: 아이폰 홈 인디케이터와 겹치지 않도록 하단 인셋만큼 패딩을 더한다.
export function BottomNav() {
  const t = useT();
  const pathname = usePathname();

  return (
    <nav
      aria-label={t("탐색")}
      className="fixed inset-x-0 bottom-0 z-30 border-t border-zinc-200 bg-white/95 backdrop-blur xl:hidden dark:border-zinc-800 dark:bg-black/95"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <ul className="flex items-stretch">
        {NAV.map((n) => {
          const active = isActive(pathname, n.href);
          return (
            <li key={n.label} className="flex-1">
              <Link
                href={n.href}
                aria-current={active ? "page" : undefined}
                className={`flex h-14 flex-col items-center justify-center gap-1 text-[11px] font-medium ${
                  active ? "text-indigo-600 dark:text-indigo-400" : "text-zinc-500 dark:text-zinc-400"
                }`}
              >
                <n.Icon />
                {t(n.label)}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
