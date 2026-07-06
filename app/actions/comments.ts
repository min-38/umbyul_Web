"use server";

import { createClient } from "@/lib/supabase/server";
import type { ReviewComment } from "@/lib/api";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// 공개: 리뷰 댓글 목록(오래된 순). 비로그인도 열람.
export async function loadComments(ratingId: string): Promise<ReviewComment[]> {
  try {
    const res = await fetch(`${API_URL}/detail/comments/${ratingId}`, { cache: "no-store" });
    if (!res.ok) return [];
    const json = await res.json();
    return (json?.data?.items as ReviewComment[]) ?? [];
  } catch {
    return [];
  }
}

async function authed(method: string, path: string, body?: unknown) {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) return { ok: false, code: "UNAUTHORIZED", data: null as unknown };

  try {
    const res = await fetch(`${API_URL}${path}`, {
      method,
      headers: { Authorization: `Bearer ${session.access_token}`, "Content-Type": "application/json" },
      body: body === undefined ? undefined : JSON.stringify(body),
      cache: "no-store",
    });
    const json = await res.json().catch(() => null);
    return { ok: res.ok, code: (json?.code as string) ?? (res.ok ? "OK" : "UNKNOWN"), data: json?.data ?? null };
  } catch {
    return { ok: false, code: "DB_UNAVAILABLE", data: null as unknown };
  }
}

export async function addComment(input: { ratingId: string; body: string; parentId?: string | null }) {
  const r = await authed("POST", "/me/comments", input);
  return { ok: r.ok, code: r.code, comment: r.data as ReviewComment | null };
}

export async function toggleCommentLike(id: string) {
  const r = await authed("POST", `/me/comments/${id}/like`);
  return { ok: r.ok, code: r.code, data: r.data as { liked: boolean; likeCount: number } | null };
}

export async function deleteComment(id: string) {
  const r = await authed("DELETE", `/me/comments/${id}`);
  return { ok: r.ok, code: r.code };
}
