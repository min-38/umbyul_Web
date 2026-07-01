"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import type { NotificationItem } from "@/lib/api";
import { markNotificationsRead } from "@/app/actions/notifications";
import { useClickOutside } from "@/lib/use-click-outside";
import { formatRelativeTime } from "@/lib/format";

export function NotificationBell({ items, unreadCount }: { items: NotificationItem[]; unreadCount: number }) {
  const [open, setOpen] = useState(false);
  const [unread, setUnread] = useState(unreadCount);
  const ref = useRef<HTMLDivElement>(null);
  useClickOutside(ref, () => setOpen(false), open);

  const toggle = () => {
    const next = !open;
    setOpen(next);
    if (next && unread > 0) {
      setUnread(0);
      markNotificationsRead();
    }
  };

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={toggle}
        aria-label="알림"
        className="relative flex h-9 w-9 items-center justify-center rounded-lg text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-900"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" aria-hidden="true">
          <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.7 21a2 2 0 0 1-3.4 0" />
        </svg>
        {unread > 0 && (
          <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-medium text-white">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-20 mt-1 max-h-96 w-80 overflow-y-auto rounded-lg border border-zinc-200 bg-white py-1 shadow-lg dark:border-zinc-800 dark:bg-zinc-950">
          {items.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-zinc-400">알림이 없습니다.</p>
          ) : (
            <ul>
              {items.map((n) => (
                <NotifRow key={n.id} n={n} onClose={() => setOpen(false)} />
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

function NotifRow({ n, onClose }: { n: NotificationItem; onClose: () => void }) {
  const text =
    n.type === "follow"
      ? "회원님을 팔로우했습니다"
      : "회원님의 리뷰를 좋아합니다";

  const body = (
    <div className={`flex items-center gap-2.5 px-3 py-2.5 ${n.read ? "" : "bg-indigo-50/60 dark:bg-indigo-950/30"}`}>
      <span className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-zinc-200 text-xs font-medium text-zinc-500 dark:bg-zinc-800 dark:text-zinc-300">
        {n.actorAvatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={n.actorAvatarUrl} alt="" className="h-full w-full object-cover" />
        ) : (
          n.actorUsername.charAt(0).toUpperCase()
        )}
      </span>
      <p className="min-w-0 flex-1 text-sm text-zinc-700 dark:text-zinc-200">
        <span className="font-medium text-zinc-900 dark:text-zinc-50">{n.actorUsername}</span>님이 {text}
        <span className="ml-1 text-xs text-zinc-400">{formatRelativeTime(n.createdAt)}</span>
      </p>
    </div>
  );

  return (
    <li>
      {n.link ? (
        <Link href={n.link} onClick={onClose} className="block hover:bg-zinc-50 dark:hover:bg-zinc-900">
          {body}
        </Link>
      ) : (
        body
      )}
    </li>
  );
}
