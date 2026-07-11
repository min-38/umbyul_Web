"use client";
import { onImageError } from "@/lib/image";

import { useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "@/app/auth/actions";
import { useClickOutside } from "@/lib/use-click-outside";
import { useConfirm } from "@/components/ui/confirm-dialog";
import { useT } from "@/components/i18n-provider";

// 포인트·업적은 출시 보류(게이미피케이션 미도입) — 메뉴에서 숨김 (NON-129).
const STATIC_ITEMS = [{ label: "설정", href: "/settings" }];

export function UserMenu({ username, avatarUrl }: { username: string; avatarUrl: string | null }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const ref = useRef<HTMLDivElement>(null);
  const t = useT();
  const confirm = useConfirm();
  useClickOutside(ref, () => setOpen(false), open);
  const items = [{ label: "프로필", href: `/u/${username}` }, ...STATIC_ITEMS];

  const onSignOut = async () => {
    if (!(await confirm({ message: t("로그아웃 하시겠어요?") }))) return;
    await signOut(pathname);
  };

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
            <img onError={onImageError} src={avatarUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            username.charAt(0).toUpperCase()
          )}
        </span>
        <span className="hidden max-w-[10rem] truncate text-sm text-zinc-700 dark:text-zinc-200 sm:inline">{username}</span>
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
              {t(it.label)}
            </Link>
          ))}
          <div className="my-1 border-t border-zinc-200 dark:border-zinc-800" />
          <button
            type="button"
            onClick={onSignOut}
            className="block w-full px-3 py-1.5 text-left text-sm font-medium text-rose-600 hover:bg-rose-50 dark:text-rose-500 dark:hover:bg-rose-950/40"
          >
            {t("로그아웃")}
          </button>
        </div>
      )}
    </div>
  );
}
