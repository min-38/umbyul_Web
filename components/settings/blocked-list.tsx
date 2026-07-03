"use client";

import { useState } from "react";
import Link from "next/link";
import { unblockUser } from "@/app/actions/social";
import { useT } from "@/components/i18n-provider";
import type { BlockedUser } from "@/lib/api";

// 설정 · 차단 관리(NON-119). 내가 차단한 유저 목록 + 개별 해제(성공 시 목록에서 제거).
export function BlockedList({ initial }: { initial: BlockedUser[] }) {
  const t = useT();
  const [list, setList] = useState(initial);
  const [busy, setBusy] = useState<string | null>(null);

  const unblock = async (username: string) => {
    setBusy(username);
    const r = await unblockUser(username);
    setBusy(null);
    if (r.ok) setList((l) => l.filter((u) => u.username !== username));
  };

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">{t("차단 관리")}</h2>
        <p className="mt-0.5 text-sm text-zinc-500">{t("차단한 유저는 서로의 리뷰·프로필이 보이지 않습니다.")}</p>
      </div>

      {list.length === 0 ? (
        <p className="rounded-xl border border-dashed border-zinc-300 px-6 py-12 text-center text-sm text-zinc-500 dark:border-zinc-700">
          {t("차단한 유저가 없습니다.")}
        </p>
      ) : (
        <ul className="flex flex-col divide-y divide-zinc-200 dark:divide-zinc-800">
          {list.map((u) => (
            <li key={u.username} className="flex items-center gap-3 py-3">
              <Link href={`/u/${u.username}`} className="shrink-0">
                <span className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-zinc-200 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                  {u.avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={u.avatarUrl} alt="" className="h-full w-full object-cover" />
                  ) : (
                    u.username.charAt(0).toUpperCase()
                  )}
                </span>
              </Link>
              <Link
                href={`/u/${u.username}`}
                className="min-w-0 flex-1 truncate text-sm font-medium text-zinc-900 hover:underline dark:text-zinc-50"
              >
                {u.username}
              </Link>
              <button
                type="button"
                onClick={() => unblock(u.username)}
                disabled={busy === u.username}
                className="shrink-0 rounded-lg border border-zinc-300 px-3 py-1.5 text-sm font-medium text-zinc-700 hover:bg-zinc-100 disabled:opacity-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
              >
                {t("차단 해제")}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
