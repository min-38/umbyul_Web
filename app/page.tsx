import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getProfile, getFeed, type FeedSort, type FeedScope } from "@/lib/api";
import { getT, getLocale } from "@/lib/i18n-server";
import { FeedList } from "@/components/feed/feed-list";
import { FeedControls } from "@/components/feed/feed-controls";

const SORTS: FeedSort[] = ["hot", "newest", "likes", "ratio", "rising"];
type View = "card" | "compact";

// 홈 = Reddit식 리뷰 피드(NON-88). 상태는 searchParams(SSR) + FeedControls가 localStorage 유지(NON-90).
export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ sort?: string; scope?: string; view?: string }>;
}) {
  // 로그인했지만 프로필 없는 신규 유저는 온보딩으로(Api 불가 시 게이트 스킵).
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  let loggedIn = false;
  if (user) {
    let profile = null;
    let reachable = true;
    try {
      profile = await getProfile();
    } catch {
      reachable = false;
    }
    if (reachable && !profile) redirect("/onboarding");
    loggedIn = !!profile;
  }

  const sp = await searchParams;
  const sort: FeedSort = SORTS.includes(sp.sort as FeedSort) ? (sp.sort as FeedSort) : "hot";
  const scope: FeedScope = sp.scope === "following" && loggedIn ? "following" : "all";
  const view: View = sp.view === "compact" ? "compact" : "card";

  const [items, t, locale] = await Promise.all([getFeed(sort, scope), getT(), getLocale()]);

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-4 px-4 py-6">
      <h1 className="sr-only">{t("홈")}</h1>
      <FeedControls sort={sort} scope={scope} view={view} loggedIn={loggedIn} />

      {items.length === 0 ? (
        <p className="rounded-xl border border-dashed border-zinc-300 px-6 py-16 text-center text-sm text-zinc-500 dark:border-zinc-700">
          {t("피드가 비어 있습니다.")}
        </p>
      ) : (
        // key: 정렬·범위가 바뀌면 새 서버 데이터로 리마운트(클라 상태 stale 방지, BUG-7)
        <FeedList key={`${sort}-${scope}`} items={items} view={view} locale={locale} loggedIn={loggedIn} currentUserId={user?.id ?? null} sort={sort} scope={scope} trackLabel={t("곡")} albumLabel={t("앨범")} />
      )}
    </div>
  );
}
