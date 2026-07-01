import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getProfile, getHome, type HomeReview } from "@/lib/api";
import { getT, getLocale } from "@/lib/i18n-server";
import { Stars } from "@/components/detail/stars";
import { formatRelativeTime } from "@/lib/format";
import type { Locale } from "@/lib/i18n";

export default async function Home() {
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

  const [home, t, locale] = await Promise.all([getHome(), getT(), getLocale()]);

  const usingFollow = loggedIn && (home?.followFeed.length ?? 0) > 0;
  const feed = usingFollow ? home!.followFeed : (home?.recentReviews ?? []);
  const trending = home?.trending ?? [];

  return (
    <div className="mx-auto w-full max-w-4xl px-6 py-8">
      {/* 비로그인: 슬림 히어로 */}
      {!user && (
        <section className="flex flex-col items-center gap-4 py-10 text-center">
          <span className="glitter-text text-4xl font-bold tracking-tight sm:text-5xl">Glitter</span>
          <p className="max-w-md text-zinc-600 dark:text-zinc-400">
            {t("음악을 듣고, 평가하고, 기록하세요.")}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link href="/signup" className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-indigo-500">
              {t("시작하기")}
            </Link>
            <Link href="/search" className="rounded-lg border border-zinc-300 px-5 py-2.5 text-sm font-medium text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-900">
              {t("둘러보기")}
            </Link>
          </div>
        </section>
      )}

      {/* 화제의 릴리스 */}
      {trending.length > 0 && (
        <section className={!user ? "mt-6" : ""}>
          <h2 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-50">{t("화제의 릴리스")}</h2>
          <div className="grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3 md:grid-cols-5">
            {trending.map((x) => (
              <Link key={`${x.targetType}-${x.spotifyId}`} href={`/${x.targetType}/${x.spotifyId}`} className="flex flex-col gap-1.5">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={x.imageUrl ?? "/placeholder.svg"} alt="" className="aspect-square w-full rounded-lg bg-zinc-100 object-cover dark:bg-zinc-800" />
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-zinc-900 dark:text-zinc-50">{x.name ?? ""}</p>
                  <p className="truncate text-xs text-zinc-400">{x.artist ?? ""}</p>
                  <span className="mt-1 flex items-center gap-1">
                    <Stars value={x.average} size={11} />
                    <span className="text-xs text-zinc-400">({x.count})</span>
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* 피드 */}
      <section className="mt-10">
        <h2 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
          {usingFollow ? t("팔로우 피드") : t("커뮤니티 최근 리뷰")}
        </h2>
        {feed.length === 0 ? (
          <p className="rounded-xl border border-dashed border-zinc-300 px-6 py-10 text-center text-sm text-zinc-500 dark:border-zinc-700">
            {t("아직 리뷰가 없습니다. 첫 평가를 남겨보세요.")}
          </p>
        ) : (
          <ul className="flex flex-col divide-y divide-zinc-200 dark:divide-zinc-800">
            {feed.map((rv) => (
              <ReviewRow key={rv.id} rv={rv} locale={locale} trackLabel={t("곡")} albumLabel={t("앨범")} />
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function ReviewRow({ rv, locale, trackLabel, albumLabel }: { rv: HomeReview; locale: Locale; trackLabel: string; albumLabel: string }) {
  return (
    <li className="flex gap-3 py-4">
      <Link href={`/${rv.targetType}/${rv.targetSpotifyId}`} className="shrink-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={rv.imageUrl ?? "/placeholder.svg"} alt="" className="h-14 w-14 rounded-md bg-zinc-100 object-cover dark:bg-zinc-900" />
      </Link>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center overflow-hidden rounded-full bg-zinc-200 text-[10px] font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
            {rv.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={rv.avatarUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              rv.username.charAt(0).toUpperCase()
            )}
          </span>
          <Link href={`/u/${rv.username}`} className="text-sm font-medium text-zinc-800 hover:underline dark:text-zinc-100">
            {rv.username}
          </Link>
          <span
            className={`shrink-0 rounded px-1.5 py-0.5 text-[10px] font-medium ${
              rv.targetType === "track"
                ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300"
                : "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
            }`}
          >
            {rv.targetType === "track" ? trackLabel : albumLabel}
          </span>
          <span className="ml-auto flex items-center gap-1.5">
            <Stars value={rv.score} size={13} />
            <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-200">{rv.score.toFixed(1)}</span>
          </span>
        </div>
        <Link href={`/${rv.targetType}/${rv.targetSpotifyId}`} className="mt-0.5 block truncate text-xs text-zinc-500 hover:underline">
          {rv.name ?? ""}
          {rv.artist ? ` · ${rv.artist}` : ""}
        </Link>
        <p className="mt-1 line-clamp-3 whitespace-pre-wrap text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">{rv.body}</p>
        <span className="mt-1 block text-xs text-zinc-400">{formatRelativeTime(rv.createdAt, locale)}</span>
      </div>
    </li>
  );
}
