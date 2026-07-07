"use client";

import { useState } from "react";
import { StarInput } from "./star-input";
import { saveRating, deleteRating } from "@/app/actions/ratings";
import { msg } from "@/lib/messages";
import { Dialog } from "@/components/ui/dialog";
import { useT, useLocale } from "@/components/i18n-provider";

export function ReviewModal({
  targetType,
  targetId,
  spotifyId,
  name,
  artist,
  artists,
  imageUrl,
  explicit = false,
  initialScore,
  initialReview,
  path,
  onClose,
  onSaved,
}: {
  targetType: "track" | "album";
  targetId: string;
  spotifyId: string;
  name: string;
  artist: string;
  artists: { id: string; name: string }[];
  imageUrl: string | null;
  explicit?: boolean;
  initialScore: number;
  initialReview: string;
  path: string;
  onClose: () => void;
  onSaved?: (score: number, review: string) => void;
}) {
  const editing = initialScore > 0;
  const t = useT();
  const locale = useLocale();
  const [score, setScore] = useState(initialScore);
  const [review, setReview] = useState(initialReview);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    if (score <= 0) {
      setError(t("별점을 선택해주세요."));
      return;
    }
    if (review.trim().length < 10) {
      setError(t("리뷰는 최소 10자 이상 작성해주세요."));
      return;
    }
    setBusy(true);
    setError(null);
    const r = await saveRating({ targetType, targetId, spotifyId, score, review: review.trim(), path, name, artist, artists, imageUrl, explicit });
    setBusy(false);
    if (r.ok) {
      onSaved?.(score, review.trim());
      onClose();
    } else setError(msg(r.code, locale));
  };

  const remove = async () => {
    if (!window.confirm(t("평가를 삭제할까요?"))) return;
    setBusy(true);
    setError(null);
    const r = await deleteRating({ targetType, targetId, path });
    setBusy(false);
    if (r.ok) {
      onSaved?.(0, "");
      onClose();
    } else setError(msg(r.code, locale));
  };

  return (
    <Dialog open onClose={onClose} labelledBy="review-modal-title" panelClassName="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl outline-none dark:bg-zinc-950">
      <h2 id="review-modal-title" className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">{t("평가하기")}</h2>
        <p className="mt-0.5 truncate text-sm text-zinc-500">{name}</p>

        <div className="mt-5">
          <StarInput value={score} onChange={setScore} />
        </div>

        <textarea
          value={review}
          onChange={(e) => setReview(e.target.value)}
          placeholder={t("리뷰를 남겨주세요 (최소 10자)")}
          rows={5}
          maxLength={5000}
          className="mt-4 w-full resize-none rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
        />

        {/* 리뷰 작성 가이드 (NON-91) */}
        <ul className="mt-2 space-y-0.5 text-xs leading-relaxed text-zinc-400">
          <li>· {t("최소 10자 이상 작성해주세요.")}</li>
          <li>· {t("욕설·비방은 금지됩니다. 비판은 좋지만 비난은 안 됩니다.")}</li>
          <li>· {t("부적절한 리뷰는 신고 없이도 관리자가 삭제하고 제재할 수 있습니다.")}</li>
        </ul>

        {error && <p className="mt-2 text-sm text-red-500">{error}</p>}

        <div className="mt-5 flex items-center gap-2">
          {editing && (
            <button
              type="button"
              onClick={remove}
              disabled={busy}
              className="rounded-lg px-3 py-2 text-sm font-medium text-red-500 hover:bg-red-50 disabled:opacity-50 dark:hover:bg-red-950/40"
            >
              {t("삭제")}
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            className="ml-auto rounded-lg px-4 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-100 disabled:opacity-50 dark:text-zinc-300 dark:hover:bg-zinc-900"
          >
            {t("취소")}
          </button>
          <button
            type="button"
            onClick={submit}
            disabled={busy}
            className="rounded-lg bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:brightness-110 disabled:opacity-50"
          >
            {busy ? t("저장 중…") : editing ? t("수정") : t("등록")}
          </button>
        </div>
    </Dialog>
  );
}
