"use server";

import { createClient } from "@/lib/supabase/server";
import { safeHttpUrl } from "@/lib/validation";
import type { TrackResult, DjSetComment, DjSetSummary } from "@/lib/api";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// 곡 검색(공개) — 클라이언트가 lib/api(서버전용 의존)를 직접 못 부르므로 액션으로 프록시.
export async function searchTracks(q: string): Promise<TrackResult[]> {
  if (q.trim().length < 2) return [];
  try {
    const res = await fetch(`${API_URL}/search?q=${encodeURIComponent(q)}`, { cache: "no-store" });
    if (!res.ok) return [];
    const json = await res.json();
    return (json?.data?.tracks?.items as TrackResult[]) ?? [];
  } catch {
    return [];
  }
}

async function authed<T>(method: string, path: string, body?: unknown): Promise<{ ok: boolean; code: string; data: T | null }> {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) return { ok: false, code: "UNAUTHORIZED", data: null };
  try {
    const res = await fetch(`${API_URL}${path}`, {
      method,
      headers: { Authorization: `Bearer ${session.access_token}`, "Content-Type": "application/json" },
      body: body === undefined ? undefined : JSON.stringify(body),
      cache: "no-store",
    });
    const json = await res.json().catch(() => null);
    return { ok: res.ok, code: (json?.code as string) ?? (res.ok ? "OK" : "UNKNOWN"), data: (json?.data as T) ?? null };
  } catch {
    return { ok: false, code: "DB_UNAVAILABLE", data: null };
  }
}

export async function createSet(input: { title: string; note: string | null; listenUrl: string | null }) {
  // listenUrl은 http(s)만 허용 — 크래프트된 호출로 javascript: 등이 저장되는 것 차단(SEC-W-1)
  if (input.listenUrl && !safeHttpUrl(input.listenUrl)) return { ok: false, code: "INVALID_URL", id: null };
  const r = await authed<{ id: string }>("POST", "/me/sets", input);
  return { ok: r.ok, code: r.code, id: r.data?.id ?? null };
}

export async function updateSet(setId: string, input: { title: string; note: string | null; listenUrl: string | null }) {
  if (input.listenUrl && !safeHttpUrl(input.listenUrl)) return { ok: false, code: "INVALID_URL" };
  const r = await authed("POST", `/me/sets/${setId}/edit`, input);
  return { ok: r.ok, code: r.code };
}

// 믹스 목록 — 검색(q)·정렬(sort)·페이지네이션(offset). 공개. 실패 시 빈 목록.
export async function loadMixes(q: string, sort: string, offset: number): Promise<DjSetSummary[]> {
  try {
    const params = new URLSearchParams({ sort, offset: String(offset), limit: "30" });
    if (q.trim()) params.set("q", q.trim());
    const res = await fetch(`${API_URL}/sets?${params}`, { cache: "no-store" });
    if (!res.ok) return [];
    const json = await res.json();
    return (json?.data?.items as DjSetSummary[]) ?? [];
  } catch {
    return [];
  }
}

export async function deleteSet(id: string) {
  const r = await authed("DELETE", `/me/sets/${id}`);
  return { ok: r.ok, code: r.code };
}

export async function addSetTrack(
  setId: string,
  track: {
    spotifyId: string;
    isrc: string | null;
    name: string;
    artist: string;
    artists: { id: string; name: string }[];
    albumId: string | null;
    albumName: string | null;
    imageUrl: string | null;
    youtubeUrl: string | null;
    explicit: boolean;
  },
) {
  const r = await authed("POST", `/me/sets/${setId}/tracks`, track);
  return { ok: r.ok, code: r.code };
}

// 트랙 순서 변경 — 전체 spotifyId 순서 전달.
export async function reorderSetTracks(setId: string, spotifyIds: string[]) {
  const r = await authed("POST", `/me/sets/${setId}/order`, { spotifyIds });
  return { ok: r.ok, code: r.code };
}

// 믹스 좋아요 토글. { liked, likeCount } 반환.
export async function toggleSetLike(setId: string) {
  const r = await authed<{ liked: boolean; likeCount: number }>("POST", `/me/sets/${setId}/like`);
  return { ok: r.ok, code: r.code, data: r.data };
}

// 트랙 교체(수정) — 노래 변경/유튜브 링크 변경. position 유지.
export async function replaceSetTrack(
  setId: string,
  oldSpotifyId: string,
  track: {
    spotifyId: string;
    isrc: string | null;
    name: string;
    artist: string;
    artists: { id: string; name: string }[];
    albumId: string | null;
    albumName: string | null;
    imageUrl: string | null;
    youtubeUrl: string | null;
    explicit: boolean;
  },
) {
  const r = await authed("POST", `/me/sets/${setId}/tracks/${encodeURIComponent(oldSpotifyId)}/replace`, track);
  return { ok: r.ok, code: r.code };
}

// ── 믹스 댓글 ──
export async function loadSetComments(setId: string): Promise<DjSetComment[]> {
  try {
    const res = await fetch(`${API_URL}/sets/${encodeURIComponent(setId)}/comments`, { cache: "no-store" });
    if (!res.ok) return [];
    const json = await res.json();
    return (json?.data?.items as DjSetComment[]) ?? [];
  } catch {
    return [];
  }
}

export async function addSetComment(setId: string, body: string) {
  const r = await authed<DjSetComment>("POST", `/me/sets/${setId}/comments`, { body });
  return { ok: r.ok, code: r.code, comment: r.data };
}

export async function deleteSetComment(setId: string, commentId: string) {
  const r = await authed("DELETE", `/me/sets/${setId}/comments/${commentId}`);
  return { ok: r.ok, code: r.code };
}

export async function editSetComment(setId: string, commentId: string, body: string) {
  const r = await authed("POST", `/me/sets/${setId}/comments/${commentId}/edit`, { body });
  return { ok: r.ok, code: r.code };
}

// 트랙의 유튜브 링크 설정/제거(빈 문자열이면 제거).
export async function updateTrackYoutube(setId: string, spotifyId: string, youtubeUrl: string | null) {
  const r = await authed("POST", `/me/sets/${setId}/tracks/${encodeURIComponent(spotifyId)}/link`, { youtubeUrl });
  return { ok: r.ok, code: r.code };
}

export async function removeSetTrack(setId: string, spotifyId: string) {
  const r = await authed("DELETE", `/me/sets/${setId}/tracks/${encodeURIComponent(spotifyId)}`);
  return { ok: r.ok, code: r.code };
}
