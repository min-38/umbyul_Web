"use client";

import { ReviewComments } from "@/components/detail/review-comments";
import { Dialog } from "@/components/ui/dialog";
import { useT } from "@/components/i18n-provider";

/** 피드 카드에서 댓글을 별도 모달로 표시(NON-40 재사용, 항상 펼침). */
export function FeedCommentsModal({
  ratingId,
  commentCount,
  currentUserId,
  onClose,
}: {
  ratingId: string;
  commentCount: number;
  currentUserId: string | null;
  onClose: () => void;
}) {
  const t = useT();
  return (
    <Dialog open onClose={onClose} labelledBy="feed-comments-title" panelClassName="flex max-h-[80vh] w-full max-w-lg flex-col rounded-2xl bg-white p-5 shadow-xl outline-none dark:bg-zinc-950">
      <div className="mb-3 flex items-center justify-between">
        <h2 id="feed-comments-title" className="text-base font-semibold text-zinc-900 dark:text-zinc-50">{t("댓글")}</h2>
        <button
          type="button"
          onClick={onClose}
          aria-label={t("닫기")}
          className="text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-200"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>
      </div>
      <div className="overflow-y-auto">
        <ReviewComments ratingId={ratingId} initialCount={commentCount} currentUserId={currentUserId} defaultOpen />
      </div>
    </Dialog>
  );
}
