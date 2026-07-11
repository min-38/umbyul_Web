// 목록 페이지네이션 순수 헬퍼(QA7-3, 공지 목록에서 추출).

// 전체 개수 → 총 페이지 수(최소 1).
export function totalPagesFor(shownTotal: number, pageSize: number): number {
  return Math.max(1, Math.ceil(shownTotal / pageSize));
}

// 현재 페이지 ±2, 최대 5칸 윈도우(양끝 클램프).
export function pageWindow(page: number, totalPages: number): number[] {
  const from = Math.max(1, page - 2);
  const to = Math.min(totalPages, from + 4);
  return Array.from({ length: to - from + 1 }, (_, i) => from + i);
}
