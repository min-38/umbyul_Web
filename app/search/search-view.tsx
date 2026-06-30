"use client";

import { useState } from "react";
import Link from "next/link";
import type {
  SearchResults,
  TrackResult,
  AlbumResult,
  ArtistResult,
  UserResult,
} from "@/lib/api";

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const PAGE = 10;

type Tab = "track" | "album" | "artist" | "user";
type AnyItem = TrackResult | AlbumResult | ArtistResult | UserResult;

const TABS: { key: Tab; label: string }[] = [
  { key: "track", label: "Track" },
  { key: "album", label: "Album" },
  { key: "artist", label: "Artist" },
  { key: "user", label: "User" },
];

type Cat = { items: AnyItem[]; total: number; page: number; loading: boolean; done: boolean };

function init(items: AnyItem[], total: number): Cat {
  // 첫 페이지가 PAGE 미만이거나 이미 total 도달이면 더 없음
  return { items, total, page: 1, loading: false, done: items.length < PAGE || items.length >= total };
}

function Centered({ children }: { children: React.ReactNode }) {
  return (
    <p className="py-20 text-center text-sm text-zinc-500 dark:text-zinc-400">{children}</p>
  );
}

function Grid({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
      {children}
    </div>
  );
}

function Thumb({ url, circle = false }: { url: string | null; circle?: boolean }) {
  const shape = circle ? "rounded-full" : "rounded-lg";
  return url ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={url}
      alt=""
      className={`aspect-square w-full bg-zinc-100 object-cover ${shape} dark:bg-zinc-800`}
    />
  ) : (
    <div className={`aspect-square w-full bg-zinc-100 ${shape} dark:bg-zinc-800`} />
  );
}

function TrackCard({ t }: { t: TrackResult }) {
  // 앨범명은 앨범 상세로 따로 링크. <a> 중첩이 안 되므로 트랙 링크 바깥의 형제로 둔다.
  return (
    <div className="flex flex-col gap-1.5">
      <Link href={`/track/${t.id}`} className="flex flex-col gap-1.5">
        <Thumb url={t.imageUrl} />
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-black dark:text-zinc-50">{t.name}</p>
          <p className="truncate text-xs text-zinc-500">{t.artist}</p>
        </div>
      </Link>
      {t.albumName &&
        (t.albumId ? (
          <Link href={`/album/${t.albumId}`} className="block truncate text-xs text-zinc-400 hover:text-zinc-600 hover:underline dark:hover:text-zinc-300">
            {t.albumName}
          </Link>
        ) : (
          <p className="truncate text-xs text-zinc-400">{t.albumName}</p>
        ))}
    </div>
  );
}

function AlbumCard({ a }: { a: AlbumResult }) {
  return (
    <Link href={`/album/${a.id}`} className="flex flex-col gap-1.5">
      <Thumb url={a.imageUrl} />
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-black dark:text-zinc-50">{a.name}</p>
        <p className="truncate text-xs text-zinc-500">{a.artist}</p>
        {a.releaseDate && <p className="truncate text-xs text-zinc-400">{a.releaseDate}</p>}
      </div>
    </Link>
  );
}

function ArtistCard({ a }: { a: ArtistResult }) {
  return (
    <div className="flex flex-col items-center gap-1.5 text-center">
      <Thumb url={a.imageUrl} circle />
      <p className="w-full truncate text-sm font-medium text-black dark:text-zinc-50">{a.name}</p>
    </div>
  );
}

function UserCard({ u }: { u: UserResult }) {
  return (
    <div className="flex flex-col items-center gap-1.5 text-center">
      <Thumb url={u.avatarUrl} circle />
      <p className="w-full truncate text-sm font-medium text-black dark:text-zinc-50">{u.username}</p>
    </div>
  );
}

function renderCards(tab: Tab, items: AnyItem[]) {
  switch (tab) {
    case "track":
      return (items as TrackResult[]).map((t) => <TrackCard key={t.id} t={t} />);
    case "album":
      return (items as AlbumResult[]).map((a) => <AlbumCard key={a.id} a={a} />);
    case "artist":
      return (items as ArtistResult[]).map((a) => <ArtistCard key={a.id} a={a} />);
    case "user":
      return (items as UserResult[]).map((u) => <UserCard key={u.id} u={u} />);
  }
}

export function SearchView({
  q,
  results,
  error,
}: {
  q: string;
  results: SearchResults | null;
  error: boolean;
}) {
  const [tab, setTab] = useState<Tab>("track");
  const [state, setState] = useState<Record<Tab, Cat>>(() => ({
    track: init(results?.tracks.items ?? [], results?.tracks.total ?? 0),
    album: init(results?.albums.items ?? [], results?.albums.total ?? 0),
    artist: init(results?.artists.items ?? [], results?.artists.total ?? 0),
    user: init(results?.users.items ?? [], results?.users.total ?? 0),
  }));

  if (!q) return <Centered>검색어를 입력하세요.</Centered>;
  if (error) return <Centered>검색 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.</Centered>;
  if (!results) return null;

  const total = TABS.reduce((n, t) => n + state[t.key].items.length, 0);

  const loadMore = async (t: Tab) => {
    const cur = state[t];
    if (cur.loading || cur.done) return;
    setState((s) => ({ ...s, [t]: { ...s[t], loading: true } }));
    try {
      const offset = cur.page * PAGE;
      const res = await fetch(
        `${API_URL}/search/more?q=${encodeURIComponent(q)}&type=${t}&offset=${offset}`,
      );
      const { data } = await res.json();
      const raw = (data.items ?? []) as AnyItem[];
      // offset 페이징이 중복을 줄 수 있어 id로 중복 제거, total 도달/빈 페이지면 종료
      const existing = new Set(cur.items.map((it) => it.id));
      const unique = raw.filter((it) => !existing.has(it.id));
      // 마지막 페이지가 total 을 넘치지 않게 잘라낸다(표시 개수와 일치)
      const merged = [...cur.items, ...unique].slice(0, cur.total);
      const done = raw.length < PAGE || merged.length >= cur.total;
      setState((s) => ({
        ...s,
        [t]: { ...s[t], items: merged, page: s[t].page + 1, done, loading: false },
      }));
    } catch {
      setState((s) => ({ ...s, [t]: { ...s[t], loading: false } }));
    }
  };

  const active = state[tab];

  return (
    <div className="mx-auto w-full max-w-5xl flex-1 px-4 py-6">
      <div className="mb-6 flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={`rounded-full border px-3 py-1.5 text-sm ${
              tab === t.key
                ? "border-indigo-600 bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300"
                : "border-zinc-300 text-zinc-600 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-900"
            }`}
          >
            {t.label} ({state[t.key].total})
          </button>
        ))}
      </div>

      {total === 0 ? (
        <Centered>{`"${q}"에 대한 검색 결과가 없습니다.`}</Centered>
      ) : active.items.length === 0 ? (
        <Centered>이 카테고리엔 결과가 없습니다.</Centered>
      ) : (
        <>
          <Grid>{renderCards(tab, active.items)}</Grid>
          {!active.done && (
            <div className="mt-8 flex justify-center">
              <button
                type="button"
                disabled={active.loading}
                onClick={() => loadMore(tab)}
                className="rounded-full border border-zinc-300 px-5 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-900"
              >
                {active.loading ? "불러오는 중…" : "더 보기"}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
