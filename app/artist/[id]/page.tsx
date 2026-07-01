import Link from "next/link";
import { notFound } from "next/navigation";
import { getArtistDetail } from "@/lib/api";
import { getT, getLocale } from "@/lib/i18n-server";
import { formatRelativeTime } from "@/lib/format";
import { Stars } from "@/components/detail/stars";
import { SpotifyLink } from "@/components/detail/detail-bits";
import { ShareButton } from "@/components/detail/share-button";
import { ArtistTabs } from "@/components/detail/artist-tabs";

export default async function ArtistPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [artist, t, locale] = await Promise.all([getArtistDetail(id), getT(), getLocale()]);
  if (!artist) notFound();

  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-8">
      {/* 헤더 */}
      <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:items-end sm:text-left">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={artist.imageUrl ?? "/placeholder.svg"}
          alt=""
          className="h-40 w-40 shrink-0 rounded-full bg-zinc-100 object-cover dark:bg-zinc-900"
        />
        <div className="flex flex-col gap-2">
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-400">{t("아티스트")}</p>
          <h1 className="text-3xl font-bold text-zinc-900 sm:text-4xl dark:text-zinc-50">{artist.name}</h1>
          {artist.totalRatings > 0 && (
            <p className="text-sm text-zinc-500">
              {t("평가된 릴리스 {rated} · 총 평가 {total}", { rated: artist.ratedCount, total: artist.totalRatings })}
            </p>
          )}
          <div className="mt-1 flex items-center justify-center gap-4 sm:justify-start">
            <SpotifyLink url={artist.spotifyUrl} label={t("Spotify에서 열기")} />
            <ShareButton path={`/artist/${artist.spotifyId}`} title={artist.name} size={24} />
          </div>
        </div>
      </div>

      {/* 탭: 평가 좋은 트랙 / 평가 좋은 앨범 / 디스코그래피 (Spotify 실패 시 오류 안내) */}
      {artist.catalogError ? (
        <div className="mt-10 rounded-xl border border-dashed border-zinc-300 px-6 py-10 text-center text-sm text-zinc-500 dark:border-zinc-700">
          {t("음악 정보를 불러오지 못했습니다. 잠시 후 다시 시도해주세요.")}
        </div>
      ) : artist.ratedTracks.length > 0 || artist.albums.length > 0 ? (
        <ArtistTabs ratedTracks={artist.ratedTracks} albums={artist.albums} />
      ) : null}

      {/* 커뮤니티 최근 리뷰 */}
      {artist.recentReviews.length > 0 && (
        <section className="mt-10">
          <h2 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-50">{t("커뮤니티 최근 리뷰")}</h2>
          <ul className="flex flex-col divide-y divide-zinc-200 dark:divide-zinc-800">
            {artist.recentReviews.map((rv, i) => (
              <li key={i} className="flex flex-col gap-1.5 py-4">
                <div className="flex items-center gap-2">
                  <span className="flex h-7 w-7 items-center justify-center overflow-hidden rounded-full bg-zinc-200 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
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
                  <span className="text-xs text-zinc-400">·</span>
                  <span
                    className={`shrink-0 rounded px-1.5 py-0.5 text-[10px] font-medium ${
                      rv.targetType === "track"
                        ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300"
                        : "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                    }`}
                  >
                    {rv.targetType === "track" ? t("곡") : t("앨범")}
                  </span>
                  <Link
                    href={`/${rv.targetType}/${rv.targetSpotifyId}`}
                    className="truncate text-xs text-zinc-500 hover:underline"
                  >
                    {rv.targetName}
                  </Link>
                  <span className="ml-auto flex items-center gap-1.5">
                    <Stars value={rv.score} size={14} />
                    <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-200">{rv.score.toFixed(1)}</span>
                  </span>
                </div>
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">{rv.body}</p>
                <span className="text-xs text-zinc-400">{formatRelativeTime(rv.createdAt, locale)}</span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
