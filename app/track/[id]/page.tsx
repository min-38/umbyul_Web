import { cache } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getTrackDetail, getMySanction, getRatingHistory, getGenresFor, getGenres } from "@/lib/api";
import { getMentionMute } from "@/app/actions/mention";
import { getT } from "@/lib/i18n-server";

const getTrack = cache(getTrackDetail);

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const [track, t] = await Promise.all([getTrack(id), getT()]);
  if (!track) return {};
  const artists = track.artists.map((a) => a.name).join(", ");
  const title = `${track.name} · ${artists} | UmByul`;
  const image = track.album?.imageUrl ?? null;
  return {
    title,
    description: `${track.name} — ${artists}. ${t("음별에서 평가하고 리뷰하세요.")}`,
    openGraph: { title, images: image ? [image] : [] },
  };
}
import { createClient } from "@/lib/supabase/server";
import { Stars } from "@/components/detail/stars";
import { ReviewList } from "@/components/detail/review-list";
import { RateButton } from "@/components/detail/rate-button";
import { SpotifyLink } from "@/components/detail/detail-bits";
import { MusicBrainzLink } from "@/components/detail/musicbrainz-link";
import { YouTubeLink } from "@/components/detail/youtube-link";
import { GenreTags } from "@/components/detail/genre-tags";
import { DetailInfoTabs } from "@/components/detail/detail-info-tabs";
import { ExplicitBadge } from "@/components/detail/explicit-badge";
import { ShareButton } from "@/components/detail/share-button";
import { MentionMuteToggle } from "@/components/detail/mention-mute-toggle";
import { ArtistLinks } from "@/components/detail/artist-links";
import { formatDuration, formatReleaseDate } from "@/lib/format";

export default async function TrackPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const track = await getTrack(id);
  if (!track) notFound();

  const ratingHistory = await getRatingHistory("track", track.targetId);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const mine = user ? track.reviews.find((r) => r.userId === user.id) : undefined;
  const sanction = user ? await getMySanction() : null;
  const rateSanction = sanction?.banned ? "banned" : sanction?.suspendedUntil ? "suspended" : null;
  // 장르·멘션뮤트를 서버에서 미리 받아 시드 — 마운트 후 fetch로 인한 깜빡임/버튼 튐 방지(NON-161).
  const [genresFor, allGenres] = await Promise.all([getGenresFor("track", track.spotifyId), getGenres()]);
  const mentionMuted = user ? await getMentionMute("track", track.spotifyId) : null;
  const t = await getT();

  return (
    <div className="mx-auto w-full max-w-4xl px-6 py-8">
      <div className="flex flex-col gap-6 sm:flex-row">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={track.album?.imageUrl ?? "/placeholder.svg"}
          alt=""
          className="h-44 w-44 shrink-0 rounded-xl bg-zinc-100 object-cover dark:bg-zinc-900"
        />
        <div className="flex flex-1 flex-col gap-3">
          <span className="self-start rounded px-2 py-0.5 text-xs font-medium bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">{t("곡")}</span>
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">
            {track.name}
            {track.explicit && <> <ExplicitBadge size="lg" /></>}
          </h1>
          <p className="text-zinc-600 dark:text-zinc-300">
            <ArtistLinks artists={track.artists} />
            {track.album && (
              <>
                {" · "}
                <Link href={`/album/${track.album.id}`} className="hover:underline">
                  {track.album.name}
                </Link>
              </>
            )}
          </p>
          <div className="mt-1 flex items-center gap-3">
            <span className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">
              {track.rating.average?.toFixed(1) ?? "–"}
            </span>
            <span className="flex flex-col">
              <Stars value={track.rating.average ?? 0} size={18} />
              <span className="text-xs text-zinc-500">{t("{count}개 평가", { count: track.rating.count })}</span>
            </span>
            <span className="ml-auto">
              <RateButton
                loggedIn={!!user}
                targetType="track"
                targetId={track.targetId}
                spotifyId={track.spotifyId}
                name={track.name}
                artist={track.artists.map((a) => a.name).join(", ")}
                artists={track.artists}
                imageUrl={track.album?.imageUrl ?? null}
                explicit={track.explicit}
                myScore={mine?.score ?? 0}
                myReview={mine?.body ?? ""}
                path={`/track/${track.spotifyId}`}
                sanction={rateSanction}
              />
            </span>
          </div>
          <div className="mt-1 flex items-center gap-4">
            <SpotifyLink url={track.spotifyUrl} label={t("Spotify에서 듣기")} />
            <YouTubeLink url={track.youtubeUrl} label={t("YouTube에서 보기")} />
            <MusicBrainzLink isrc={track.isrc} label={t("MusicBrainz에서 보기")} />
            <ShareButton path={`/track/${track.spotifyId}`} title={track.name} size={24} />
          </div>
        </div>
      </div>

      <DetailInfoTabs
        points={ratingHistory}
        chartLabel={t("평점 추이")}
        info={
          <dl className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <dt className="text-xs text-zinc-500">{t("발매일")}</dt>
                <dd className="text-sm text-zinc-800 dark:text-zinc-200">{formatReleaseDate(track.releaseDate)}</dd>
              </div>
              <div className="flex flex-col gap-1">
                <dt className="text-xs text-zinc-500">{t("길이")}</dt>
                <dd className="text-sm text-zinc-800 dark:text-zinc-200">{formatDuration(track.durationMs)}</dd>
              </div>
            </div>
            {track.copyright && (
              <div className="flex flex-col gap-1">
                <dt className="text-xs text-zinc-500">{t("저작권")}</dt>
                <dd className="text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">{track.copyright}</dd>
              </div>
            )}
            <div className="flex flex-col gap-1">
              <dt className="text-xs text-zinc-500">{t("장르")}</dt>
              <dd><GenreTags targetType="track" id={track.spotifyId} loggedIn={!!user} initialData={genresFor} initialGenres={allGenres} /></dd>
            </div>
          </dl>
        }
      />

      <section className="mt-10">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
            {t("리뷰")} <span className="text-zinc-500">({track.rating.count})</span>
          </h2>
          <MentionMuteToggle targetType="track" spotifyId={track.spotifyId} loggedIn={!!user} initialMuted={mentionMuted} />
        </div>
        <ReviewList reviews={track.reviews} currentUserId={user?.id ?? null} shareBasePath={`/track/${track.spotifyId}`} />
      </section>
    </div>
  );
}
