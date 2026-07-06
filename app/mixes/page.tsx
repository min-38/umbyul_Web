import Link from "next/link";
import { loadMixes } from "@/app/actions/sets";
import { createClient } from "@/lib/supabase/server";
import { getT } from "@/lib/i18n-server";
import { MixList } from "@/components/sets/mix-list";

// 믹스 둘러보기 (검색·정렬·페이지네이션) — 헤더 네비.
export default async function MixesPage() {
  const [initial, t] = await Promise.all([loadMixes("", "newest", 0), getT()]);
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-8">
      <div className="mb-5 flex items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">{t("믹스")}</h1>
        {user && (
          <Link
            href="/mixes/new"
            className="rounded-full bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-600 px-4 py-2 text-sm font-medium text-white hover:brightness-110"
          >
            {t("믹스 만들기")}
          </Link>
        )}
      </div>
      <MixList initial={initial} />
    </div>
  );
}
