"use client";

import { useState } from "react";
import { StarInput } from "./star-input";
import { saveRating, deleteRating } from "@/app/actions/ratings";
import { msg } from "@/lib/messages";

export function ReviewModal({
  targetType,
  targetId,
  name,
  initialScore,
  initialReview,
  path,
  onClose,
}: {
  targetType: "track" | "album";
  targetId: string;
  name: string;
  initialScore: number;
  initialReview: string;
  path: string;
  onClose: () => void;
}) {
  const editing = initialScore > 0;
  const [score, setScore] = useState(initialScore);
  const [review, setReview] = useState(initialReview);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    if (score <= 0) {
      setError("별점을 선택해주세요.");
      return;
    }
    setBusy(true);
    setError(null);
    const r = await saveRating({ targetType, targetId, score, review: review.trim() || null, path });
    setBusy(false);
    if (r.ok) onClose();
    else setError(msg(r.code));
  };

  const remove = async () => {
    if (!window.confirm("평가를 삭제할까요?")) return;
    setBusy(true);
    setError(null);
    const r = await deleteRating({ targetType, targetId, path });
    setBusy(false);
    if (r.ok) onClose();
    else setError(msg(r.code));
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl dark:bg-zinc-950"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">평가하기</h2>
        <p className="mt-0.5 truncate text-sm text-zinc-500">{name}</p>

        <div className="mt-5">
          <StarInput value={score} onChange={setScore} />
        </div>

        <textarea
          value={review}
          onChange={(e) => setReview(e.target.value)}
          placeholder="리뷰를 남겨보세요 (선택)"
          rows={5}
          maxLength={5000}
          className="mt-4 w-full resize-none rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
        />

        {error && <p className="mt-2 text-sm text-red-500">{error}</p>}

        <div className="mt-5 flex items-center gap-2">
          {editing && (
            <button
              type="button"
              onClick={remove}
              disabled={busy}
              className="rounded-lg px-3 py-2 text-sm font-medium text-red-500 hover:bg-red-50 disabled:opacity-50 dark:hover:bg-red-950/40"
            >
              삭제
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            className="ml-auto rounded-lg px-4 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-100 disabled:opacity-50 dark:text-zinc-300 dark:hover:bg-zinc-900"
          >
            취소
          </button>
          <button
            type="button"
            onClick={submit}
            disabled={busy}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-50"
          >
            {busy ? "저장 중…" : editing ? "수정" : "등록"}
          </button>
        </div>
      </div>
    </div>
  );
}
