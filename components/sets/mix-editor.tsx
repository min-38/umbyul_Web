"use client";

import { useState } from "react";
import Link from "next/link";
import type { DjSetDetail, DjSetTrack } from "@/lib/api";
import { addSetTrack, removeSetTrack, reorderSetTracks, replaceSetTrack, updateSet } from "@/app/actions/sets";
import { TrackPicker, YoutubeIcon, MAX_TRACKS, type PickedTrack } from "@/components/sets/track-picker";
import { EditTrackModal } from "@/components/sets/edit-track-modal";
import { MeatballMenu } from "@/components/ui/meatball-menu";
import { MixGuide } from "@/components/sets/mix-guide";
import { ExplicitBadge } from "@/components/detail/explicit-badge";
import { coverThumb, onImageError } from "@/lib/image";
import { safeHttpUrl } from "@/lib/validation";
import { useT } from "@/components/i18n-provider";

const field =
  "w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100";
const labelCls = "text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400";

export function MixEditor({ detail }: { detail: DjSetDetail }) {
  const t = useT();
  const { set } = detail;
  const [tracks, setTracks] = useState<DjSetTrack[]>(detail.tracks);
  const [title, setTitle] = useState(set.title);
  const [note, setNote] = useState(set.note ?? "");
  const [url, setUrl] = useState(set.listenUrl ?? "");
  const [urlErr, setUrlErr] = useState(false);
  const [editFor, setEditFor] = useState<DjSetTrack | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const saveFields = async () => {
    if (!title.trim() || saving) return;
    const listenUrl = url.trim() || null;
    if (listenUrl && !safeHttpUrl(listenUrl)) {
      setUrlErr(true);
      return;
    }
    setSaving(true);
    const r = await updateSet(set.id, { title: title.trim(), note: note.trim() || null, listenUrl });
    setSaving(false);
    if (r.ok) {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  };

  const move = async (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= tracks.length) return;
    const next = [...tracks];
    [next[i], next[j]] = [next[j], next[i]];
    setTracks(next);
    await reorderSetTracks(set.id, next.map((x) => x.spotifyId));
  };

  const removeTrack = async (spotifyId: string) => {
    setTracks((ts) => ts.filter((x) => x.spotifyId !== spotifyId));
    await removeSetTrack(set.id, spotifyId);
  };

  const addTrack = async (tr: PickedTrack): Promise<boolean> => {
    if (tracks.some((x) => x.spotifyId === tr.spotifyId)) return false;
    const r = await addSetTrack(set.id, tr);
    if (!r.ok) return false;
    // youtubeUrl은 곡 전역 링크에서 옴 — 재로드 시 채워짐. 낙관적 추가엔 null.
    setTracks((ts) => [...ts, { ...tr, youtubeUrl: null, position: 0, myScore: null, myReview: null }]);
    return true;
  };

  const onEditSave = async (old: DjSetTrack, picked: PickedTrack): Promise<boolean> => {
    const r = await replaceSetTrack(set.id, old.spotifyId, picked);
    if (!r.ok) return false;
    const sameSong = picked.spotifyId === old.spotifyId;
    setTracks((ts) =>
      ts.map((x) =>
        x.spotifyId === old.spotifyId
          ? { ...x, ...picked, youtubeUrl: sameSong ? x.youtubeUrl : null, myScore: sameSong ? x.myScore : null, myReview: sameSong ? x.myReview : null }
          : x,
      ),
    );
    return true;
  };

  const iconBtn = "shrink-0 text-zinc-300 hover:text-zinc-600 disabled:opacity-30 dark:text-zinc-600 dark:hover:text-zinc-300";

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-4 py-8">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">{t("믹스 수정")}</h1>
        <Link href={`/mixes/${set.id}`} className="rounded-full border border-zinc-300 px-4 py-1.5 text-sm font-medium text-zinc-600 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800">
          {t("완료")}
        </Link>
      </div>

      {/* 제목·설명·링크 */}
      <label className="flex flex-col gap-1.5">
        <span className={labelCls}>{t("제목")}</span>
        <input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={100} placeholder={t("믹스 제목")} className={field} />
      </label>
      <label className="flex flex-col gap-1.5">
        <span className={labelCls}>{t("설명")}</span>
        <textarea value={note} onChange={(e) => setNote(e.target.value)} maxLength={500} rows={3} placeholder={t("한마디 (선택) — 이거 들어봐")} className={`${field} resize-none`} />
      </label>
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
      <button
        type="button"
        onClick={saveFields}
        disabled={saving || title.trim() === ""}
        className="self-start rounded-full bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-600 px-5 py-2 text-sm font-semibold text-white hover:brightness-110 disabled:opacity-50"
      >
        {saved ? t("저장됨") : saving ? t("저장 중…") : t("저장")}
      </button>

      {/* 곡 */}
      <div className="flex flex-col gap-2 border-t border-zinc-200 pt-5 dark:border-zinc-800">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <span className={labelCls}>{t("곡")}</span>
            <MixGuide />
          </span>
          <span className="text-xs tabular-nums text-zinc-500">{tracks.length}/{MAX_TRACKS}</span>
        </div>

        <TrackPicker onAdd={addTrack} disabledHint={tracks.length >= MAX_TRACKS ? t("최대 {count}곡까지 담을 수 있어요.", { count: MAX_TRACKS }) : null} />

        <ul className="mt-1 flex flex-col divide-y divide-zinc-100 dark:divide-zinc-800/70">
          {tracks.map((tr, i) => (
            <li key={tr.spotifyId} className="flex items-center gap-2 py-2.5">
              <span className="flex shrink-0 flex-col">
                <button type="button" onClick={() => move(i, -1)} disabled={i === 0} aria-label={t("위로 이동")} className={iconBtn}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M18 15l-6-6-6 6" /></svg>
                </button>
                <button type="button" onClick={() => move(i, 1)} disabled={i === tracks.length - 1} aria-label={t("아래로 이동")} className={iconBtn}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6" /></svg>
                </button>
              </span>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img onError={onImageError} src={coverThumb(tr.imageUrl, "sm") ?? "/placeholder.svg"} alt="" className="h-10 w-10 shrink-0 rounded bg-zinc-100 object-cover dark:bg-zinc-800" />
              <div className="min-w-0 flex-1">
                <span className="flex items-center gap-1.5 text-sm font-medium text-zinc-900 dark:text-zinc-50">
                  <span className="truncate">{tr.name}</span>
                  {tr.explicit && <ExplicitBadge />}
                </span>
                <span className="block truncate text-xs text-zinc-500">
                  {tr.artist}
                  {tr.albumName ? ` · ${tr.albumName}` : ""}
                </span>
              </div>
              {tr.youtubeUrl && <span className="shrink-0 text-red-600"><YoutubeIcon size={14} /></span>}
              <MeatballMenu
                label={t("더보기")}
                items={[
                  { label: t("수정"), onSelect: () => setEditFor(tr) },
                  { label: t("삭제"), onSelect: () => removeTrack(tr.spotifyId), danger: true },
                ]}
              />
            </li>
          ))}
        </ul>
      </div>

      {editFor && (
        <EditTrackModal track={editFor} onClose={() => setEditFor(null)} onSave={(picked) => onEditSave(editFor, picked)} />
      )}
    </div>
  );
}
