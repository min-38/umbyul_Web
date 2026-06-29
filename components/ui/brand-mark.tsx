// 임시 브랜드 마크(바이닐 디스크). 실제 로고 확정 시 교체.
export function BrandMark() {
  return (
    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-100 dark:bg-zinc-800">
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        className="text-zinc-700 dark:text-zinc-200"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="9" />
        <circle cx="12" cy="12" r="2.5" />
      </svg>
    </span>
  );
}
