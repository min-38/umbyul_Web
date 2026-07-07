"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { ReviewComment } from "@/lib/api";
import { loadComments, addComment, deleteComment, editComment, toggleCommentLike } from "@/app/actions/comments";
import { msg } from "@/lib/messages";
import { formatRelativeTime } from "@/lib/format";
import { useConfirm } from "@/components/ui/confirm-dialog";
import { useT, useLocale } from "@/components/i18n-provider";
import { ReportDialog } from "@/components/detail/report-control";
import { MentionTextarea } from "@/components/detail/mention-textarea";

const REPLY_COLLAPSE_THRESHOLD = 2;

// 본문의 @username 을 유저 링크로.
function renderBody(body: string) {
  return body.split(/(@[A-Za-z0-9_-]+)/g).map((part, i) =>
    part.startsWith("@") ? (
      <Link key={i} href={`/u/${part.slice(1)}`} className="font-medium text-indigo-600 hover:underline dark:text-indigo-400">
        {part}
      </Link>
    ) : (
      <span key={i}>{part}</span>
    ),
  );
}

// 좋아요 = 엄지척(리뷰 반응과 동일 디자인, BUG-4).
function ThumbUp({ filled }: { filled: boolean }) {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinejoin="round" aria-hidden="true">
      <path d="M7 10v11M2 13v6a2 2 0 002 2h13.5a2 2 0 001.97-1.64l1.3-7A2 2 0 0019.8 10H14V4a2 2 0 00-2-2l-3 7v11" />
    </svg>
  );
}

export function ReviewComments({
  ratingId,
  initialCount,
  currentUserId,
  defaultOpen = false,
  focusCommentId,
}: {
  ratingId: string;
  initialCount: number;
  currentUserId: string | null;
  defaultOpen?: boolean;
  focusCommentId?: string; // 멘션 알림 딥링크로 진입 시 스크롤·강조할 댓글(BUG-3)
}) {
  const t = useT();
  const locale = useLocale();
  const confirm = useConfirm();
  const [open, setOpen] = useState(defaultOpen);
  const [loaded, setLoaded] = useState(false);
  const [comments, setComments] = useState<ReviewComment[]>([]);
  const [draft, setDraft] = useState("");
  const [replyTo, setReplyTo] = useState<{ parentId: string } | null>(null);
  const [replyDraft, setReplyDraft] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState("");
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [reportTarget, setReportTarget] = useState<string | null>(null);
  const [highlightId, setHighlightId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // 모달 등 임베드 모드: 마운트 시 바로 로드(토글 버튼 없음).
  useEffect(() => {
    if (defaultOpen && !loaded) loadComments(ratingId).then((c) => { setComments(c); setLoaded(true); });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 멘션 딥링크(?c=): 댓글 열고 → 로드 → (대댓글이면 부모 펼침) → 스크롤 + 잠깐 강조(BUG-3).
  useEffect(() => {
    if (!focusCommentId) return;
    let cancelled = false;
    (async () => {
      setOpen(true);
      let list = comments;
      if (!loaded) {
        list = await loadComments(ratingId);
        if (cancelled) return;
        setComments(list);
        setLoaded(true);
      }
      const target = list.find((c) => c.id === focusCommentId);
      if (target?.parentId) setExpanded((s) => new Set(s).add(target.parentId!));
      requestAnimationFrame(() => {
        document.getElementById(`comment-${focusCommentId}`)?.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "center" });
      });
      setHighlightId(focusCommentId);
      setTimeout(() => { if (!cancelled) setHighlightId(null); }, 2500);
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focusCommentId]);

  const top = comments.filter((c) => c.parentId === null);
  const repliesOf = (id: string) => comments.filter((c) => c.parentId === id);
  const displayCount = loaded ? comments.filter((c) => !c.deleted).length : initialCount;

  const toggle = async () => {
    const next = !open;
    setOpen(next);
    if (next && !loaded) {
      setComments(await loadComments(ratingId));
      setLoaded(true);
    }
  };

  const post = async (text: string, parentId: string | null) => {
    if (!text.trim() || busy) return;
    setBusy(true);
    setErr(null);
    const r = await addComment({ ratingId, body: text.trim(), parentId });
    setBusy(false);
    if (r.ok && r.comment) {
      setComments((c) => [...c, r.comment!]);
      if (parentId) {
        setReplyDraft("");
        setReplyTo(null);
        setExpanded((s) => new Set(s).add(parentId));
      } else {
        setDraft("");
      }
    } else {
      setErr(msg(r.code, locale));
    }
  };

  const like = async (id: string) => {
    const r = await toggleCommentLike(id);
    if (r.ok && r.data) {
      setComments((cs) => cs.map((c) => (c.id === id ? { ...c, likedByMe: r.data!.liked, likeCount: r.data!.likeCount } : c)));
    }
  };

  const remove = async (id: string) => {
    if (!(await confirm({ message: t("이 댓글을 삭제할까요?"), danger: true }))) return;
    await deleteComment(id);
    setComments((cs) => {
      const hasReplies = cs.some((c) => c.parentId === id);
      return hasReplies
        ? cs.map((c) => (c.id === id ? { ...c, deleted: true, body: null } : c))
        : cs.filter((c) => c.id !== id);
    });
  };

  const startEdit = (c: ReviewComment) => {
    setEditingId(c.id);
    setEditDraft(c.body ?? "");
  };

  const saveEdit = async (id: string) => {
    const body = editDraft.trim();
    if (!body) return;
    setComments((cs) => cs.map((c) => (c.id === id ? { ...c, body, edited: true } : c)));
    setEditingId(null);
    await editComment(id, body);
  };

  const startReply = (parentTopId: string) => {
    if (!currentUserId) return;
    setReplyTo({ parentId: parentTopId });
    setReplyDraft("");
  };

  const commentRow = (c: ReviewComment) => (
    <div
      id={`comment-${c.id}`}
      className={`flex items-start gap-2 scroll-mt-24 rounded-lg transition-colors duration-500 ${
        highlightId === c.id ? "bg-amber-100 dark:bg-amber-950/40" : ""
      }`}
    >
      <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center overflow-hidden rounded-full bg-zinc-200 text-[10px] font-medium text-zinc-500 dark:bg-zinc-800 dark:text-zinc-300">
        {c.avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={c.avatarUrl} alt="" className="h-full w-full object-cover" />
        ) : (
          c.username.charAt(0).toUpperCase()
        )}
      </span>
      <div className="min-w-0 flex-1">
        <p className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-xs">
          <Link href={`/u/${c.username}`} className="font-medium text-zinc-800 hover:underline dark:text-zinc-100">
            {c.username}
          </Link>
          {c.score !== null ? (
            <span className="rounded bg-amber-100 px-1 text-[10px] font-medium text-amber-700 dark:bg-amber-950 dark:text-amber-400">
              ★ {c.score.toFixed(1)}
            </span>
          ) : (
            <span className="text-[10px] text-zinc-500">{t("평가 없음")}</span>
          )}
          <span className="text-zinc-500">{formatRelativeTime(c.createdAt, locale)}</span>
        </p>

        {c.deleted ? (
          <p className="text-sm italic text-zinc-500">{t("삭제된 댓글입니다.")}</p>
        ) : editingId === c.id ? (
          <div className="mt-1 flex items-end gap-2">
            <MentionTextarea
              value={editDraft}
              onChange={setEditDraft}
              autoFocus
              wrapperClassName="flex-1"
              className="min-h-9 w-full resize-none rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-zinc-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
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
            {renderBody(c.body ?? "")}
            {c.edited && <span className="ml-1 text-xs text-zinc-500">{t("(수정됨)")}</span>}
          </p>
        )}

        {!c.deleted && editingId !== c.id && (
          <div className="mt-0.5 flex items-center gap-3 text-xs text-zinc-500">
            <button
              type="button"
              onClick={() => (currentUserId ? like(c.id) : undefined)}
              aria-label={t("좋아요")}
              aria-pressed={c.likedByMe}
              className={`flex items-center gap-1 hover:text-zinc-600 dark:hover:text-zinc-300 ${c.likedByMe ? "text-indigo-600 dark:text-indigo-400" : ""}`}
            >
              <ThumbUp filled={c.likedByMe} />
              {c.likeCount > 0 && c.likeCount}
            </button>
            {currentUserId && (
              <button type="button" onClick={() => startReply(c.parentId ?? c.id)} className="hover:text-zinc-600 dark:hover:text-zinc-300">
                {t("답글")}
              </button>
            )}
            {currentUserId && c.userId === currentUserId && (
              <>
                <button type="button" onClick={() => startEdit(c)} className="hover:text-zinc-600 dark:hover:text-zinc-300">
                  {t("수정")}
                </button>
                <button type="button" onClick={() => remove(c.id)} className="hover:text-red-500">
                  {t("삭제")}
                </button>
              </>
            )}
            {currentUserId && c.userId !== currentUserId && (
              <button type="button" onClick={() => setReportTarget(c.id)} className="hover:text-red-500">
                {t("신고")}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="flex flex-col">
      {!defaultOpen && (
        <button
          type="button"
          onClick={toggle}
          className="flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" aria-hidden="true">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          {displayCount > 0 ? t("댓글 {count}", { count: displayCount }) : t("댓글")}
        </button>
      )}

      {open && (
        <div className={`flex flex-col gap-3 ${defaultOpen ? "" : "mt-2 border-l-2 border-zinc-100 pl-3 dark:border-zinc-800"}`}>
          {loaded && top.length === 0 && <p className="text-xs text-zinc-500">{t("첫 댓글을 남겨보세요.")}</p>}

          {top.map((c) => {
            const replies = repliesOf(c.id);
            const over = replies.length > REPLY_COLLAPSE_THRESHOLD;
            const showReplies = !over || expanded.has(c.id);
            return (
              <div key={c.id} className="flex flex-col gap-3">
                {commentRow(c)}
                {(replies.length > 0 || replyTo?.parentId === c.id) && (
                  <div className="ml-8 flex flex-col gap-3">
                    {over && (
                      <button
                        type="button"
                        onClick={() => setExpanded((s) => { const n = new Set(s); n.has(c.id) ? n.delete(c.id) : n.add(c.id); return n; })}
                        className="self-start text-xs font-medium text-indigo-600 hover:underline dark:text-indigo-400"
                      >
                        {expanded.has(c.id) ? t("간략히") : t("답글 {count}개 보기", { count: replies.length })}
                      </button>
                    )}
                    {showReplies && replies.map((rep) => <div key={rep.id}>{commentRow(rep)}</div>)}
                    {replyTo?.parentId === c.id && (
                      <div className="flex items-end gap-2">
                        <MentionTextarea
                          value={replyDraft}
                          onChange={setReplyDraft}
                          placeholder={t("댓글 달기…")}
                          autoFocus
                          wrapperClassName="flex-1"
                          className="min-h-9 w-full resize-none rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                        />
                        <button type="button" onClick={() => setReplyTo(null)} className="shrink-0 px-1 py-2 text-xs text-zinc-500 hover:text-zinc-600">
                          {t("취소")}
                        </button>
                        <button
                          type="button"
                          onClick={() => post(replyDraft, c.id)}
                          disabled={busy || replyDraft.trim() === ""}
                          className="shrink-0 rounded-lg bg-zinc-900 px-3 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-50 dark:bg-zinc-100 dark:text-black dark:hover:bg-zinc-200"
                        >
                          {t("등록")}
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}

          {currentUserId ? (
            <div className={defaultOpen ? "sticky bottom-0 -mb-1 flex items-end gap-2 bg-white pt-2 dark:bg-zinc-950" : "flex items-end gap-2"}>
              <MentionTextarea
                value={draft}
                onChange={setDraft}
                placeholder={t("댓글 달기…")}
                wrapperClassName="flex-1"
                className="min-h-9 w-full resize-none rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              />
              <button
                type="button"
                onClick={() => post(draft, null)}
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
          {err && <p className="text-xs text-red-600 dark:text-red-400">{err}</p>}
        </div>
      )}

      <ReportDialog
        targetType="comment"
        targetId={reportTarget ?? ""}
        open={reportTarget !== null}
        onClose={() => setReportTarget(null)}
      />
    </div>
  );
}
