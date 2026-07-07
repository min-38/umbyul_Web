"use client";

import { useState } from "react";
import type { TrackResult } from "@/lib/api";
import { searchTracks } from "@/app/actions/sets";
import { coverThumb } from "@/lib/image";
import { ExplicitBadge } from "@/components/detail/explicit-badge";
import { useT } from "@/components/i18n-provider";

export const MAX_TRACKS = 15;
export const YT_RE = /^https?:\/\/([\w-]+\.)?(youtube\.com|youtu\.be)\/\S+$/i;

// 유튜브 로고(빨간 플레이 버튼). currentColor 로 색 상속.
export function YoutubeIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6A3 3 0 0 0 .5 6.2 31 31 0 0 0 0 12a31 31 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.6 9.4.6 9.4.6s7.5 0 9.4-.6a3 3 0 0 0 2.1-2.1A31 31 0 0 0 24 12a31 31 0 0 0-.5-5.8zM9.5 15.5v-7l6.5 3.5-6.5 3.5z" />
    </svg>
  );
}

// 스포티파이 로고. currentColor 로 색 상속(#1DB954).
export function SpotifyIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.5 17.3c-.2.35-.66.46-1 .26-2.8-1.7-6.3-2.1-10.44-1.16-.4.1-.8-.16-.9-.56-.1-.4.16-.8.56-.9 4.5-1.03 8.4-.6 11.53 1.3.35.2.46.66.25 1.06zm1.47-3.27c-.26.42-.82.56-1.24.3-3.2-1.97-8.08-2.54-11.86-1.4-.48.15-.98-.12-1.13-.6-.14-.47.12-.98.6-1.12 4.32-1.3 9.7-.67 13.37 1.58.42.26.56.82.3 1.24zm.13-3.4C15.5 8.2 8.6 7.98 4.7 9.17c-.57.17-1.17-.15-1.34-.72-.17-.57.15-1.17.72-1.34C8.4 5.8 16 6.05 20.28 8.6c.5.3.66.95.36 1.46-.3.5-.95.67-1.46.37z" />
    </svg>
  );
}

export type PickedTrack = {
  spotifyId: string;
  isrc: string | null;
  name: string;
  artist: string;
  artists: { id: string; name: string }[];
  albumId: string | null;
  albumName: string | null;
  imageUrl: string | null;
  youtubeUrl: string | null;
  explicit: boolean;
};

const inputCls =
  "w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100";

// 한 폼에서 곡 검색 → 선택 → (선택)유튜브 링크 → 담기. onAdd가 true면 폼 리셋.
export function TrackPicker({
  onAdd,
  disabledHint,
}: {
  onAdd: (t: PickedTrack) => Promise<boolean> | boolean;
  disabledHint?: string | null;
}) {
  const t = useT();
  const [q, setQ] = useState("");
  const [hits, setHits] = useState<TrackResult[]>([]);
  const [selected, setSelected] = useState<TrackResult | null>(null);
  const [yt, setYt] = useState("");
  const [ytErr, setYtErr] = useState(false);
  const [busy, setBusy] = useState(false);

  const search = async (query: string) => {
    setQ(query);
    if (query.trim().length < 2) {
      setHits([]);
      return;
    }
    const r = await searchTracks(query).catch(() => []);
    setHits(r.slice(0, 6));
  };

  const submit = async () => {
    if (busy || !selected) return;
    const val = yt.trim();
    if (val && !YT_RE.test(val)) {
      setYtErr(true);
      return;
    }
    setBusy(true);
    const ok = await onAdd({
      spotifyId: selected.id,
      isrc: selected.isrc,
      name: selected.name,
      artist: selected.artist,
      artists: selected.artists,
      albumId: selected.albumId,
      albumName: selected.albumName,
      imageUrl: selected.imageUrl,
      youtubeUrl: val || null,
      explicit: selected.explicit,
    });
    setBusy(false);
    if (ok) {
      setSelected(null);
      setYt("");
      setYtErr(false);
      setQ("");
      setHits([]);
    }
  };

  if (disabledHint) return <p className="text-center text-xs text-zinc-500">{disabledHint}</p>;

  return (
    <div className="flex flex-col gap-2">
      {selected ? (
        <div className="flex items-center gap-2 rounded-lg border border-zinc-300 px-3 py-2 dark:border-zinc-700">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={coverThumb(selected.imageUrl, "sm") ?? "/placeholder.svg"} alt="" className="h-8 w-8 rounded bg-zinc-100 object-cover dark:bg-zinc-800" />
          <span className="min-w-0 flex-1">
            <span className="flex items-center gap-1.5 text-sm font-medium text-zinc-900 dark:text-zinc-50">
              <span className="truncate">{selected.name}</span>
              {selected.explicit && <ExplicitBadge />}
            </span>
            <span className="block truncate text-xs text-zinc-500">{selected.artist}</span>
          </span>
          <button type="button" onClick={() => setSelected(null)} aria-label={t("취소")} className="shrink-0 text-zinc-500 hover:text-zinc-600">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
      ) : (
        <div className="relative">
          <input value={q} onChange={(e) => search(e.target.value)} placeholder={t("곡 검색해서 담기…")} className={inputCls} />
          {hits.length > 0 && (
            <ul className="absolute left-0 right-0 top-full z-20 mt-1 max-h-64 overflow-auto rounded-lg border border-zinc-200 bg-white py-1 shadow-lg dark:border-zinc-700 dark:bg-zinc-900">
              {hits.map((tr) => (
                <li key={tr.id}>
                  <button
                    type="button"
                    onClick={() => {
                      setSelected(tr);
                      setHits([]);
                      setQ("");
                    }}
                    className="flex w-full items-center gap-2 px-2 py-1.5 text-left hover:bg-zinc-100 dark:hover:bg-zinc-800"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={coverThumb(tr.imageUrl, "sm") ?? "/placeholder.svg"} alt="" className="h-8 w-8 rounded bg-zinc-100 object-cover dark:bg-zinc-800" />
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-1.5 text-sm text-zinc-800 dark:text-zinc-100">
                        <span className="truncate">{tr.name}</span>
                        {tr.explicit && <ExplicitBadge />}
                      </span>
                      <span className="block truncate text-xs text-zinc-500">{tr.artist}</span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      <input
        value={yt}
        onChange={(e) => {
          setYt(e.target.value);
          setYtErr(false);
        }}
        placeholder={t("유튜브 링크 (선택)")}
        className={inputCls}
      />
      {ytErr && <p className="text-xs text-red-500">{t("유효한 유튜브 링크가 아닙니다.")}</p>}
      <button
        type="button"
        onClick={submit}
        disabled={!selected || busy}
        className="self-end rounded-lg bg-zinc-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-50 dark:bg-zinc-100 dark:text-black dark:hover:bg-zinc-200"
      >
        {t("담기")}
      </button>
    </div>
  );
}
