"use client";

import { useState } from "react";
import Link from "next/link";
import { ReviewModal } from "./review-modal";
import { useT } from "@/components/i18n-provider";

// 비로그인 → 로그인 유도. 로그인 → 작성/수정 모달.
export function RateButton({
  loggedIn,
  targetType,
  targetId,
  spotifyId,
  name,
  artist,
  artists,
  imageUrl,
  explicit = false,
  myScore,
  myReview,
  path,
  sanction = null,
}: {
  loggedIn: boolean;
  targetType: "track" | "album";
  targetId: string;
  spotifyId: string;
  name: string;
  artist: string;
  artists: { id: string; name: string }[];
  imageUrl: string | null;
  explicit?: boolean;
  myScore: number;
  myReview: string;
  path: string;
  sanction?: "suspended" | "banned" | null;
}) {
  const [open, setOpen] = useState(false);
  const t = useT();
  const cls =
    "inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:brightness-110";

  if (!loggedIn) {
    return (
      <Link href="/login" className={cls}>
        {t("평가하기")}
      </Link>
    );
  }

  // 정지/영구정지: 버튼 숨기고 안내(NON-61).
  if (sanction) {
    return (
      <span className="inline-flex items-center rounded-lg bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
        {sanction === "banned" ? t("계정이 정지되어 평가할 수 없습니다.") : t("일시 정지되어 평가할 수 없습니다.")}
      </span>
    );
  }

  const editing = myScore > 0;

  return (
    <>
      <button type="button" className={cls} onClick={() => setOpen(true)}>
        {editing ? t("내 평가 수정") : t("평가하기")}
      </button>
      {open && (
        <ReviewModal
          targetType={targetType}
          targetId={targetId}
          spotifyId={spotifyId}
          name={name}
          artist={artist}
          artists={artists}
          imageUrl={imageUrl}
          explicit={explicit}
          initialScore={myScore}
          initialReview={myReview}
          path={path}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}
