import { coverThumb } from "@/lib/image";

// 믹스 리스트용 트랙 커버 미리보기: 카드처럼 겹쳐 쌓은 커버 2개 + "+n".
export function MixCovers({ covers, trackCount }: { covers: string[]; trackCount: number }) {
  const shown = covers.slice(0, 2);
  const extra = Math.max(0, trackCount - shown.length);
  const tile = "h-12 w-12 rounded-lg border-2 border-white object-cover shadow-sm dark:border-zinc-950";

  if (shown.length === 0 && extra === 0) {
    return <div className="h-12 w-12 shrink-0 rounded-lg bg-zinc-100 dark:bg-zinc-800" />;
  }

  return (
    <div className="flex shrink-0 items-center">
      {shown.map((url, i) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img key={i} src={coverThumb(url, "sm") ?? "/placeholder.svg"} alt="" className={`${tile} bg-zinc-100 dark:bg-zinc-800 ${i > 0 ? "-ml-5" : ""}`} />
      ))}
      {extra > 0 && (
        <span className={`${tile} flex items-center justify-center bg-zinc-800 text-xs font-semibold text-white dark:bg-zinc-700 ${shown.length > 0 ? "-ml-5" : ""}`}>
          +{extra}
        </span>
      )}
    </div>
  );
}
