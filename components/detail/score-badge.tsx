import type { RatingBadge } from "@/lib/api";
import { Stars } from "./stars";

// 릴리스에 평가가 있을 때만 별점 배지. 없으면 렌더 안 함(아티스트 종합점수는 만들지 않음).
export function ScoreBadge({ rating }: { rating: RatingBadge | null }) {
  if (!rating) return null;
  return (
    <span className="flex shrink-0 items-center gap-1">
      <Stars value={rating.average} size={12} />
      <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-200">{rating.average.toFixed(1)}</span>
      <span className="text-xs text-zinc-400">({rating.count})</span>
    </span>
  );
}
