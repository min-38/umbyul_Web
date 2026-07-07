"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { safeSpotifyImageUrl } from "@/lib/validation";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

type Result = { ok: boolean; code: string };

// 세션 토큰을 실어 게이트웨이(.NET Api) 호출. code 만 돌려주고 표시 문구는 클라가 매핑.
async function authedFetch(path: string, init: RequestInit): Promise<Result> {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) return { ok: false, code: "UNAUTHORIZED" };

  try {
    const res = await fetch(`${API_URL}${path}`, {
      ...init,
      headers: {
        ...init.headers,
        Authorization: `Bearer ${session.access_token}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });
    const json = await res.json().catch(() => null);
    return { ok: res.ok, code: (json?.code as string) ?? (res.ok ? "OK" : "UNKNOWN") };
  } catch {
    return { ok: false, code: "DB_UNAVAILABLE" };
  }
}

export async function saveRating(input: {
  targetType: "track" | "album";
  targetId: string;
  spotifyId: string;
  score: number;
  review: string | null;
  path: string;
  // 표시 메타데이터(피드를 Spotify 호출 없이 렌더하기 위해 함께 저장) — NON-43
  name: string;
  artist: string;
  imageUrl: string | null;
  artists: { id: string; name: string }[]; // 개별 아티스트 링크용 (NON-85)
  explicit?: boolean; // 19금 스냅샷(BUG-14) — 피드·차트·프로필 배지용
}): Promise<Result> {
  const r = await authedFetch("/me/ratings", {
    method: "POST",
    body: JSON.stringify({
      targetType: input.targetType,
      targetId: input.targetId,
      spotifyId: input.spotifyId,
      score: input.score,
      review: input.review,
      name: input.name,
      artist: input.artist,
      // 클라 제공 imageUrl은 Spotify CDN만 신뢰 — 그 외는 떨궈 placeholder 폴백(SEC-W-2). 이름/아티스트 텍스트는 렌더 시 이스케이프됨. 완전한 해결은 서버가 카탈로그에서 파생.
      imageUrl: safeSpotifyImageUrl(input.imageUrl),
      artists: input.artists,
      explicit: input.explicit ?? false,
    }),
  });
  if (r.ok) revalidatePath(input.path);
  return r;
}

export async function deleteRating(input: {
  targetType: "track" | "album";
  targetId: string;
  path: string;
}): Promise<Result> {
  const params = new URLSearchParams({ targetType: input.targetType, targetId: input.targetId });
  const r = await authedFetch(`/me/ratings?${params.toString()}`, { method: "DELETE" });
  if (r.ok) revalidatePath(input.path);
  return r;
}
