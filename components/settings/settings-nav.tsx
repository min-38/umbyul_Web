"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useT } from "@/components/i18n-provider";

const TABS = [
  { href: "/settings/account", label: "계정" },
  { href: "/settings/notifications", label: "알림" },
  { href: "/settings/display", label: "화면" },
  { href: "/settings/integrations", label: "연동" },
];

export function SettingsNav() {
  const pathname = usePathname();
  const t = useT();

  return (
    <nav className="flex shrink-0 gap-1 overflow-x-auto border-b border-zinc-200 sm:w-44 sm:flex-col sm:gap-0.5 sm:border-b-0 dark:border-zinc-800">
      {TABS.map((tab) => {
        const active = pathname === tab.href;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`whitespace-nowrap rounded-lg px-3 py-2 text-left text-sm font-medium ${
              active
                ? "bg-zinc-100 text-zinc-900 dark:bg-zinc-900 dark:text-zinc-50"
                : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
            }`}
          >
            {t(tab.label)}
          </Link>
        );
      })}
    </nav>
  );
}
