import { createClient } from "@/lib/supabase/server";

// 게이트웨이(.NET Api) 호출. 서버 컴포넌트에서 세션 토큰을 실어 호출(서버-서버, CORS 무관).
const API_URL = process.env.NEXT_PUBLIC_API_URL;

export type Profile = {
  id: string;
  username: string;
  country: string | null;
  avatarUrl: string | null;
  isArtist: boolean;
  createdAt: string;
};

/** 로그인 유저의 프로필 조회. 프로필 없으면(404) null, 비로그인도 null. */
export async function getProfile(): Promise<Profile | null> {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) return null;

  const res = await fetch(`${API_URL}/me/profile`, {
    headers: { Authorization: `Bearer ${session.access_token}` },
    cache: "no-store",
  });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`profile fetch failed: ${res.status}`);
  return res.json();
}
