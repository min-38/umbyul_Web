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
import { useT, useLocale } from "@/components/i18n-provider";

const POLL_MS = 5000;

// 이름(span) 뒤에 붙는 문구. ko: "{이름}님이 …", en: "{name} …" 로 자연스럽게.
function suffix(n: NotificationItem) {
  if (n.type === "follow") return "님이 회원님을 팔로우했습니다";
  if (n.type === "mention") return "님이 댓글에서 회원님을 언급했습니다";
  return "님이 회원님의 리뷰를 좋아합니다";
}

export function NotificationBell({ items, unreadCount }: { items: NotificationItem[]; unreadCount: number }) {
  const t = useT();
  const [open, setOpen] = useState(false);
  const [list, setList] = useState(items);
  const [unread, setUnread] = useState(unreadCount);
  const [toast, setToast] = useState<NotificationItem | null>(null);
  const [toastShown, setToastShown] = useState(false); // opacity (페이드)
  const ref = useRef<HTMLDivElement>(null);
  const knownIds = useRef(new Set(items.map((i) => i.id)));
  const toastTimers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const openRef = useRef(open);
  openRef.current = open;

  useClickOutside(ref, () => setOpen(false), open);

  const clearToastTimers = () => {
    toastTimers.current.forEach(clearTimeout);
    toastTimers.current = [];
  };

  const showToast = (n: NotificationItem) => {
    clearToastTimers();
    setToast(n);
    setToastShown(false);
    toastTimers.current.push(setTimeout(() => setToastShown(true), 20)); // 페이드 인
    toastTimers.current.push(setTimeout(() => setToastShown(false), 3000)); // 페이드 아웃 시작
    toastTimers.current.push(setTimeout(() => setToast(null), 3300)); // 트랜지션 후 제거
  };

  const dismissToast = () => {
    clearToastTimers();
    setToastShown(false);
    toastTimers.current.push(setTimeout(() => setToast(null), 300));
  };

  // 폴링: 새 알림이 오면 빠르게 반영 + 상단 토스트. 탭 숨김 시 정지, 복귀 시 즉시 조회.
  useEffect(() => {
    const poll = async () => {
      if (document.hidden) return;
      const data = await loadNotifications();
      setList(data.items);
      setUnread(openRef.current ? 0 : data.unreadCount);

      const fresh = data.items.filter((i) => !knownIds.current.has(i.id));
      data.items.forEach((i) => knownIds.current.add(i.id));
      if (fresh.length > 0 && !openRef.current) showToast(fresh[0]);
    };

    const t = setInterval(poll, POLL_MS);
    const onVisible = () => {
      if (!document.hidden) poll();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      clearInterval(t);
      document.removeEventListener("visibilitychange", onVisible);
      clearToastTimers();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggle = () => {
    const next = !open;
    setOpen(next);
    if (next && unread > 0) {
      setUnread(0);
      setList((l) => l.map((x) => (x.read ? x : { ...x, read: true }))); // 로컬도 즉시 읽음 처리 — 재오픈 시 unread 스타일 잔상 방지(LOG-W-6)
      markNotificationsRead();
    }
  };

  const clearAll = () => {
    if (!window.confirm(t("알림을 모두 지울까요?"))) return; // 전체 삭제는 확인 후(UX-3)
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
        aria-label={t("알림")}
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

      {/* 신규 알림 토스트 (상단 중앙, 페이드, 3초, x로 즉시 닫기) */}
      {toast && (
        <div
          className={`fixed left-1/2 top-4 z-50 flex max-w-[90vw] -translate-x-1/2 items-center gap-3 rounded-full bg-zinc-900 py-2 pl-4 pr-2 text-sm text-white shadow-lg transition-opacity duration-300 dark:bg-zinc-100 dark:text-black ${
            toastShown ? "opacity-100" : "opacity-0"
          }`}
        >
          <span className="truncate">
            {toast.type === "warning" ? (
              <>
                <span className="font-semibold">{t("경고를 받았습니다.")}</span>
                {toast.detail ? ` ${toast.detail}` : ""}
              </>
            ) : (
              <>
                <span className="font-semibold">{toast.actorUsername}</span>{t(suffix(toast))}
              </>
            )}
          </span>
          <button
            type="button"
            aria-label={t("닫기")}
            onClick={dismissToast}
            className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full hover:bg-white/20 dark:hover:bg-black/10"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {open && (
        <div className="absolute right-0 z-20 mt-1 flex w-80 flex-col overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-lg dark:border-zinc-800 dark:bg-zinc-950">
          <div className="max-h-80 overflow-y-auto py-1">
            {list.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-zinc-400">{t("알림이 없습니다.")}</p>
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
              {t("알림 설정")}
            </Link>
            <button
              type="button"
              onClick={clearAll}
              disabled={list.length === 0}
              className="text-xs text-zinc-500 hover:text-red-500 disabled:opacity-40"
            >
              {t("모두 지우기")}
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
  const t = useT();
  const locale = useLocale();
  // 확인한(읽은) 알림은 흐리게, 안읽음은 강조 + 배경 하이라이트.
  const nameCls = n.read ? "text-zinc-400 dark:text-zinc-500" : "font-medium text-zinc-900 dark:text-zinc-50";
  const textCls = n.read ? "text-zinc-400 dark:text-zinc-500" : "text-zinc-700 dark:text-zinc-200";

  const isWarning = n.type === "warning";
  const inner = (
    <div className="flex items-center gap-2.5">
      {isWarning ? (
        <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-100 text-sm text-amber-700 dark:bg-amber-950 dark:text-amber-300 ${n.read ? "opacity-60" : ""}`}>
          ⚠
        </span>
      ) : (
        <span className={`flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-zinc-200 text-xs font-medium text-zinc-500 dark:bg-zinc-800 dark:text-zinc-300 ${n.read ? "opacity-60" : ""}`}>
          {n.actorAvatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={n.actorAvatarUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            n.actorUsername.charAt(0).toUpperCase()
          )}
        </span>
      )}
      <p className={`min-w-0 flex-1 text-sm ${textCls}`}>
        {isWarning ? (
          <>
            <span className={nameCls}>{t("경고를 받았습니다.")}</span>
            <span className="ml-1 text-xs text-zinc-400">{formatRelativeTime(n.createdAt, locale)}</span>
            {n.detail ? <span className="mt-0.5 block">{t("사유")}: {n.detail}</span> : null}
          </>
        ) : (
          <>
            <span className={nameCls}>{n.actorUsername}</span>{t(suffix(n))}
            <span className="ml-1 text-xs text-zinc-400">{formatRelativeTime(n.createdAt, locale)}</span>
          </>
        )}
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
        aria-label={t("알림 삭제")}
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
