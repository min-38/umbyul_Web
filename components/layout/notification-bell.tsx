"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { NotificationItem } from "@/lib/api";
import {
  markNotificationsRead,
  clearNotifications,
  deleteNotification,
  loadNotifications,
} from "@/app/actions/notifications";
import { useClickOutside } from "@/lib/use-click-outside";
import { formatRelativeTime } from "@/lib/format";

const POLL_MS = 12000;

function label(n: NotificationItem) {
  return n.type === "follow" ? "회원님을 팔로우했습니다" : "회원님의 리뷰를 좋아합니다";
}

export function NotificationBell({ items, unreadCount }: { items: NotificationItem[]; unreadCount: number }) {
  const [open, setOpen] = useState(false);
  const [list, setList] = useState(items);
  const [unread, setUnread] = useState(unreadCount);
  const [toast, setToast] = useState<NotificationItem | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  const knownIds = useRef(new Set(items.map((i) => i.id)));
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const openRef = useRef(open);
  openRef.current = open;

  useClickOutside(ref, () => setOpen(false), open);

  // 폴링: 새 알림이 오면 즉시(≤12s) 목록·개수 반영 + 상단 토스트
  useEffect(() => {
    const poll = async () => {
      const data = await loadNotifications();
      setList(data.items);
      setUnread(openRef.current ? 0 : data.unreadCount);

      const fresh = data.items.filter((i) => !knownIds.current.has(i.id));
      data.items.forEach((i) => knownIds.current.add(i.id));
      if (fresh.length > 0 && !openRef.current) {
        setToast(fresh[0]);
        if (toastTimer.current) clearTimeout(toastTimer.current);
        toastTimer.current = setTimeout(() => setToast(null), 3000);
      }
    };
    const t = setInterval(poll, POLL_MS);
    return () => clearInterval(t);
  }, []);

  const toggle = () => {
    const next = !open;
    setOpen(next);
    if (next && unread > 0) {
      setUnread(0);
      markNotificationsRead();
    }
  };

  const clearAll = () => {
    setList([]);
    setUnread(0);
    clearNotifications();
  };

  const remove = (n: NotificationItem) => {
    setList((l) => l.filter((x) => x.id !== n.id));
    if (!n.read) setUnread((u) => Math.max(0, u - 1));
    deleteNotification(n.id);
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

      {/* 신규 알림 토스트 (상단 중앙, 3초) */}
      {toast && (
        <div className="fixed left-1/2 top-4 z-50 max-w-[90vw] -translate-x-1/2 rounded-full bg-zinc-900 px-4 py-2 text-sm text-white shadow-lg dark:bg-zinc-100 dark:text-black">
          <span className="font-semibold">{toast.actorUsername}</span>님이 {label(toast)}
        </div>
      )}

      {open && (
        <div className="absolute right-0 z-20 mt-1 flex w-80 flex-col overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-lg dark:border-zinc-800 dark:bg-zinc-950">
          <div className="max-h-80 overflow-y-auto py-1">
            {list.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-zinc-400">알림이 없습니다.</p>
            ) : (
              <ul>
                {list.map((n) => (
                  <NotifRow key={n.id} n={n} onClose={() => setOpen(false)} onDelete={remove} />
                ))}
              </ul>
            )}
          </div>

          <div className="flex items-center justify-between border-t border-zinc-200 px-3 py-2 dark:border-zinc-800">
            <Link
              href="/settings/notifications"
              onClick={() => setOpen(false)}
              className="text-xs text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
            >
              알림 설정
            </Link>
            <button
              type="button"
              onClick={clearAll}
              disabled={list.length === 0}
              className="text-xs text-zinc-500 hover:text-red-500 disabled:opacity-40"
            >
              모두 지우기
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function NotifRow({
  n,
  onClose,
  onDelete,
}: {
  n: NotificationItem;
  onClose: () => void;
  onDelete: (n: NotificationItem) => void;
}) {
  // 확인한(읽은) 알림은 흐리게, 안읽음은 강조 + 배경 하이라이트.
  const nameCls = n.read ? "text-zinc-400 dark:text-zinc-500" : "font-medium text-zinc-900 dark:text-zinc-50";
  const textCls = n.read ? "text-zinc-400 dark:text-zinc-500" : "text-zinc-700 dark:text-zinc-200";

  const inner = (
    <div className="flex items-center gap-2.5">
      <span className={`flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-zinc-200 text-xs font-medium text-zinc-500 dark:bg-zinc-800 dark:text-zinc-300 ${n.read ? "opacity-60" : ""}`}>
        {n.actorAvatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={n.actorAvatarUrl} alt="" className="h-full w-full object-cover" />
        ) : (
          n.actorUsername.charAt(0).toUpperCase()
        )}
      </span>
      <p className={`min-w-0 flex-1 text-sm ${textCls}`}>
        <span className={nameCls}>{n.actorUsername}</span>님이 {label(n)}
        <span className="ml-1 text-xs text-zinc-400">{formatRelativeTime(n.createdAt)}</span>
      </p>
    </div>
  );

  return (
    <li className={`flex items-center gap-1 pr-2 ${n.read ? "" : "bg-indigo-50/60 dark:bg-indigo-950/30"}`}>
      {n.link ? (
        <Link href={n.link} onClick={onClose} className="min-w-0 flex-1 px-3 py-2.5 hover:bg-black/[0.03] dark:hover:bg-white/[0.03]">
          {inner}
        </Link>
      ) : (
        <div className="min-w-0 flex-1 px-3 py-2.5">{inner}</div>
      )}
      <button
        type="button"
        aria-label="알림 삭제"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onDelete(n);
        }}
        className="flex h-6 w-6 shrink-0 items-center justify-center rounded text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <path d="M18 6 6 18M6 6l12 12" />
        </svg>
      </button>
    </li>
  );
}
