import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { getProfile, getFeed, getMyGenrePreferences, type FeedSort, type FeedScope } from "@/lib/api";
import { getT, getLocale } from "@/lib/i18n-server";
import { FeedList } from "@/components/feed/feed-list";
import { FeedControls } from "@/components/feed/feed-controls";

const SORTS: FeedSort[] = ["hot", "newest", "likes", "ratio", "rising"];
type View = "card" | "compact";

// FeedControls가 저장한 선호 쿠키(NON-151). URL 파라미터가 없을 때만 첫 렌더 기본값으로 사용.
async function feedPrefs(): Promise<{ sort?: string; scope?: string; view?: string; genre?: string }> {
  const raw = (await cookies()).get("glitter.feedPrefs")?.value;
  if (!raw) return {};
  try {
    return JSON.parse(decodeURIComponent(raw));
  } catch {
    return {};
  }
}

// 홈 = Reddit식 리뷰 피드(NON-88). 상태는 searchParams(SSR) + FeedControls가 localStorage 유지(NON-90).
export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ sort?: string; scope?: string; view?: string; genre?: string }>;
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
  // URL 파라미터가 하나라도 있으면 그대로, 없으면 선호 쿠키로 폴백(리다이렉트 없이 서버에서 확정).
  const hasParams = sp.sort !== undefined || sp.scope !== undefined || sp.view !== undefined || sp.genre !== undefined;
  const prefs = hasParams ? {} : await feedPrefs();
  const rawSort = sp.sort ?? prefs.sort;
  const rawScope = sp.scope ?? prefs.scope;
  const rawView = sp.view ?? prefs.view;
  const rawGenre = sp.genre ?? prefs.genre;
  const sort: FeedSort = SORTS.includes(rawSort as FeedSort) ? (rawSort as FeedSort) : "hot";
  const scope: FeedScope = rawScope === "following" && loggedIn ? "following" : "all";
  const view: View = rawView === "compact" ? "compact" : "card";
  // 내 선호 장르만(NON-88/150) — 로그인 시에만.
  const genre = rawGenre === "preferred" && loggedIn ? "preferred" : undefined;

  const [items, t, locale, preferredGenres] = await Promise.all([
    getFeed(sort, scope, 0, 20, genre),
    getT(),
    getLocale(),
    loggedIn ? getMyGenrePreferences() : Promise.resolve<number[]>([]),
  ]);
  const hasPreferredGenres = preferredGenres.length > 0;

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-4 px-4 py-6">
      <h1 className="sr-only">{t("홈")}</h1>
      <FeedControls sort={sort} scope={scope} view={view} genre={genre ?? null} hasPreferredGenres={hasPreferredGenres} loggedIn={loggedIn} />

      {items.length === 0 ? (
        <p className="rounded-xl border border-dashed border-zinc-300 px-6 py-16 text-center text-sm text-zinc-500 dark:border-zinc-700">
          {t("피드가 비어 있습니다.")}
        </p>
      ) : (
        // key: 정렬·범위가 바뀌면 새 서버 데이터로 리마운트(클라 상태 stale 방지, BUG-7)
        <FeedList key={`${sort}-${scope}-${genre ?? ""}`} items={items} view={view} locale={locale} loggedIn={loggedIn} currentUserId={user?.id ?? null} sort={sort} scope={scope} genre={genre ?? null} trackLabel={t("곡")} albumLabel={t("앨범")} />
      )}
    </div>
  );
}
