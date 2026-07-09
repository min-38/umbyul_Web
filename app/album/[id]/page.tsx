import { cache } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAlbumDetail, getMySanction, getRatingHistory, getGenresFor, getGenres } from "@/lib/api";
import { getMentionMute } from "@/app/actions/mention";
import { getT } from "@/lib/i18n-server";

// generateMetadata 와 페이지가 같은 요청에서 한 번만 fetch 하도록 dedupe.
const getAlbum = cache(getAlbumDetail);

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const [album, t] = await Promise.all([getAlbum(id), getT()]);
  if (!album) return {};
  const artists = album.artists.map((a) => a.name).join(", ");
  const title = `${album.name} · ${artists} | Glitter`;
  return {
    title,
    description: `${album.name} — ${artists}. ${t("Glitter에서 평가하고 리뷰하세요.")}`,
    openGraph: { title, images: album.imageUrl ? [album.imageUrl] : [] },
  };
}
import { createClient } from "@/lib/supabase/server";
import { Stars } from "@/components/detail/stars";
import { RateButton } from "@/components/detail/rate-button";
import { SpotifyLink } from "@/components/detail/detail-bits";
import { MusicBrainzLink } from "@/components/detail/musicbrainz-link";
import { YouTubeLink } from "@/components/detail/youtube-link";
import { ShareButton } from "@/components/detail/share-button";
import { ArtistLinks } from "@/components/detail/artist-links";
import { AlbumTabs } from "@/components/detail/album-tabs";
import { ReviewList } from "@/components/detail/review-list";
import { MentionMuteToggle } from "@/components/detail/mention-mute-toggle";

export default async function AlbumPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const album = await getAlbum(id);
  if (!album) notFound();

  const ratingHistory = await getRatingHistory("album", album.targetId);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const mine = user ? album.reviews.find((r) => r.userId === user.id) : undefined;
  const sanction = user ? await getMySanction() : null;
  const rateSanction = sanction?.banned ? "banned" : sanction?.suspendedUntil ? "suspended" : null;
  // 장르·멘션뮤트를 서버에서 미리 받아 시드 — 마운트 후 fetch로 인한 깜빡임/버튼 튐 방지(NON-161).
  const [genresFor, allGenres] = await Promise.all([getGenresFor("album", album.spotifyId), getGenres()]);
  const mentionMuted = user ? await getMentionMute("album", album.spotifyId) : null;
  const t = await getT();

  return (
    <div className="mx-auto w-full max-w-4xl px-6 py-8">
      <div className="flex flex-col gap-6 sm:flex-row">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={album.imageUrl ?? "/placeholder.svg"}
          alt=""
          className="h-44 w-44 shrink-0 rounded-xl bg-zinc-100 object-cover dark:bg-zinc-900"
        />
        <div className="flex flex-1 flex-col gap-3">
          <span className="self-start rounded px-2 py-0.5 text-xs font-medium bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">{t("앨범")}</span>
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">{album.name}</h1>
          <p className="text-zinc-600 dark:text-zinc-300">
            <ArtistLinks artists={album.artists} />
          </p>
          <div className="mt-1 flex items-center gap-3">
            <span className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">
              {album.rating.average?.toFixed(1) ?? "–"}
            </span>
            <span className="flex flex-col">
              <Stars value={album.rating.average ?? 0} size={18} />
              <span className="text-xs text-zinc-500">{t("{count}개 평가", { count: album.rating.count })}</span>
            </span>
            <span className="ml-auto">
              <RateButton
                loggedIn={!!user}
                targetType="album"
                targetId={album.targetId}
                spotifyId={album.spotifyId}
                name={album.name}
                artist={album.artists.map((a) => a.name).join(", ")}
                artists={album.artists}
                imageUrl={album.imageUrl}
                myScore={mine?.score ?? 0}
                myReview={mine?.body ?? ""}
                path={`/album/${album.spotifyId}`}
                sanction={rateSanction}
              />
            </span>
          </div>
          <div className="mt-1 flex items-center gap-4">
            <SpotifyLink url={album.spotifyUrl} label={t("Spotify에서 듣기")} />
            <YouTubeLink url={album.youtubeUrl} label={t("YouTube에서 보기")} />
            <MusicBrainzLink upc={album.upc} label={t("MusicBrainz에서 보기")} />
            <ShareButton path={`/album/${album.spotifyId}`} title={album.name} size={24} />
          </div>
        </div>
      </div>

      <AlbumTabs album={album} loggedIn={!!user} points={ratingHistory} genresData={genresFor} allGenres={allGenres} />

      <section className="mt-10">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
            {t("리뷰")} <span className="text-zinc-500">({album.rating.count})</span>
          </h2>
          <MentionMuteToggle targetType="album" spotifyId={album.spotifyId} loggedIn={!!user} initialMuted={mentionMuted} />
        </div>
        <ReviewList reviews={album.reviews} currentUserId={user?.id ?? null} shareBasePath={`/album/${album.spotifyId}`} />
      </section>
    </div>
  );
}
