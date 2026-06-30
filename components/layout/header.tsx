import Link from "next/link";
import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/app/auth/actions";
import { BrandMark } from "@/components/ui/brand-mark";
import { SearchBar } from "./search-bar";

export async function Header() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <header className="sticky top-0 z-10 flex items-center gap-4 border-b border-zinc-200 bg-white/80 px-4 py-2.5 backdrop-blur dark:border-zinc-800 dark:bg-black/80">
      <Link href="/" aria-label="홈">
        <BrandMark />
      </Link>

      <Suspense fallback={<div className="max-w-xl flex-1" />}>
        <SearchBar />
      </Suspense>

      <div className="ml-auto">
        {user ? (
          <form action={signOut}>
            <button
              type="submit"
              className="rounded-lg px-3 py-1.5 text-sm font-medium text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-900"
            >
              로그아웃
            </button>
          </form>
        ) : (
          <Link
            href="/login"
            className="rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-500"
          >
            로그인
          </Link>
        )}
      </div>
    </header>
  );
}
