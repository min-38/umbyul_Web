"use client";

import { useState } from "react";
import type { TrackResult, DjSetTrack } from "@/lib/api";
import { searchTracks } from "@/app/actions/sets";
import { type PickedTrack } from "@/components/sets/track-picker";
import { coverThumb, onImageError } from "@/lib/image";
import { ExplicitBadge } from "@/components/detail/explicit-badge";
import { Dialog } from "@/components/ui/dialog";
import { useT } from "@/components/i18n-provider";

// 트랙 수정 모달: 노래 변경(재검색). YouTube는 곡 전역 링크에서 표시 — 여기서 편집 안 함.
export function EditTrackModal({
  track,
  onSave,
  onClose,
}: {
  track: DjSetTrack;
  onSave: (t: PickedTrack) => Promise<boolean>;
  onClose: () => void;
}) {
  const t = useT();
  const [picked, setPicked] = useState<PickedTrack>({
    spotifyId: track.spotifyId,
    isrc: track.isrc,
    name: track.name,
    artist: track.artist,
    artists: track.artists,
    albumId: track.albumId,
    albumName: track.albumName,
    imageUrl: track.imageUrl,
    explicit: track.explicit,
  });
  const [changing, setChanging] = useState(false);
  const [q, setQ] = useState("");
  const [hits, setHits] = useState<TrackResult[]>([]);
  const [busy, setBusy] = useState(false);

  const inputCls =
    "w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100";

  const search = async (query: string) => {
    setQ(query);
    if (query.trim().length < 2) {
      setHits([]);
      return;
    }
    const r = await searchTracks(query).catch(() => []);
    setHits(r.slice(0, 6));
  };

  const pick = (tr: TrackResult) => {
    setPicked(() => ({
      spotifyId: tr.id,
      isrc: tr.isrc,
      name: tr.name,
      artist: tr.artist,
      artists: tr.artists,
      albumId: tr.albumId,
      albumName: tr.albumName,
      imageUrl: tr.imageUrl,
      explicit: tr.explicit,
    }));
    setChanging(false);
    setHits([]);
    setQ("");
  };

  const save = async () => {
    if (busy) return;
    setBusy(true);
    const ok = await onSave(picked);
    setBusy(false);
    if (ok) onClose();
  };

  return (
    <Dialog open onClose={onClose} labelledBy="edit-track-title" panelClassName="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl outline-none dark:bg-zinc-950">
      <h2 id="edit-track-title" className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">{t("곡 수정")}</h2>

        <div className="mt-4">
          {changing ? (
            <div className="relative">
              <input value={q} onChange={(e) => search(e.target.value)} placeholder={t("곡 검색해서 담기…")} autoFocus className={inputCls} />
              {hits.length > 0 && (
                <ul className="absolute left-0 right-0 top-full z-20 mt-1 max-h-64 overflow-auto rounded-lg border border-zinc-200 bg-white py-1 shadow-lg dark:border-zinc-700 dark:bg-zinc-900">
                  {hits.map((tr) => (
                    <li key={tr.id}>
                      <button type="button" onClick={() => pick(tr)} className="flex w-full items-center gap-2 px-2 py-1.5 text-left hover:bg-zinc-100 dark:hover:bg-zinc-800">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img onError={onImageError} src={coverThumb(tr.imageUrl, "sm") ?? "/placeholder.svg"} alt="" className="h-8 w-8 rounded bg-zinc-100 object-cover dark:bg-zinc-800" />
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
          ) : (
            <div className="flex items-center gap-2 rounded-lg border border-zinc-200 px-3 py-2 dark:border-zinc-800">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img onError={onImageError} src={coverThumb(picked.imageUrl, "sm") ?? "/placeholder.svg"} alt="" className="h-9 w-9 rounded bg-zinc-100 object-cover dark:bg-zinc-800" />
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-1.5 text-sm font-medium text-zinc-900 dark:text-zinc-50">
                  <span className="truncate">{picked.name}</span>
                  {picked.explicit && <ExplicitBadge />}
                </span>
                <span className="block truncate text-xs text-zinc-500">{picked.artist}</span>
              </span>
              <button type="button" onClick={() => setChanging(true)} className="shrink-0 text-xs font-medium text-indigo-600 hover:underline dark:text-indigo-400">
                {t("노래 변경")}
              </button>
            </div>
          )}
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <button type="button" onClick={onClose} className="rounded-lg px-4 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-900">
            {t("취소")}
          </button>
          <button
            type="button"
            onClick={save}
            disabled={busy}
            className="rounded-lg bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-600 px-4 py-2 text-sm font-medium text-white hover:brightness-110 disabled:opacity-50"
          >
            {busy ? t("저장 중…") : t("저장")}
          </button>
        </div>
    </Dialog>
  );
}
