"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createSet, addSetTrack } from "@/app/actions/sets";
import { TrackPicker, YoutubeIcon, MAX_TRACKS, type PickedTrack } from "@/components/sets/track-picker";
import { MixGuide } from "@/components/sets/mix-guide";
import { coverThumb } from "@/lib/image";
import { safeHttpUrl } from "@/lib/validation";
import { useT } from "@/components/i18n-provider";

const field =
  "w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100";
const labelCls = "text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400";

export function NewSetForm() {
  const t = useT();
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [note, setNote] = useState("");
  const [url, setUrl] = useState("");
  const [urlErr, setUrlErr] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [tracks, setTracks] = useState<PickedTrack[]>([]);
  const [busy, setBusy] = useState(false);

  const addTrack = (tr: PickedTrack) => {
    if (tracks.some((x) => x.spotifyId === tr.spotifyId)) return false;
    setTracks((ts) => [...ts, tr]);
    return true;
  };
  const removeTrack = (spotifyId: string) => setTracks((ts) => ts.filter((x) => x.spotifyId !== spotifyId));

  const submit = async () => {
    if (!title.trim() || busy) return;
    const listenUrl = url.trim() || null;
    if (listenUrl && !safeHttpUrl(listenUrl)) {
      setUrlErr(true);
      return;
    }
    setErr(null);
    setBusy(true);
    const r = await createSet({ title: title.trim(), note: note.trim() || null, listenUrl });
    if (!r.ok || !r.id) {
      setErr(t("만들지 못했어요. 잠시 후 다시 시도해주세요.")); // 실패 무음 방지(UX-4)
      setBusy(false);
      return;
    }
    for (const tr of tracks) await addSetTrack(r.id, tr); // 순서 보존
    router.push(`/mixes/${r.id}`);
  };

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">{t("믹스 만들기")}</h1>

      {/* 제목 */}
      <label className="flex flex-col gap-1.5">
        <span className={labelCls}>{t("제목")}</span>
        <input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={100} placeholder={t("믹스 제목")} className={field} />
      </label>

      {/* 곡 */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <span className={labelCls}>{t("곡")}</span>
            <MixGuide />
          </span>
          <span className="text-xs tabular-nums text-zinc-400">{tracks.length}/{MAX_TRACKS}</span>
        </div>
        {tracks.length > 0 && (
          <ul className="flex flex-col divide-y divide-zinc-100 rounded-lg border border-zinc-200 dark:divide-zinc-800/70 dark:border-zinc-800">
            {tracks.map((tr) => (
              <li key={tr.spotifyId} className="flex items-center gap-2 px-3 py-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={coverThumb(tr.imageUrl, "sm") ?? "/placeholder.svg"} alt="" className="h-9 w-9 rounded bg-zinc-100 object-cover dark:bg-zinc-800" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm text-zinc-800 dark:text-zinc-100">{tr.name}</span>
                  <span className="block truncate text-xs text-zinc-400">{tr.artist}</span>
                </span>
                {tr.youtubeUrl && (
                  <span className="shrink-0 text-red-600" title={t("유튜브에서 보기")}>
                    <YoutubeIcon size={15} />
                  </span>
                )}
                <button type="button" onClick={() => removeTrack(tr.spotifyId)} aria-label={t("삭제")} className="shrink-0 text-zinc-300 hover:text-red-500">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                    <path d="M18 6 6 18M6 6l12 12" />
                  </svg>
                </button>
              </li>
            ))}
          </ul>
        )}
        <TrackPicker onAdd={addTrack} disabledHint={tracks.length >= MAX_TRACKS ? t("최대 {count}곡까지 담을 수 있어요.", { count: MAX_TRACKS }) : null} />
      </div>

      {/* 설명 */}
      <label className="flex flex-col gap-1.5">
        <span className={labelCls}>{t("설명")}</span>
        <textarea value={note} onChange={(e) => setNote(e.target.value)} maxLength={500} rows={3} placeholder={t("한마디 (선택) — 이거 들어봐")} className={`${field} resize-none`} />
      </label>

      {/* 플레이리스트 링크 */}
      <label className="flex flex-col gap-1.5">
        <span className={labelCls}>{t("플레이리스트 링크")}</span>
        <input
          value={url}
          onChange={(e) => {
            setUrl(e.target.value);
            setUrlErr(false);
          }}
          maxLength={500}
          placeholder={t("듣기 링크 (선택) — 유튜브·스포티파이 등")}
          className={field}
        />
        {urlErr && <p className="text-xs text-red-500">{t("http(s) 링크만 넣을 수 있어요.")}</p>}
      </label>

      {err && <p className="text-sm text-red-500" role="alert">{err}</p>}

      <button
        type="button"
        onClick={submit}
        disabled={busy || title.trim() === ""}
        className="self-start rounded-full bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-600 px-6 py-2.5 text-sm font-semibold text-white hover:brightness-110 disabled:opacity-50"
      >
        {busy ? t("만드는 중…") : t("만들기")}
      </button>
    </div>
  );
}
