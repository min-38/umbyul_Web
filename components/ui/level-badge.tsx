// 닉네임 옆 리뷰어 레벨 뱃지(NON-163). 담백하게 — 게임 과시 X, 신뢰 신호로.
// 여러 화면(피드·리뷰·댓글·차트·믹스)에서 공용.
export function LevelBadge({ level, className = "" }: { level: number; className?: string }) {
  return (
    <span
      className={`shrink-0 rounded-full bg-zinc-100 px-1.5 py-0.5 text-[10px] font-semibold leading-none text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400 ${className}`}
    >
      Lv {level}
    </span>
  );
}
