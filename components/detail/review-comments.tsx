"use client";

import { useState } from "react";
import Link from "next/link";
import type { ReviewComment } from "@/lib/api";
import { loadComments, addComment, deleteComment } from "@/app/actions/comments";
import { formatRelativeTime } from "@/lib/format";
import { useT, useLocale } from "@/components/i18n-provider";

export function ReviewComments({
  ratingId,
  initialCount,
  currentUserId,
}: {
  ratingId: string;
  initialCount: number;
  currentUserId: string | null;
}) {
  const t = useT();
  const locale = useLocale();
  const [open, setOpen] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [comments, setComments] = useState<ReviewComment[]>([]);
  const [count, setCount] = useState(initialCount);
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);

  const toggle = async () => {
    const next = !open;
    setOpen(next);
    if (next && !loaded) {
      setComments(await loadComments(ratingId));
      setLoaded(true);
    }
  };

  const submit = async () => {
    const text = body.trim();
    if (!text || busy) return;
    setBusy(true);
    const r = await addComment({ ratingId, body: text });
    setBusy(false);
    if (r.ok && r.comment) {
      setComments((c) => [...c, r.comment!]);
      setCount((n) => n + 1);
      setBody("");
    }
  };

  const remove = async (id: string) => {
    setComments((c) => c.filter((x) => x.id !== id));
    setCount((n) => Math.max(0, n - 1));
    await deleteComment(id);
  };

  return (
    <div className="flex flex-col">
      <button
        type="button"
        onClick={toggle}
        className="flex items-center gap-1 text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" aria-hidden="true">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
        {count > 0 ? t("댓글 {count}", { count }) : t("댓글")}
      </button>

      {open && (
        <div className="mt-2 flex flex-col gap-3 border-l-2 border-zinc-100 pl-3 dark:border-zinc-800">
          {loaded && comments.length === 0 && (
            <p className="text-xs text-zinc-400">{t("첫 댓글을 남겨보세요.")}</p>
          )}
          {comments.map((c) => (
            <div key={c.id} className="flex items-start gap-2">
              <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center overflow-hidden rounded-full bg-zinc-200 text-[10px] font-medium text-zinc-500 dark:bg-zinc-800 dark:text-zinc-300">
                {c.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={c.avatarUrl} alt="" className="h-full w-full object-cover" />
                ) : (
                  c.username.charAt(0).toUpperCase()
                )}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-xs">
                  <Link href={`/u/${c.username}`} className="font-medium text-zinc-800 hover:underline dark:text-zinc-100">
                    {c.username}
                  </Link>
                  <span className="ml-1.5 text-zinc-400">{formatRelativeTime(c.createdAt, locale)}</span>
                </p>
                <p className="whitespace-pre-wrap text-sm text-zinc-700 dark:text-zinc-200">{c.body}</p>
              </div>
              {c.userId === currentUserId && (
                <button
                  type="button"
                  aria-label={t("삭제")}
                  onClick={() => remove(c.id)}
                  className="shrink-0 text-xs text-zinc-400 hover:text-red-500"
                >
                  {t("삭제")}
                </button>
              )}
            </div>
          ))}

          {currentUserId ? (
            <div className="flex items-end gap-2">
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder={t("댓글 달기…")}
                rows={1}
                maxLength={1000}
                className="min-h-9 flex-1 resize-none rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              />
              <button
                type="button"
                onClick={submit}
                disabled={busy || body.trim() === ""}
                className="shrink-0 rounded-lg bg-zinc-900 px-3 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-50 dark:bg-zinc-100 dark:text-black dark:hover:bg-zinc-200"
              >
                {t("등록")}
              </button>
            </div>
          ) : (
            <Link href="/login" className="text-xs text-indigo-600 hover:underline dark:text-indigo-400">
              {t("로그인하고 댓글 달기")}
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
