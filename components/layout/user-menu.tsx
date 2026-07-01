"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "@/app/auth/actions";
import { useClickOutside } from "@/lib/use-click-outside";

// 미구현 대상은 플레이스홀더(#) — 각 기능 이슈에서 연결
const STATIC_ITEMS = [
  { label: "포인트 내역", href: "#" },
  { label: "업적", href: "#" },
  { label: "설정", href: "/settings" },
];

export function UserMenu({ username, avatarUrl }: { username: string; avatarUrl: string | null }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const ref = useRef<HTMLDivElement>(null);
  useClickOutside(ref, () => setOpen(false), open);
  const items = [{ label: "프로필", href: `/u/${username}` }, ...STATIC_ITEMS];

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 rounded-lg py-1 pl-1 pr-2 hover:bg-zinc-100 dark:hover:bg-zinc-900"
      >
        <span className="flex h-7 w-7 items-center justify-center overflow-hidden rounded-full bg-zinc-200 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
          {avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            username.charAt(0).toUpperCase()
          )}
        </span>
        <span className="max-w-[10rem] truncate text-sm text-zinc-700 dark:text-zinc-200">{username}</span>
      </button>

      {open && (
        <div className="absolute right-0 z-20 mt-1 w-44 overflow-hidden rounded-lg border border-zinc-200 bg-white py-1 shadow-lg dark:border-zinc-800 dark:bg-zinc-950">
          {items.map((it) => (
            <Link
              key={it.label}
              href={it.href}
              onClick={() => setOpen(false)}
              className="block px-3 py-1.5 text-sm text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-900"
            >
              {it.label}
            </Link>
          ))}
          <div className="my-1 border-t border-zinc-200 dark:border-zinc-800" />
          <form action={signOut.bind(null, pathname)}>
            <button
              type="submit"
              className="block w-full px-3 py-1.5 text-left text-sm text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-900"
            >
              로그아웃
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
