"use server";

import { createClient } from "@/lib/supabase/server";
import type { Reaction, FeedSort, FeedScope } from "@/lib/api";
import { getFollowers, getFollowing, getFeed } from "@/lib/api";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export type ReactionState = { likeCount: number; dislikeCount: number; myReaction: Reaction | null };

async function authedRequest<T>(
  method: string,
  path: string,
  body?: unknown,
): Promise<{ ok: boolean; code: string; data: T | null }> {
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
  return authedRequest<ReactionState>("POST", "/me/reactions", input);
}

// "관심 없음" — 이 리뷰를 내 피드에서 숨김(NON-114). 성공 시 클라가 카드 제거.
export async function dismissReview(ratingId: string) {
  const r = await authedRequest<null>("POST", "/me/feed/dismiss", { ratingId });
  return { ok: r.ok, code: r.code };
}

export async function submitReport(input: {
  targetType: "rating" | "user" | "comment" | "set_comment" | "set";
  targetId: string;
  reason: string;
  detail: string | null;
}) {
  const r = await authedRequest<null>("POST", "/me/reports", input);
  return { ok: r.ok, code: r.code };
}

// 팔로우/언팔로우 (NON-25)
export async function followUser(username: string) {
  const r = await authedRequest<null>("POST", "/me/follows", { username });
  return { ok: r.ok, code: r.code };
}

export async function unfollowUser(username: string) {
  const r = await authedRequest<null>("DELETE", `/me/follows?username=${encodeURIComponent(username)}`);
  return { ok: r.ok, code: r.code };
}

// 유저 차단/해제 (상호, NON-115)
export async function blockUser(username: string) {
  const r = await authedRequest<null>("POST", "/me/blocks", { username });
  return { ok: r.ok, code: r.code };
}

export async function unblockUser(username: string) {
  const r = await authedRequest<null>("DELETE", `/me/blocks?username=${encodeURIComponent(username)}`);
  return { ok: r.ok, code: r.code };
}

// 유저 장르 태깅 토글 (NON-122). 로그인 필요. { tagged } 반환(클라 낙관적 반영).
export async function toggleGenreTag(input: { targetType: "track" | "album"; spotifyId: string; genreId: number }) {
  return authedRequest<{ tagged: boolean }>("POST", "/me/genre-tags", input);
}

// 피드 더 보기 (NON-107) — 클라가 offset 늘려 호출, 다음 페이지 append.
export async function loadMoreFeed(sort: FeedSort, scope: FeedScope, offset: number, genre?: string | null) {
  return getFeed(sort, scope, offset, 20, genre ?? undefined);
}

// 팔로워/팔로잉 목록 (모달에서 클라가 호출)
export async function loadFollowers(username: string) {
  return getFollowers(username);
}
export async function loadFollowing(username: string) {
  return getFollowing(username);
}
