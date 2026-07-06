"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";

// 약관/개인정보 글 자체의 언어 선택(UI 로케일과 별개). ?lang= 로 문서 언어만 바꾼다.
const LANGS = [
  { v: "en", flag: "🇺🇸", label: "English" },
  { v: "ko", flag: "🇰🇷", label: "한국어" },
  { v: "ja", flag: "🇯🇵", label: "日本語" },
  { v: "es", flag: "🇪🇸", label: "Español" },
] as const;

export function LegalLangSelect({ current }: { current: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();

  const onChange = (v: string) => {
    const p = new URLSearchParams(sp.toString());
    p.set("lang", v);
    router.push(`${pathname}?${p.toString()}`);
  };

  return (
    <select
      value={current}
      onChange={(e) => onChange(e.target.value)}
      aria-label="Document language"
      className="rounded-lg border border-zinc-300 bg-white px-2 py-1 text-sm text-zinc-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200"
    >
      {LANGS.map((l) => (
        <option key={l.v} value={l.v}>
          {l.flag} {l.label}
        </option>
      ))}
    </select>
  );
}
