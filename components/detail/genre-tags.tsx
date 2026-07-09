"use client";

import { useEffect, useState } from "react";
import { loadGenres, loadGenresFor } from "@/app/actions/metadata";
import { toggleGenreTag } from "@/app/actions/social";
import type { Genre, GenresFor } from "@/lib/api";
import { useT } from "@/components/i18n-provider";
import { GenrePicker } from "./genre-picker";

// 상세 장르 태그(NON-122). 투표 상위 장르 칩 + 로그인 유저는 "+ 장르"로 검색 멀티셀렉트 토글.
export function GenreTags({
  targetType,
  id,
  loggedIn,
  initialData = null,
  initialGenres = [],
}: {
  targetType: "track" | "album";
  id: string;
  loggedIn: boolean;
  // 서버에서 미리 받아 첫 페인트부터 칩을 그려 깜빡임 방지(NON-161).
  initialData?: GenresFor | null;
  initialGenres?: Genre[];
}) {
  const t = useT();
  const [data, setData] = useState<GenresFor | null>(initialData);
  const [genres, setGenres] = useState<Genre[]>(initialGenres);
  const [editing, setEditing] = useState(false);
  const [busy, setBusy] = useState(false);

  const reload = async () => setData(await loadGenresFor(targetType, id));
  // 서버 시드가 없을 때만 마운트 후 로드 — 시드가 있으면 재조회로 인한 재렌더/깜빡임 방지.
  useEffect(() => {
    if (initialData === null) reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetType, id]);
  // picker용 전체 장르 목록 — 시드가 없을 때만 로드.
  useEffect(() => {
    if (initialGenres.length === 0) loadGenres().then(setGenres);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openEditor = () => setEditing(true);

  const mine = new Set(data?.mine ?? []);
  const top = data?.top ?? [];
  // 장르 이름은 영어 단일. 부모 있으면 "부모 › 자식"(Rock › Hard Rock), 없으면 단독.
  const displayLabel = (g: { name: string; parentName: string | null }) =>
    g.parentName ? `${g.parentName} › ${g.name}` : g.name;

  const toggle = async (gid: number) => {
    setBusy(true);
    const r = await toggleGenreTag({ targetType, spotifyId: id, genreId: gid });
    if (r.ok) await reload();
    setBusy(false);
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-1.5">
        {top.length === 0 && !editing && (
          <span className="text-xs text-zinc-500">{t("아직 장르 태그가 없습니다.")}</span>
        )}
        {/* 1표부터 노출(NON-122). 합의(2표↑)는 솔리드, 단일 표는 점선·흐리게로 구분. */}
        {top.map((g) => {
          const consensus = g.count >= 2;
          return (
            <span
              key={g.id}
              className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                mine.has(g.id)
                  ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300"
                  : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300"
              } ${consensus ? "" : "border border-dashed border-current opacity-70"}`}
            >
              {displayLabel(g)} <span className="text-zinc-500">{g.count}</span>
            </span>
          );
        })}
        {loggedIn && !editing && (
          <button
            type="button"
            onClick={openEditor}
            className="rounded-full border border-dashed border-zinc-300 px-2.5 py-0.5 text-xs text-zinc-500 hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
          >
            + {t("장르")}
          </button>
        )}
      </div>
      {editing && (
        <div className="rounded-lg border border-zinc-200 p-3 dark:border-zinc-800">
          <GenrePicker genres={genres} selected={mine} onToggle={toggle} busy={busy} />
          <button type="button" onClick={() => setEditing(false)} className="mt-2 text-xs text-zinc-500 hover:underline">
            {t("닫기")}
          </button>
        </div>
      )}
    </div>
  );
}
