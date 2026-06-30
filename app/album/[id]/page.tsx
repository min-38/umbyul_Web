import { notFound } from "next/navigation";
import { getAlbumDetail } from "@/lib/api";
import { createClient } from "@/lib/supabase/server";
import { Stars } from "@/components/detail/stars";
import { RateButton } from "@/components/detail/rate-button";
import { SpotifyLink } from "@/components/detail/detail-bits";
import { AlbumTabs } from "@/components/detail/album-tabs";
import { ReviewList } from "@/components/detail/review-list";

export default async function AlbumPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const album = await getAlbumDetail(id);
  if (!album) notFound();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const artistNames = album.artists.map((a) => a.name).join(", ");

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
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-400">앨범</p>
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">{album.name}</h1>
          <p className="text-zinc-600 dark:text-zinc-300">{artistNames}</p>
          <div className="mt-1 flex items-center gap-3">
            <span className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">
              {album.rating.average?.toFixed(1) ?? "–"}
            </span>
            <span className="flex flex-col">
              <Stars value={album.rating.average ?? 0} size={18} />
              <span className="text-xs text-zinc-400">{album.rating.count}개 평가</span>
            </span>
            <span className="ml-auto">
              <RateButton loggedIn={!!user} />
            </span>
          </div>
          <SpotifyLink url={album.spotifyUrl} />
        </div>
      </div>

      <AlbumTabs album={album} />

      <section className="mt-10">
        <h2 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
          리뷰 <span className="text-zinc-400">({album.rating.count})</span>
        </h2>
        <ReviewList reviews={album.reviews} />
      </section>
    </div>
  );
}
