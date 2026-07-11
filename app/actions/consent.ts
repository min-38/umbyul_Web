"use server";

import { createClient } from "@/lib/supabase/server";
import { apiFetch } from "@/lib/api";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// 재동의 기록(LEG-2/5, NON-148). 서버가 현재 게시 버전으로 기록 — 클라는 타입만 전달.
export async function submitConsent(types: ("terms" | "privacy")[]) {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) return { ok: false };
  try {
    const res = await apiFetch(`${API_URL}/me/consent`, {
      method: "POST",
      headers: { Authorization: `Bearer ${session.access_token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ types }),
      cache: "no-store",
    });
    return { ok: res.ok };
  } catch {
    return { ok: false };
  }
}
