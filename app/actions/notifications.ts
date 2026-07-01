"use server";

import { createClient } from "@/lib/supabase/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// 알림 전체 읽음 처리. (UI는 로컬로 안읽음 0 반영 → revalidate 불필요)
export async function markNotificationsRead(): Promise<{ ok: boolean }> {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) return { ok: false };

  try {
    const res = await fetch(`${API_URL}/me/notifications/read`, {
      method: "POST",
      headers: { Authorization: `Bearer ${session.access_token}` },
      cache: "no-store",
    });
    return { ok: res.ok };
  } catch {
    return { ok: false };
  }
}
