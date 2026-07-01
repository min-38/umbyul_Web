"use client";

import { useState } from "react";
import { AccountSettings } from "./account-settings";

type Tab = "account" | "notifications" | "display" | "integrations";

const TABS: { key: Tab; label: string }[] = [
  { key: "account", label: "Account" },
  { key: "notifications", label: "Notifications" },
  { key: "display", label: "Display" },
  { key: "integrations", label: "Integrations" },
];

export function SettingsView({
  username,
  avatarUrl,
  hasPassword,
  joinedAt,
  providers,
  initialTab,
}: {
  username: string;
  avatarUrl: string | null;
  hasPassword: boolean;
  joinedAt: string;
  providers: string[];
  initialTab?: string;
}) {
  const [tab, setTab] = useState<Tab>(
    TABS.some((t) => t.key === initialTab) ? (initialTab as Tab) : "account",
  );

  return (
    <div className="flex flex-col gap-6 sm:flex-row sm:gap-10">
      <nav className="flex shrink-0 gap-1 overflow-x-auto border-b border-zinc-200 sm:w-44 sm:flex-col sm:gap-0.5 sm:border-b-0 dark:border-zinc-800">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={`whitespace-nowrap rounded-lg px-3 py-2 text-left text-sm font-medium ${
              tab === t.key
                ? "bg-zinc-100 text-zinc-900 dark:bg-zinc-900 dark:text-zinc-50"
                : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
            }`}
          >
            {t.label}
          </button>
        ))}
      </nav>

      <div className="min-w-0 flex-1">
        {tab === "account" ? (
          <AccountSettings
            initialUsername={username}
            initialAvatarUrl={avatarUrl}
            hasPassword={hasPassword}
            joinedAt={joinedAt}
            providers={providers}
          />
        ) : (
          <p className="text-sm text-zinc-400">준비 중입니다.</p>
        )}
      </div>
    </div>
  );
}
