import Link from "next/link";
import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/api";
import { BrandMark } from "@/components/ui/brand-mark";
import { SearchBar } from "./search-bar";
import { ThemeToggle } from "./theme-toggle";
import { UserMenu } from "./user-menu";

// 해당 페이지는 추후 → 플레이스홀더(#)
const NAV = [
  { label: "New", href: "#" },
  { label: "Rising", href: "#" },
  { label: "Charts", href: "#" },
];

export async function Header() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let profile = null;
  if (user) {
    try {
      profile = await getProfile();
    } catch {
      // Api 불가 시 익명처럼 처리(헤더는 죽지 않게)
    }
  }

  return (
    <header className="sticky top-0 z-20 border-b border-zinc-200 bg-white/80 backdrop-blur dark:border-zinc-800 dark:bg-black/80">
      <div className="mx-auto flex w-full max-w-6xl items-center gap-4 px-4 py-2.5">
        <Link href="/" aria-label="홈">
          <BrandMark />
        </Link>

        <nav className="hidden items-center gap-1 sm:flex">
          {NAV.map((n) => (
            <Link
              key={n.label}
              href={n.href}
              className="rounded-lg px-2.5 py-1.5 text-sm font-medium text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-900"
            >
              {n.label}
            </Link>
          ))}
        </nav>

        <div className="flex flex-1 justify-center">
          <Suspense fallback={<div className="w-full max-w-xl" />}>
            <SearchBar />
          </Suspense>
        </div>

        <div className="flex items-center gap-1">
          <ThemeToggle />
          {user ? (
            <UserMenu username={profile?.username ?? "프로필"} avatarUrl={profile?.avatarUrl ?? null} />
          ) : (
            <Link
              href="/login"
              className="whitespace-nowrap rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-500"
            >
              로그인 / 가입
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
