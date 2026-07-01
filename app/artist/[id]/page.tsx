import Link from "next/link";
import { notFound } from "next/navigation";
import { getArtistDetail, type RatingBadge } from "@/lib/api";
import { getT } from "@/lib/i18n-server";
import { Stars } from "@/components/detail/stars";
import { SpotifyLink } from "@/components/detail/detail-bits";
import { ShareButton } from "@/components/detail/share-button";

export default async function ArtistPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [artist, t] = await Promise.all([getArtistDetail(id), getT()]);
  if (!artist) notFound();

  const albumTypeLabel = (type: string) =>
    type === "single" ? t("싱글") : type === "compilation" ? t("컴필레이션") : t("앨범");

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
          <p className="text-sm text-zinc-500">
            {t("Spotify 팔로워 {count}", { count: artist.followers.toLocaleString() })}
          </p>
          <div className="mt-1 flex items-center justify-center gap-4 sm:justify-start">
            <SpotifyLink url={artist.spotifyUrl} label={t("Spotify에서 열기")} />
            <ShareButton path={`/artist/${artist.spotifyId}`} title={artist.name} size={24} />
          </div>
        </div>
      </div>

      {/* 인기 곡 */}
      {artist.topTracks.length > 0 && (
        <section className="mt-10">
          <h2 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-50">{t("인기 곡")}</h2>
          <ul className="flex flex-col divide-y divide-zinc-100 dark:divide-zinc-900">
            {artist.topTracks.map((tr) => (
              <li key={tr.spotifyId}>
                <Link
                  href={`/track/${tr.spotifyId}`}
                  className="flex items-center gap-3 py-2.5 hover:bg-zinc-50 dark:hover:bg-zinc-900/50"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={tr.imageUrl ?? "/placeholder.svg"}
                    alt=""
                    className="h-11 w-11 shrink-0 rounded-md bg-zinc-100 object-cover dark:bg-zinc-900"
                  />
                  <span className="min-w-0 flex-1 truncate text-sm font-medium text-zinc-900 dark:text-zinc-50">
                    {tr.name}
                  </span>
                  <Badge rating={tr.rating} />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* 디스코그래피 */}
      {artist.albums.length > 0 && (
        <section className="mt-10">
          <h2 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-50">{t("디스코그래피")}</h2>
          <div className="grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {artist.albums.map((a) => (
              <Link key={a.spotifyId} href={`/album/${a.spotifyId}`} className="flex flex-col gap-1.5">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={a.imageUrl ?? "/placeholder.svg"}
                  alt=""
                  className="aspect-square w-full rounded-lg bg-zinc-100 object-cover dark:bg-zinc-800"
                />
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-zinc-900 dark:text-zinc-50">{a.name}</p>
                  <p className="truncate text-xs text-zinc-400">
                    {a.releaseDate?.slice(0, 4)} · {albumTypeLabel(a.albumType)}
                  </p>
                  {a.rating && (
                    <span className="mt-1 flex">
                      <Badge rating={a.rating} />
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

// 평가가 있을 때만 별점 배지. 없으면 아무것도 렌더하지 않음(아티스트 종합점수는 만들지 않음).
function Badge({ rating }: { rating: RatingBadge | null }) {
  if (!rating) return null;
  return (
    <span className="flex shrink-0 items-center gap-1">
      <Stars value={rating.average} size={12} />
      <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-200">{rating.average.toFixed(1)}</span>
      <span className="text-xs text-zinc-400">({rating.count})</span>
    </span>
  );
}
