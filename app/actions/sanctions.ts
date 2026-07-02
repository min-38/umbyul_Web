"use server";

import { createClient } from "@/lib/supabase/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// 미확인 경고 전체 확인 처리(NON-57).
export async function acknowledgeWarnings(): Promise<{ ok: boolean }> {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) return { ok: false };
  try {
    const res = await fetch(`${API_URL}/me/warnings/ack`, {
      method: "POST",
      headers: { Authorization: `Bearer ${session.access_token}` },
      cache: "no-store",
    });
    return { ok: res.ok };
  } catch {
    return { ok: false };
  }
}
