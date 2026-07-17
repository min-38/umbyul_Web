"use client";

import { useState } from "react";

// Chart 2단(음악·유저)을 감싸 모바일(<md)에선 토글로 하나만 표시, md+는 기존 2단 유지(NON-82).
// 양 섹션은 서버에서 이미 렌더됨(데이터 재조회 없음) — 여기선 표시만 전환.
export function ChartColumns({
  music,
  user,
  musicLabel,
  userLabel,
}: {
  music: React.ReactNode;
  user: React.ReactNode;
  musicLabel: string;
  userLabel: string;
}) {
  const [col, setCol] = useState<"music" | "user">("music");

  const tab = (key: "music" | "user", label: string) => (
    <button
      type="button"
      onClick={() => setCol(key)}
      aria-pressed={col === key}
      className={`flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition ${
        col === key
          ? "bg-white text-zinc-900 shadow-sm dark:bg-zinc-700 dark:text-zinc-50"
          : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
      }`}
    >
      {label}
    </button>
  );

  return (
    <>
      {/* 모바일 전용 토글 — md+는 2단이라 숨김 */}
      <div className="flex gap-1 rounded-lg bg-zinc-100 p-0.5 dark:bg-zinc-900 md:hidden">
        {tab("music", musicLabel)}
        {tab("user", userLabel)}
      </div>
      <div className="grid gap-8 md:grid-cols-2">
        <div className={`min-w-0 ${col === "music" ? "" : "hidden md:block"}`}>{music}</div>
        <div className={`min-w-0 ${col === "user" ? "" : "hidden md:block"}`}>{user}</div>
      </div>
    </>
  );
}
