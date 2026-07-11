"use server";

import { createClient } from "@/lib/supabase/server";
import { apiFetch, type NotificationList } from "@/lib/api";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// 폴링용: 최신 알림 목록 + 안읽음 수.
// 성공 → NotificationList, 실패(순단·오프라인·5xx) → null. 폴러가 null이면 setState를 건너뛰어
// 뱃지·목록이 장애 5초 만에 조용히 사라지는 것을 막는다(NON-223). 비로그인은 빈 목록(실패 아님).
export async function loadNotifications(): Promise<NotificationList | null> {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) return { items: [], unreadCount: 0 };
  try {
    const res = await apiFetch(`${API_URL}/me/notifications`, {
      headers: { Authorization: `Bearer ${session.access_token}` },
      cache: "no-store",
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data as NotificationList;
  } catch {
    return null;
  }
}

// 개별 알림 삭제
export async function deleteNotification(id: string): Promise<{ ok: boolean }> {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) return { ok: false };
  try {
    const res = await apiFetch(`${API_URL}/me/notifications/${encodeURIComponent(id)}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${session.access_token}` },
      cache: "no-store",
    });
    return { ok: res.ok };
  } catch {
    return { ok: false };
  }
}

// 알림 전체 읽음 처리. (UI는 로컬로 안읽음 0 반영 → revalidate 불필요)
export async function markNotificationsRead(): Promise<{ ok: boolean }> {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) return { ok: false };

  try {
    const res = await apiFetch(`${API_URL}/me/notifications/read`, {
      method: "POST",
      headers: { Authorization: `Bearer ${session.access_token}` },
      cache: "no-store",
    });
    return { ok: res.ok };
  } catch {
    return { ok: false };
  }
}

// 알림 설정 저장
export async function updateNotificationPrefs(prefs: {
  master: boolean;
  follow: boolean;
  reviewLike: boolean;
  mention: boolean;
}): Promise<{ ok: boolean }> {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) return { ok: false };

  try {
    const res = await apiFetch(`${API_URL}/me/notification-prefs`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${session.access_token}`, "Content-Type": "application/json" },
      body: JSON.stringify(prefs),
      cache: "no-store",
    });
    return { ok: res.ok };
  } catch {
    return { ok: false };
  }
}

// 알림 전체 삭제
export async function clearNotifications(): Promise<{ ok: boolean }> {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) return { ok: false };

  try {
    const res = await apiFetch(`${API_URL}/me/notifications`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${session.access_token}` },
      cache: "no-store",
    });
    return { ok: res.ok };
  } catch {
    return { ok: false };
  }
}
