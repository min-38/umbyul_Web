"use server";

import { createClient } from "@/lib/supabase/server";
import type { Reaction } from "@/lib/api";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export type ReactionState = { likeCount: number; dislikeCount: number; myReaction: Reaction | null };

async function authedPost<T>(
  path: string,
  body: unknown,
): Promise<{ ok: boolean; code: string; data: T | null }> {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) return { ok: false, code: "UNAUTHORIZED", data: null };

  try {
    const res = await fetch(`${API_URL}${path}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${session.access_token}`, "Content-Type": "application/json" },
      body: JSON.stringify(body),
      cache: "no-store",
    });
    const json = await res.json().catch(() => null);
    return {
      ok: res.ok,
      code: (json?.code as string) ?? (res.ok ? "OK" : "UNKNOWN"),
      data: (json?.data as T) ?? null,
    };
  } catch {
    return { ok: false, code: "DB_UNAVAILABLE", data: null };
  }
}

// 좋아요/싫어요 토글. 갱신된 카운트+내 반응을 돌려줌(클라가 로컬 반영 → 상세 재조회 불필요).
export async function toggleReaction(input: { ratingId: string; value: Reaction }) {
  return authedPost<ReactionState>("/me/reactions", input);
}

export async function submitReport(input: {
  targetType: "rating" | "user";
  targetId: string;
  reason: string;
  detail: string | null;
}) {
  const r = await authedPost<null>("/me/reports", input);
  return { ok: r.ok, code: r.code };
}
