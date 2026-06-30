import { notFound } from "next/navigation";
import Link from "next/link";
import { getTrackDetail } from "@/lib/api";
import { createClient } from "@/lib/supabase/server";
import { Stars } from "@/components/detail/stars";
import { ReviewList } from "@/components/detail/review-list";
import { RateButton } from "@/components/detail/rate-button";
import { MetaRow, SpotifyLink, Copyright } from "@/components/detail/detail-bits";
import { formatDuration, formatReleaseDate } from "@/lib/format";

export default async function TrackPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const track = await getTrackDetail(id);
  if (!track) notFound();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const artistNames = track.artists.map((a) => a.name).join(", ");
  const mine = user ? track.reviews.find((r) => r.userId === user.id) : undefined;

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
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-400">곡</p>
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">{track.name}</h1>
          <p className="text-zinc-600 dark:text-zinc-300">
            {artistNames}
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
              <span className="text-xs text-zinc-400">{track.rating.count}개 평가</span>
            </span>
            <span className="ml-auto">
              <RateButton
                loggedIn={!!user}
                targetType="track"
                targetId={track.targetId}
                name={track.name}
                myScore={mine?.score ?? 0}
                myReview={mine?.body ?? ""}
                path={`/track/${track.spotifyId}`}
              />
            </span>
          </div>
        </div>
      </div>

      <MetaRow
        items={[
          { label: "발매일", value: formatReleaseDate(track.releaseDate) },
          { label: "길이", value: formatDuration(track.durationMs) },
        ]}
      />
      <Copyright text={track.copyright} />

      <SpotifyLink url={track.spotifyUrl} />

      <section className="mt-10">
        <h2 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
          리뷰 <span className="text-zinc-400">({track.rating.count})</span>
        </h2>
        <ReviewList reviews={track.reviews} currentUserId={user?.id ?? null} />
      </section>
    </div>
  );
}
