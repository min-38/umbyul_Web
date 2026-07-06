"use client";

import { useEffect, useState } from "react";
import { getMentionMute, toggleMentionMute } from "@/app/actions/mention";
import { useT } from "@/components/i18n-provider";

/** 이 트랙/앨범의 멘션 알림만 끄기(NON-131). 로그인 유저에게만 노출. */
export function MentionMuteToggle({
  targetType,
  spotifyId,
  loggedIn,
}: {
  targetType: "track" | "album";
  spotifyId: string;
  loggedIn: boolean;
}) {
  const t = useT();
  const [muted, setMuted] = useState<boolean | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!loggedIn) return;
    getMentionMute(targetType, spotifyId).then(setMuted);
  }, [loggedIn, targetType, spotifyId]);

  if (!loggedIn || muted === null) return null;

  const toggle = async () => {
    if (busy) return;
    setBusy(true);
    const r = await toggleMentionMute(targetType, spotifyId);
    setBusy(false);
    if (r.ok) setMuted(r.muted);
  };

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={busy}
      title={muted ? t("이 페이지의 멘션 알림이 꺼져 있습니다") : t("이 페이지에서 멘션 알림 끄기")}
      className={`flex items-center gap-1 text-xs disabled:opacity-50 ${
        muted ? "text-rose-500" : "text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
      }`}
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
        <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        {muted && <line x1="3" y1="3" x2="21" y2="21" />}
      </svg>
      {muted ? t("멘션 알림 꺼짐") : t("멘션 알림 끄기")}
    </button>
  );
}
