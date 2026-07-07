"use client";

import { Fragment } from "react";
import type { Genre } from "@/lib/api";

// 아코디언 장르 선택(NON-122). 부모 리스트는 항상 보이고(가로 흐름), 부모를 누르면
//  (1) 부모가 선택(투표)되고 (2) 그 자리에서 서브장르가 인라인으로 펼쳐진다(열고 접기).
//  서브는 부모와 배경을 달리해 눈으로 구분. 화면 전환 없음. 서브 복수 선택. 장르명 영어 단일(name).
export function GenrePicker({
  genres,
  selected,
  onToggle,
  busy = false,
}: {
  genres: Genre[];
  selected: Set<number>;
  onToggle: (id: number) => void;
  busy?: boolean;
}) {
  const topGenres = genres.filter((g) => g.parentId === null);
  const childrenOf = (pid: number) => genres.filter((g) => g.parentId === pid);

  const base = "rounded-full px-3 py-1 text-xs font-medium transition disabled:opacity-50";

  // 열린 부모: 솔리드 인디고(강조).
  const parentOpenChip = (g: Genre) => (
    <button
      key={g.id}
      type="button"
      onClick={() => onToggle(g.id)}
      disabled={busy}
      className={`${base} bg-indigo-600 text-white hover:bg-indigo-500`}
    >
      {g.name}
    </button>
  );

  // 서브장르: 부모와 구분되게 가라앉은 배경 + 테두리(미선택), 선택 시 연한 인디고.
  const subChip = (g: Genre, active: boolean) => (
    <button
      key={g.id}
      type="button"
      onClick={() => onToggle(g.id)}
      disabled={busy}
      className={`${base} ${
        active
          ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300"
          : "bg-zinc-50 text-zinc-500 ring-1 ring-inset ring-zinc-200 hover:bg-zinc-100 dark:bg-zinc-900 dark:text-zinc-400 dark:ring-zinc-700 dark:hover:bg-zinc-800"
      }`}
    >
      {g.name}
    </button>
  );

  return (
    <div className="flex max-h-72 flex-wrap items-center gap-1.5 overflow-y-auto pr-1">
      {topGenres.map((parent) => {
        const open = selected.has(parent.id); // 선택 = 펼침
        return (
          <Fragment key={parent.id}>
            {open ? (
              parentOpenChip(parent)
            ) : (
              <button
                type="button"
                onClick={() => onToggle(parent.id)}
                disabled={busy}
                className={`${base} flex items-center gap-1 bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700`}
              >
                {parent.name} <span className="text-zinc-500">›</span>
              </button>
            )}
            {open && childrenOf(parent.id).map((k) => subChip(k, selected.has(k.id)))}
          </Fragment>
        );
      })}
    </div>
  );
}
