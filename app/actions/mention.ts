"use server";

import { createClient } from "@/lib/supabase/server";
import { apiFetch } from "@/lib/api";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export type UserHit = { id: string; username: string; avatarUrl: string | null };

// @자동완성용 유저 접두 검색(공개). 실패 시 빈 목록.
export async function searchUsers(q: string): Promise<UserHit[]> {
  if (!q.trim()) return [];
  try {
    const res = await apiFetch(`${API_URL}/users/search?q=${encodeURIComponent(q)}`, { cache: "no-store" });
    if (!res.ok) return [];
    const json = await res.json();
    return (json?.data?.items as UserHit[]) ?? [];
  } catch {
    return [];
  }
}

async function authed(method: string, path: string, body?: unknown) {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) return { ok: false, muted: false };
  try {
    const res = await apiFetch(`${API_URL}${path}`, {
      method,
      headers: { Authorization: `Bearer ${session.access_token}`, "Content-Type": "application/json" },
      body: body === undefined ? undefined : JSON.stringify(body),
      cache: "no-store",
    });
    const json = await res.json().catch(() => null);
    return { ok: res.ok, muted: Boolean(json?.data?.muted) };
  } catch {
    return { ok: false, muted: false };
  }
}

// 이 트랙/앨범 멘션 뮤트 여부.
export async function getMentionMute(targetType: "track" | "album", spotifyId: string) {
  const r = await authed("GET", `/me/mention-mute?type=${targetType}&id=${encodeURIComponent(spotifyId)}`);
  return r.muted;
}

// 뮤트 토글. 갱신된 상태 반환.
export async function toggleMentionMute(targetType: "track" | "album", spotifyId: string) {
  return authed("POST", "/me/mention-mute", { targetType, spotifyId });
}
