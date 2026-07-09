import Link from "next/link";
import type { Genre } from "@/lib/api";

// Discover "장르" 섹션(NON-84): 우리 부모 장르를 색상 카드로 → 각 장르 페이지(/discover/genre/{slug}).
// 장르명은 영어 단일(프로젝트 규칙) — i18n 없음. 섹션 라벨만 번역.

// 부모 장르별 고유 색(slug 기준). 흰 글씨가 읽히는 중간-진한 톤.
const GENRE_COLORS: Record<string, string> = {
  pop: "#db2777",
  kpop: "#9333ea",
  rock: "#dc2626",
  hiphop: "#ea580c",
  rnb: "#4f46e5",
  ballad: "#2563eb",
  indie: "#0d9488",
  electronic: "#0891b2",
  dance: "#c026d3",
  metal: "#52525b",
  jazz: "#d97706",
  soul: "#7c3aed",
  funk: "#65a30d",
  blues: "#0284c7",
  folk: "#16a34a",
  country: "#ca8a04",
  classical: "#334155",
  latin: "#e11d48",
  trot: "#059669",
  ost: "#78716c",
};
const DEFAULT_COLOR = "#6b7280";

export function GenreSection({ genres, label }: { genres: Genre[]; label: string }) {
  const parents = genres.filter((g) => g.parentId === null);
  if (parents.length === 0) return null;

  return (
    <section>
      <h2 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-50">{label}</h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        {parents.map((g) => (
          <Link
            key={g.id}
            href={`/discover/genre/${g.slug}`}
            className="flex h-24 items-center justify-center rounded-2xl px-3 text-center text-base font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:brightness-105 hover:shadow-md"
            style={{ backgroundColor: GENRE_COLORS[g.slug] ?? DEFAULT_COLOR }}
          >
            {g.name}
          </Link>
        ))}
      </div>
    </section>
  );
}
