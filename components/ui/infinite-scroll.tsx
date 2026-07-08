"use client";

import { useEffect, useRef } from "react";
import { Spinner } from "@/components/ui/spinner";
import { useT } from "@/components/i18n-provider";

// 리스트 하단 센티넬을 IntersectionObserver로 감지해 자동 로드(NON-152).
// 로딩 중엔 옵저버를 떼고, 로딩이 끝나면 다시 붙여 센티넬이 여전히 보이면 이어서 로드(중복 호출 없이 self-arming).
export function InfiniteScroll({
  hasMore,
  loading,
  onLoadMore,
  endLabel = null,
}: {
  hasMore: boolean;
  loading: boolean;
  onLoadMore: () => void;
  endLabel?: string | null;
}) {
  const t = useT();
  const ref = useRef<HTMLDivElement>(null);
  const cb = useRef(onLoadMore);
  cb.current = onLoadMore;

  useEffect(() => {
    if (!hasMore || loading) return; // 로딩 중엔 미부착 → 동시 로드 방지
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) cb.current();
      },
      { rootMargin: "400px" }, // 하단 도달 전 미리 로드
    );
    io.observe(el);
    return () => io.disconnect();
  }, [hasMore, loading]);

  if (!hasMore) {
    return endLabel ? (
      <p className="py-6 text-center text-xs text-zinc-400 dark:text-zinc-500">{endLabel}</p>
    ) : null;
  }

  return (
    <div ref={ref} className="flex justify-center py-6 text-zinc-400">
      {loading ? <Spinner /> : null}
      <span className="sr-only">{t("불러오는 중…")}</span>
    </div>
  );
}
