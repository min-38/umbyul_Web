import Link from "next/link";
import { notFound } from "next/navigation";
import { getArtistDetail } from "@/lib/api";
import { getT, getLocale } from "@/lib/i18n-server";
import { formatRelativeTime } from "@/lib/format";
import { Stars } from "@/components/detail/stars";
import { ScoreBadge } from "@/components/detail/score-badge";
import { SpotifyLink } from "@/components/detail/detail-bits";
import { ShareButton } from "@/components/detail/share-button";
import { ArtistDiscography } from "@/components/detail/artist-discography";

// "커뮤니티가 사랑한"에 노출할 최소 평가 수(표본 1개 왜곡 방지). 평점 무결성 후속에서 조정 가능.
const MIN_TOP = 3;

export default async function ArtistPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [artist, t, locale] = await Promise.all([getArtistDetail(id), getT(), getLocale()]);
  if (!artist) notFound();

  // "커뮤니티가 사랑한": 앨범 카드(트랙 카드는 없음)라 앨범 기준. 스탯은 서버가 트랙 포함해 집계.
  const loved = artist.albums
    .filter((a) => a.rating && a.rating.count >= MIN_TOP)
    .sort((a, b) => b.rating!.average - a.rating!.average)
    .slice(0, 6);

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

      {/* 커뮤니티가 사랑한 (평가 N개 이상만) */}
      {loved.length > 0 && (
        <section className="mt-10">
          <h2 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-50">{t("커뮤니티가 사랑한")}</h2>
          <div className="grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3 md:grid-cols-6">
            {loved.map((x) => (
              <Link key={x.spotifyId} href={`/album/${x.spotifyId}`} className="flex flex-col gap-1.5">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={x.imageUrl ?? "/placeholder.svg"}
                  alt=""
                  className="aspect-square w-full rounded-lg bg-zinc-100 object-cover dark:bg-zinc-800"
                />
                <p className="truncate text-sm font-medium text-zinc-900 dark:text-zinc-50">{x.name}</p>
                <ScoreBadge rating={x.rating} />
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* 디스코그래피 (정렬 토글) */}
      {artist.albums.length > 0 && <ArtistDiscography albums={artist.albums} />}

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
