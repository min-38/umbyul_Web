// 트랙/앨범 구분 배지(NON-92). 피드·차트·프로필·상세에서 공통 사용(NON-110 중복 제거).
// 순수 표시 컴포넌트(서버/클라 공용) — 라벨은 호출부에서 t()로 전달.
export function TargetBadge({ type, label }: { type: "track" | "album"; label: string }) {
  return (
    <span
      className={`shrink-0 rounded px-1.5 py-0.5 text-[10px] font-medium ${
        type === "track"
          ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300"
          : "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
      }`}
    >
      {label}
    </span>
  );
}
