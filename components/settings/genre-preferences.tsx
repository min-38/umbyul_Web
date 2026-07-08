"use client";

import { useState } from "react";
import type { Genre } from "@/lib/api";
import { GenrePicker } from "@/components/detail/genre-picker";
import { updateGenrePreferences } from "@/app/actions/account";
import { useT } from "@/components/i18n-provider";

// 선호 장르 설정(NON-150). 칩 토글 시 즉시 저장(세트 전체 교체). 추천(NON-155) 신호로 쓰임.
export function GenrePreferences({ genres, initial }: { genres: Genre[]; initial: number[] }) {
  const t = useT();
  const [selected, setSelected] = useState<Set<number>>(new Set(initial));
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);

  const toggle = async (id: number) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelected(next);
    setSaved(false);
    setBusy(true); // 저장 중엔 칩 비활성(연속 토글 경합 방지)
    const r = await updateGenrePreferences([...next]);
    setBusy(false);
    if (r.ok) setSaved(true);
  };

  return (
    <section className="flex flex-col gap-3">
      <div>
        <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">{t("선호 장르")}</h2>
        <p className="text-xs text-zinc-500">{t("추천에 반영돼요. 언제든 바꿀 수 있어요.")}</p>
      </div>
      <GenrePicker genres={genres} selected={selected} onToggle={toggle} busy={busy} />
      {saved && <p className="text-xs text-green-600 dark:text-green-400">{t("저장됐어요")}</p>}
    </section>
  );
}
