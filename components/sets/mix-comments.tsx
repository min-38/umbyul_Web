"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { DjSetComment } from "@/lib/api";
import { loadSetComments, addSetComment, deleteSetComment, editSetComment } from "@/app/actions/sets";
import { ReportDialog } from "@/components/detail/report-control";
import { MeatballMenu } from "@/components/ui/meatball-menu";
import { LevelBadge } from "@/components/ui/level-badge";
import { msg } from "@/lib/messages";
import { formatRelativeTime } from "@/lib/format";
import { useConfirm } from "@/components/ui/confirm-dialog";
import { useT, useLocale } from "@/components/i18n-provider";

// 믹스 평면 댓글 (NON-133).
export function MixComments({ setId, currentUserId }: { setId: string; currentUserId: string | null }) {
  const t = useT();
  const locale = useLocale();
  const confirm = useConfirm();
  const [comments, setComments] = useState<DjSetComment[]>([]);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [reportId, setReportId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState("");

  useEffect(() => {
    loadSetComments(setId).then(setComments);
  }, [setId]);

  const startEdit = (c: DjSetComment) => {
    setEditingId(c.id);
    setEditDraft(c.body);
  };

  const saveEdit = async (id: string) => {
    const body = editDraft.trim();
    if (!body) return;
    setComments((c) => c.map((x) => (x.id === id ? { ...x, body, edited: true } : x)));
    setEditingId(null);
    await editSetComment(setId, id, body);
  };

  const submit = async () => {
    if (!draft.trim() || busy) return;
    setBusy(true);
    setErr(null);
    const r = await addSetComment(setId, draft.trim());
    setBusy(false);
    if (r.ok && r.comment) {
      setComments((c) => [r.comment!, ...c]);
      setDraft("");
    } else {
      setErr(msg(r.code, locale));
    }
  };

  const remove = async (id: string) => {
    if (!(await confirm({ message: t("이 댓글을 삭제할까요?"), danger: true }))) return;
    setComments((c) => c.filter((x) => x.id !== id));
    await deleteSetComment(setId, id);
  };

  return (
    <div className="mx-auto w-full max-w-2xl px-4 pb-12">
      <h2 className="mb-3 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
        {t("댓글")}
        {comments.length > 0 && <span className="text-zinc-500"> ({comments.length})</span>}
      </h2>

      {currentUserId ? (
        <div className="flex items-end gap-2">
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder={t("댓글 달기…")}
            rows={1}
            maxLength={1000}
            className="min-h-9 flex-1 resize-none rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
          />
          <button
            type="button"
            onClick={submit}
            disabled={busy || draft.trim() === ""}
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
      {err && <p className="mt-2 text-xs text-red-600 dark:text-red-400">{err}</p>}

      {comments.length === 0 ? (
        <p className="mt-4 text-sm text-zinc-500">{t("첫 댓글을 남겨보세요.")}</p>
      ) : (
        <ul className="mt-4 flex flex-col gap-3">
          {comments.map((c) => (
            <li key={c.id} className="flex items-start gap-2">
              <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center overflow-hidden rounded-full bg-zinc-200 text-[10px] font-medium text-zinc-500 dark:bg-zinc-800 dark:text-zinc-300">
                {c.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={c.avatarUrl} alt="" className="h-full w-full object-cover" />
                ) : (
                  c.username.charAt(0).toUpperCase()
                )}
              </span>
              <div className="min-w-0 flex-1">
                <p className="flex flex-wrap items-center gap-x-1.5 text-xs">
                  <Link href={`/u/${c.username}`} className="font-medium text-zinc-800 hover:underline dark:text-zinc-100">
                    {c.username}
                  </Link>
                  <LevelBadge level={c.level} />
                  <span className="text-zinc-500" suppressHydrationWarning>{formatRelativeTime(c.createdAt, locale)}</span>
                </p>
                {editingId === c.id ? (
                  <div className="mt-1 flex items-end gap-2">
                    <textarea
                      value={editDraft}
                      onChange={(e) => setEditDraft(e.target.value)}
                      rows={1}
                      maxLength={1000}
                      autoFocus
                      className="min-h-9 flex-1 resize-none rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-zinc-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                    />
                    <button type="button" onClick={() => setEditingId(null)} className="shrink-0 px-1 py-2 text-xs text-zinc-500 hover:text-zinc-600">
                      {t("취소")}
                    </button>
                    <button type="button" onClick={() => saveEdit(c.id)} disabled={editDraft.trim() === ""} className="shrink-0 rounded-lg bg-zinc-900 px-3 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-50 dark:bg-zinc-100 dark:text-black">
                      {t("저장")}
                    </button>
                  </div>
                ) : (
                  <p className="whitespace-pre-wrap text-sm text-zinc-700 dark:text-zinc-200">
                    {c.body}
                    {c.edited && <span className="ml-1 text-xs text-zinc-500">{t("(수정됨)")}</span>}
                  </p>
                )}
              </div>
              {editingId !== c.id &&
                (currentUserId === c.userId ? (
                  <MeatballMenu
                    label={t("더보기")}
                    items={[
                      { label: t("수정"), onSelect: () => startEdit(c) },
                      { label: t("삭제"), onSelect: () => remove(c.id), danger: true },
                    ]}
                  />
                ) : (
                  currentUserId && <MeatballMenu label={t("더보기")} items={[{ label: t("신고"), onSelect: () => setReportId(c.id), danger: true }]} />
                ))}
            </li>
          ))}
        </ul>
      )}

      <ReportDialog
        targetType="set_comment"
        targetId={reportId ?? ""}
        open={reportId !== null}
        onClose={() => setReportId(null)}
      />
    </div>
  );
}
