"use client";
import { onImageError } from "@/lib/image";

import { useState } from "react";
import Link from "next/link";
import type { ArtistAlbum, ArtistRatedTrack, RatingBadge } from "@/lib/api";
import { ScoreBadge } from "./score-badge";

type Tab = "toprated" | "discography";
type Filter = "all" | "track" | "album";

// 릴리스 포맷은 영어 고정(i18n 제외) — 장르 영어 규칙과 같은 도메인 클러스터.
const albumTypeLabel = (type: string) =>
  type === "single" ? "Single" : type === "compilation" ? "Compilation" : "Album";

// Top Rated: 트랙+앨범을 rating.average로 병합한 통합 랭킹 아이템(행 렌더). Discography는 그리드 유지.
type RatedItem = {
  kind: "track" | "album";
  spotifyId: string;
  name: string;
  imageUrl: string | null;
  rating: RatingBadge;
  typeLabel: string;
  href: string;
};

export function ArtistTabs({ ratedTracks, albums }: { ratedTracks: ArtistRatedTrack[]; albums: ArtistAlbum[] }) {
  const rated: RatedItem[] = [
    ...ratedTracks.map((tr) => ({
      kind: "track" as const, spotifyId: tr.spotifyId, name: tr.name, imageUrl: tr.imageUrl,
      rating: tr.rating, typeLabel: "Track", href: `/track/${tr.spotifyId}`,
    })),
    ...albums.filter((a) => a.rating).map((a) => ({
      kind: "album" as const, spotifyId: a.spotifyId, name: a.name, imageUrl: a.imageUrl,
      rating: a.rating!, typeLabel: albumTypeLabel(a.albumType), href: `/album/${a.spotifyId}`,
    })),
  ].sort((x, y) => y.rating.average - x.rating.average || y.rating.count - x.rating.count);

  const trackCount = rated.filter((r) => r.kind === "track").length;
  const albumCount = rated.filter((r) => r.kind === "album").length;
  const showFilter = trackCount > 0 && albumCount > 0; // 한 종류뿐이면 토글 불필요

  const [tab, setTab] = useState<Tab>(rated.length ? "toprated" : "discography");
  const [filter, setFilter] = useState<Filter>("all");

  const items = showFilter && filter !== "all" ? rated.filter((r) => r.kind === filter) : rated;

  const TABS: { key: Tab; label: string; count: number }[] = [
    ...(rated.length ? [{ key: "toprated" as const, label: "Top Rated", count: rated.length }] : []),
    { key: "discography", label: "Discography", count: albums.length },
  ];
  const FILTERS: { key: Filter; label: string; count: number }[] = [
    { key: "all", label: "All", count: rated.length },
    { key: "track", label: "Track", count: trackCount },
    { key: "album", label: "Album", count: albumCount },
  ];

  return (
    <section className="mt-10">
      <div role="tablist" className="mb-4 flex gap-6 border-b border-zinc-200 dark:border-zinc-800">
        {TABS.map((tb) => (
          <button
            key={tb.key}
            type="button"
            role="tab"
            aria-selected={tab === tb.key}
            onClick={() => setTab(tb.key)}
            className={`-mb-px border-b-2 pb-2.5 text-sm font-medium ${
              tab === tb.key
                ? "border-zinc-900 text-zinc-900 dark:border-zinc-100 dark:text-zinc-100"
                : "border-transparent text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300"
            }`}
          >
            {tb.label}
            {tb.count > 0 && <span className="ml-1 text-zinc-500">({tb.count})</span>}
          </button>
        ))}
      </div>

      {tab === "toprated" && (
        <>
          {showFilter && (
            <div className="mb-3 flex gap-1">
              {FILTERS.map((f) => (
                <button
                  key={f.key}
                  type="button"
                  onClick={() => setFilter(f.key)}
                  className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                    filter === f.key
                      ? "bg-indigo-600 text-white"
                      : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
                  }`}
                >
                  {f.label} <span className={filter === f.key ? "text-indigo-200" : "text-zinc-400"}>{f.count}</span>
                </button>
              ))}
            </div>
          )}
          <div className="max-h-[32rem] overflow-y-auto pr-1">
            <ul className="flex flex-col divide-y divide-zinc-100 dark:divide-zinc-900">
              {items.map((it) => (
                <li key={`${it.kind}-${it.spotifyId}`}>
                  <Link href={it.href} className="flex items-center gap-3 py-2.5 hover:bg-zinc-50 dark:hover:bg-zinc-900/50">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img onError={onImageError} src={it.imageUrl ?? "/placeholder.svg"} alt="" className="h-11 w-11 shrink-0 rounded-md bg-zinc-100 object-cover dark:bg-zinc-900" />
                    <span className="min-w-0 flex-1 truncate text-sm font-medium text-zinc-900 dark:text-zinc-50">{it.name}</span>
                    <span className="shrink-0 rounded bg-zinc-100 px-1.5 py-0.5 text-[10px] font-medium text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">{it.typeLabel}</span>
                    <ScoreBadge rating={it.rating} />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </>
      )}

      {tab === "discography" && (
        <div className="max-h-[32rem] overflow-y-auto pr-1">
          <Grid>
            {albums.map((a) => (
              <AlbumCard key={a.spotifyId} album={a} typeLabel={albumTypeLabel(a.albumType)} />
            ))}
          </Grid>
        </div>
      )}
    </section>
  );
}

function Grid({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">{children}</div>;
}

function AlbumCard({ album, typeLabel }: { album: ArtistAlbum; typeLabel: string }) {
  return (
    <Link href={`/album/${album.spotifyId}`} className="flex flex-col gap-1.5">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img onError={onImageError} src={album.imageUrl ?? "/placeholder.svg"} alt="" className="aspect-square w-full rounded-lg bg-zinc-100 object-cover dark:bg-zinc-800" />
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
