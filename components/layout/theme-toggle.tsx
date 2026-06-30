"use client";

import { useEffect, useRef, useState } from "react";
import { useClickOutside } from "@/lib/use-click-outside";

type Theme = "light" | "dark" | "system";

const LABELS: Record<Theme, string> = { light: "라이트", dark: "다크", system: "시스템" };

function resolveDark(t: Theme) {
  return t === "dark" || (t === "system" && matchMedia("(prefers-color-scheme: dark)").matches);
}

function apply(t: Theme) {
  document.documentElement.classList.toggle("dark", resolveDark(t));
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("system");
  const [isDark, setIsDark] = useState(false);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useClickOutside(ref, () => setOpen(false), open);

  useEffect(() => {
    const stored = ((localStorage.getItem("theme") as Theme) || "system");
    setTheme(stored);
    setIsDark(resolveDark(stored));
  }, []);

  // 시스템 모드일 때 OS 변경 반영
  useEffect(() => {
    if (theme !== "system") return;
    const mq = matchMedia("(prefers-color-scheme: dark)");
    const handler = () => {
      apply("system");
      setIsDark(resolveDark("system"));
    };
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [theme]);

  const choose = (t: Theme) => {
    localStorage.setItem("theme", t);
    setTheme(t);
    apply(t);
    setIsDark(resolveDark(t));
    setOpen(false);
  };

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label="테마"
        className="flex h-9 w-9 items-center justify-center rounded-lg text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-900"
      >
        {isDark ? (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
          </svg>
        ) : (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
          </svg>
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-20 mt-1 w-28 overflow-hidden rounded-lg border border-zinc-200 bg-white py-1 shadow-lg dark:border-zinc-800 dark:bg-zinc-950">
          {(["light", "dark", "system"] as Theme[]).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => choose(t)}
              className={`block w-full px-3 py-1.5 text-left text-sm hover:bg-zinc-100 dark:hover:bg-zinc-900 ${
                theme === t ? "font-medium text-indigo-600 dark:text-indigo-400" : "text-zinc-700 dark:text-zinc-300"
              }`}
            >
              {LABELS[t]}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
