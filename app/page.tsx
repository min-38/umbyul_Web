import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getProfile, getFeed, type FeedSort, type FeedScope } from "@/lib/api";
import { getT, getLocale } from "@/lib/i18n-server";
import { FeedList } from "@/components/feed/feed-list";
import { SortDropdown } from "@/components/feed/sort-dropdown";

const SORTS: FeedSort[] = ["hot", "newest", "likes", "ratio", "rising"];
type View = "card" | "compact";

// 홈 = Reddit식 리뷰 피드(NON-88). 정렬·스코프(전체/팔로잉)·보기(카드/축약)는 searchParams.
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

  const sortLabel: Record<FeedSort, string> = {
    hot: t("화제순"),
    newest: t("최신순"),
    likes: t("좋아요 많은 순"),
    ratio: t("좋아요 비율 높은 순"),
    rising: t("급상승"),
  };

  const hrefFor = (o: { sort?: string; scope?: string; view?: string }) =>
    `/?${new URLSearchParams({ sort: o.sort ?? sort, scope: o.scope ?? scope, view: o.view ?? view })}`;

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-4 px-4 py-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex gap-1">
          <Pill href={hrefFor({ scope: "all" })} active={scope === "all"}>{t("전체")}</Pill>
          {loggedIn && (
            <Pill href={hrefFor({ scope: "following" })} active={scope === "following"}>{t("팔로잉")}</Pill>
          )}
        </div>

        <div className="flex items-center gap-2">
          <SortDropdown
            current={sort}
            title={t("정렬 기준")}
            options={SORTS.map((s) => ({ value: s, label: sortLabel[s], href: hrefFor({ sort: s }) }))}
          />

          <div className="flex gap-1">
            <Pill href={hrefFor({ view: "card" })} active={view === "card"}>{t("카드형")}</Pill>
            <Pill href={hrefFor({ view: "compact" })} active={view === "compact"}>{t("축약형")}</Pill>
          </div>
        </div>
      </div>

      {items.length === 0 ? (
        <p className="rounded-xl border border-dashed border-zinc-300 px-6 py-16 text-center text-sm text-zinc-500 dark:border-zinc-700">
          {t("피드가 비어 있습니다.")}
        </p>
      ) : (
        <FeedList items={items} view={view} locale={locale} trackLabel={t("곡")} albumLabel={t("앨범")} />
      )}
    </div>
  );
}

function Pill({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className={`rounded-full px-3 py-1.5 text-sm font-medium transition ${
        active
          ? "bg-indigo-600 text-white"
          : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
      }`}
    >
      {children}
    </Link>
  );
}
