"use client";

import { useState } from "react";
import Link from "next/link";
import type { ArtistAlbum, ArtistRatedTrack } from "@/lib/api";
import { useT } from "@/components/i18n-provider";
import { ScoreBadge } from "./score-badge";

type Tab = "tracks" | "albums" | "discography";

export function ArtistTabs({ ratedTracks, albums }: { ratedTracks: ArtistRatedTrack[]; albums: ArtistAlbum[] }) {
  const t = useT();

  const ratedAlbums = albums
    .filter((a) => a.rating)
    .sort((a, b) => b.rating!.average - a.rating!.average || b.rating!.count - a.rating!.count);

  // 비어있지 않은 첫 탭을 기본값으로.
  const initial: Tab = ratedTracks.length ? "tracks" : ratedAlbums.length ? "albums" : "discography";
  const [tab, setTab] = useState<Tab>(initial);

  const TABS: { key: Tab; label: string }[] = [
    { key: "tracks", label: t("평가 좋은 트랙") },
    { key: "albums", label: t("평가 좋은 앨범") },
    { key: "discography", label: t("디스코그래피") },
  ];

  const albumTypeLabel = (type: string) =>
    type === "single" ? t("싱글") : type === "compilation" ? t("컴필레이션") : t("앨범");

  return (
    <section className="mt-10">
      <div className="mb-4 flex gap-6 border-b border-zinc-200 dark:border-zinc-800">
        {TABS.map((tb) => (
          <button
            key={tb.key}
            type="button"
            onClick={() => setTab(tb.key)}
            className={`-mb-px border-b-2 pb-2.5 text-sm font-medium ${
              tab === tb.key
                ? "border-zinc-900 text-zinc-900 dark:border-zinc-100 dark:text-zinc-100"
                : "border-transparent text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300"
            }`}
          >
            {tb.label}
            {tb.key === "tracks" && ratedTracks.length > 0 && (
              <span className="ml-1 text-zinc-500">({ratedTracks.length})</span>
            )}
            {tb.key === "albums" && ratedAlbums.length > 0 && (
              <span className="ml-1 text-zinc-500">({ratedAlbums.length})</span>
            )}
            {tb.key === "discography" && albums.length > 0 && (
              <span className="ml-1 text-zinc-500">({albums.length})</span>
            )}
          </button>
        ))}
      </div>

      {/* 길어지면 자체 스크롤 */}
      <div className="max-h-[32rem] overflow-y-auto pr-1">
        {tab === "tracks" &&
          (ratedTracks.length === 0 ? (
            <Empty text={t("아직 평가된 곡이 없습니다.")} />
          ) : (
            <ul className="flex flex-col divide-y divide-zinc-100 dark:divide-zinc-900">
              {ratedTracks.map((tr) => (
                <li key={tr.spotifyId}>
                  <Link href={`/track/${tr.spotifyId}`} className="flex items-center gap-3 py-2.5 hover:bg-zinc-50 dark:hover:bg-zinc-900/50">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={tr.imageUrl ?? "/placeholder.svg"} alt="" className="h-11 w-11 shrink-0 rounded-md bg-zinc-100 object-cover dark:bg-zinc-900" />
                    <span className="min-w-0 flex-1 truncate text-sm font-medium text-zinc-900 dark:text-zinc-50">{tr.name}</span>
                    <ScoreBadge rating={tr.rating} />
                  </Link>
                </li>
              ))}
            </ul>
          ))}

        {tab === "albums" &&
          (ratedAlbums.length === 0 ? (
            <Empty text={t("아직 평가된 앨범이 없습니다.")} />
          ) : (
            <Grid>
              {ratedAlbums.map((a) => (
                <AlbumCard key={a.spotifyId} album={a} typeLabel={albumTypeLabel(a.albumType)} />
              ))}
            </Grid>
          ))}

        {tab === "discography" && (
          <Grid>
            {albums.map((a) => (
              <AlbumCard key={a.spotifyId} album={a} typeLabel={albumTypeLabel(a.albumType)} />
            ))}
          </Grid>
        )}
      </div>
    </section>
  );
}

function Grid({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">{children}</div>;
}

function Empty({ text }: { text: string }) {
  return <p className="py-10 text-center text-sm text-zinc-500">{text}</p>;
}

function AlbumCard({ album, typeLabel }: { album: ArtistAlbum; typeLabel: string }) {
  return (
    <Link href={`/album/${album.spotifyId}`} className="flex flex-col gap-1.5">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={album.imageUrl ?? "/placeholder.svg"} alt="" className="aspect-square w-full rounded-lg bg-zinc-100 object-cover dark:bg-zinc-800" />
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-zinc-900 dark:text-zinc-50">{album.name}</p>
        <p className="truncate text-xs text-zinc-500">
          {album.releaseDate?.slice(0, 4)} · {typeLabel}
        </p>
        {album.rating && (
          <span className="mt-1 flex">
            <ScoreBadge rating={album.rating} />
          </span>
        )}
      </div>
    </Link>
  );
}
