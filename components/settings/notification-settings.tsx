"use client";

import { useState } from "react";
import type { NotificationPrefs } from "@/lib/api";
import { updateNotificationPrefs } from "@/app/actions/notifications";
import { useT } from "@/components/i18n-provider";

export function NotificationSettings({ initial }: { initial: NotificationPrefs }) {
  const t = useT();
  const [prefs, setPrefs] = useState(initial);

  const save = (next: NotificationPrefs) => {
    setPrefs(next);
    updateNotificationPrefs(next);
  };

  return (
    <div className="flex flex-col gap-6">
      <Row
        title={t("전체 알림")}
        desc={t("모든 알림을 받습니다. 끄면 아래 항목과 무관하게 알림이 오지 않습니다.")}
        on={prefs.master}
        onChange={(v) => save({ ...prefs, master: v })}
      />

      <div className="flex flex-col gap-5 border-t border-zinc-200 pt-6 dark:border-zinc-800">
        <Row
          title={t("팔로우 알림")}
          desc={t("다른 유저가 회원님을 팔로우할 때")}
          on={prefs.follow}
          disabled={!prefs.master}
          onChange={(v) => save({ ...prefs, follow: v })}
        />
        <Row
          title={t("리뷰 좋아요 알림")}
          desc={t("회원님의 리뷰에 좋아요가 달릴 때")}
          on={prefs.reviewLike}
          disabled={!prefs.master}
          onChange={(v) => save({ ...prefs, reviewLike: v })}
        />
      </div>
    </div>
  );
}

function Row({
  title,
  desc,
  on,
  disabled = false,
  onChange,
}: {
  title: string;
  desc: string;
  on: boolean;
  disabled?: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className={`flex items-center justify-between gap-4 ${disabled ? "opacity-50" : ""}`}>
      <div className="min-w-0">
        <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">{title}</p>
        <p className="text-xs text-zinc-500">{desc}</p>
      </div>
      <Toggle on={on} disabled={disabled} onChange={onChange} />
    </div>
  );
}

function Toggle({ on, disabled, onChange }: { on: boolean; disabled: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      disabled={disabled}
      onClick={() => onChange(!on)}
      className={`relative h-6 w-11 shrink-0 rounded-full transition-colors disabled:cursor-not-allowed ${
        on ? "bg-indigo-600" : "bg-zinc-300 dark:bg-zinc-700"
      }`}
    >
      <span
        className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${
          on ? "left-[22px]" : "left-0.5"
        }`}
      />
    </button>
  );
}
