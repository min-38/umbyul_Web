import Link from "next/link";
import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { getProfile, getNotifications } from "@/lib/api";
import { getT } from "@/lib/i18n-server";
import { SearchBar } from "./search-bar";
import { ThemeToggle } from "./theme-toggle";
import { NotificationBell } from "./notification-bell";
import { UserMenu } from "./user-menu";

// 해당 페이지는 추후 → 플레이스홀더(#)
const NAV = [
  { label: "신규", href: "#" },
  { label: "급상승", href: "#" },
  { label: "차트", href: "#" },
];

export async function Header() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let profile = null;
  let notifs = { items: [], unreadCount: 0 } as Awaited<ReturnType<typeof getNotifications>>;
  if (user) {
    try {
      [profile, notifs] = await Promise.all([getProfile(), getNotifications()]);
    } catch {
      // Api 불가 시 익명처럼 처리(헤더는 죽지 않게)
    }
  }

  const t = await getT();

  return (
    <header className="sticky top-0 z-20 border-b border-zinc-200 bg-white/80 backdrop-blur dark:border-zinc-800 dark:bg-black/80">
      {/* 좌/우를 같은 폭(flex-1)으로 두어 가운데 검색란이 페이지 정중앙에 오게 함 */}
      <div className="mx-auto flex w-full max-w-6xl items-center gap-4 px-4 py-2.5">
        {/* 좌: 브랜드 + 네비 */}
        <div className="flex flex-1 items-center gap-1">
          <Link href="/" aria-label={t("홈")} className="shrink-0">
            <span className="glitter-text text-lg font-bold tracking-tight">Glitter</span>
          </Link>
          <nav className="ml-2 hidden items-center gap-1 sm:flex">
            {NAV.map((n) => (
              <Link
                key={n.label}
                href={n.href}
                className="whitespace-nowrap rounded-lg px-2.5 py-1.5 text-sm font-medium text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-900"
              >
                {t(n.label)}
              </Link>
            ))}
          </nav>
        </div>

        {/* 중앙: 검색 (정중앙) */}
        <div className="flex w-[36rem] max-w-full justify-center">
          <Suspense fallback={<div className="w-full max-w-xl" />}>
            <SearchBar />
          </Suspense>
        </div>

        {/* 우: 테마 + 프로필 */}
        <div className="flex flex-1 items-center justify-end gap-1">
          <ThemeToggle />
          {user && <NotificationBell items={notifs.items} unreadCount={notifs.unreadCount} />}
          {user ? (
            <UserMenu username={profile?.username ?? "프로필"} avatarUrl={profile?.avatarUrl ?? null} />
          ) : (
            <Link
              href="/login"
              className="whitespace-nowrap rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-500"
            >
              {t("로그인 / 가입")}
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
