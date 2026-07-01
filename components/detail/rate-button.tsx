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
  imageUrl,
  myScore,
  myReview,
  path,
}: {
  loggedIn: boolean;
  targetType: "track" | "album";
  targetId: string;
  spotifyId: string;
  name: string;
  artist: string;
  imageUrl: string | null;
  myScore: number;
  myReview: string;
  path: string;
}) {
  const [open, setOpen] = useState(false);
  const t = useT();
  const cls =
    "inline-flex items-center justify-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500";

  if (!loggedIn) {
    return (
      <Link href="/login" className={cls}>
        {t("평가하기")}
      </Link>
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
          imageUrl={imageUrl}
          initialScore={myScore}
          initialReview={myReview}
          path={path}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}
