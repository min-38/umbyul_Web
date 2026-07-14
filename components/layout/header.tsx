import Link from "next/link";
import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { getProfile, getNotifications } from "@/lib/api";
import { getT } from "@/lib/i18n-server";
import { SearchBar } from "./search-bar";
import { ThemeToggle } from "./theme-toggle";
import { NotificationBell } from "./notification-bell";
import { UserMenu } from "./user-menu";
import { HeaderNav } from "./header-nav";

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
      {/* 좌·우를 minmax(0,1fr)로 강제 균등 → 언어별 네비 폭이 달라도 가운데 검색란이 항상 페이지 정중앙(NON-274).
          검색란 폭은 언어 무관(뷰포트 반응형). 넓은 네비는 xl 미만에서 햄버거로 접어 검색란 잘림 방지. */}
      {/* 모바일(<md): 2줄 — [로고+네비 | 테마·프로필] 위, 전폭 검색 아래.
          md+: 기존 3열 그리드(좌 · 정중앙 고정폭 검색 · 우). 검색 고정폭이 좁은 화면을 다 먹어 로고·버튼이 잘리던 문제 해결. */}
      <div className="mx-auto grid w-full max-w-6xl grid-cols-2 items-center gap-x-4 gap-y-2 px-4 py-2.5 md:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] md:gap-y-0">
        {/* 좌: 브랜드 + 네비 */}
        <div className="col-start-1 row-start-1 flex min-w-0 items-center gap-1">
          <Link href="/" className="shrink-0">
            <span className="glitter-text text-lg font-bold tracking-tight">UmByul</span>
          </Link>
          <HeaderNav />
        </div>

        {/* 검색: 모바일 전폭·2번째 줄 / md+ 정중앙 고정폭 */}
        <div className="col-span-2 row-start-2 flex w-full min-w-0 justify-center md:col-span-1 md:col-start-2 md:row-start-1 md:w-[24rem] md:justify-self-center">
          <Suspense fallback={<div className="w-full max-w-xl" />}>
            <SearchBar />
          </Suspense>
        </div>

        {/* 우: 테마 + 프로필 */}
        <div className="col-start-2 row-start-1 flex min-w-0 items-center justify-end gap-1 md:col-start-3">
          <ThemeToggle />
          {user && <NotificationBell items={notifs.items} unreadCount={notifs.unreadCount} />}
          {user ? (
            <UserMenu username={profile?.username ?? t("프로필")} avatarUrl={profile?.avatarUrl ?? null} />
          ) : (
            <Link
              href="/login"
              className="whitespace-nowrap rounded-lg bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-600 px-3 py-1.5 text-sm font-medium text-white transition hover:brightness-110"
            >
              {t("로그인 / 가입")}
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
