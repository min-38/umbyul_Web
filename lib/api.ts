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
  const json = await res.json();
  return json.data as Profile;
}

// 평점/리뷰수는 NON-7/8 이후. 지금은 메타데이터만.
export type TrackResult = {
  id: string;
  name: string;
  artist: string;
  albumId: string | null;
  albumName: string | null;
  imageUrl: string | null;
  isrc: string | null;
};
export type AlbumResult = {
  id: string;
  name: string;
  artist: string;
  imageUrl: string | null;
  releaseDate: string | null;
};
export type ArtistResult = { id: string; name: string; imageUrl: string | null };
export type UserResult = { id: string; username: string; avatarUrl: string | null };
export type Category<T> = { items: T[]; total: number };
export type SearchResults = {
  tracks: Category<TrackResult>;
  albums: Category<AlbumResult>;
  artists: Category<ArtistResult>;
  users: Category<UserResult>;
};

/** 통합 검색 (공개 엔드포인트, 인증 불필요). */
export async function searchAll(q: string): Promise<SearchResults> {
  const res = await fetch(`${API_URL}/search?q=${encodeURIComponent(q)}`, { cache: "no-store" });
  if (!res.ok) throw new Error(`search failed: ${res.status}`);
  const json = await res.json();
  return json.data as SearchResults;
}

// ── 상세 (NON-6) ── 영구 카탈로그 없이 Spotify 라이브 + 우리 평점/리뷰.
export type ArtistRef = { id: string; name: string };
export type AlbumRef = { id: string; name: string; imageUrl: string | null };
export type TrackRef = { id: string; name: string; durationMs: number; trackNumber: number };
export type RatingSummary = { average: number | null; count: number };
export type Reaction = "like" | "dislike";
export type ReviewItem = {
  id: string;
  userId: string;
  username: string;
  avatarUrl: string | null;
  score: number;
  body: string | null;
  createdAt: string;
  likeCount: number;
  dislikeCount: number;
  myReaction: Reaction | null;
};
// 장르는 Spotify 앱 토큰으로 안 내려와 제외. 레이블은 copyrights(℗/©) 텍스트.
export type TrackDetail = {
  spotifyId: string;
  name: string;
  spotifyUrl: string;
  artists: ArtistRef[];
  album: AlbumRef | null;
  isrc: string | null;
  targetId: string;
  durationMs: number;
  releaseDate: string | null;
  copyright: string | null;
  rating: RatingSummary;
  reviews: ReviewItem[];
};
export type AlbumDetail = {
  spotifyId: string;
  name: string;
  spotifyUrl: string;
  artists: ArtistRef[];
  imageUrl: string | null;
  upc: string | null;
  targetId: string;
  releaseDate: string | null;
  copyright: string | null;
  totalTracks: number;
  tracks: TrackRef[];
  rating: RatingSummary;
  reviews: ReviewItem[];
};

// 로그인 시 토큰을 실어 보내면 상세 응답에 내 반응(myReaction)이 포함된다(공개 엔드포인트라 옵셔널).
async function detailHeaders(): Promise<HeadersInit> {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session ? { Authorization: `Bearer ${session.access_token}` } : {};
}

/** 트랙 상세 (공개). 없으면 null(404). */
export async function getTrackDetail(id: string): Promise<TrackDetail | null> {
  const res = await fetch(`${API_URL}/detail/track/${encodeURIComponent(id)}`, {
    headers: await detailHeaders(),
    cache: "no-store",
  });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`track detail failed: ${res.status}`);
  const json = await res.json();
  return json.data as TrackDetail;
}

/** 앨범 상세 (공개). 없으면 null(404). */
export async function getAlbumDetail(id: string): Promise<AlbumDetail | null> {
  const res = await fetch(`${API_URL}/detail/album/${encodeURIComponent(id)}`, {
    headers: await detailHeaders(),
    cache: "no-store",
  });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`album detail failed: ${res.status}`);
  const json = await res.json();
  return json.data as AlbumDetail;
}

// ── 유저 프로필 (NON-24) ──
export type ProfileReview = {
  id: string;
  targetType: "track" | "album";
  spotifyId: string | null;
  score: number;
  body: string | null;
  createdAt: string;
  likeCount: number;
  name: string | null;
  artist: string | null;
  imageUrl: string | null;
};
export type UserProfile = {
  username: string;
  avatarUrl: string | null;
  joinedAt: string;
  reviewCount: number;
  totalLikes: number;
  reviews: ProfileReview[];
};

/** 공개 유저 프로필 (비로그인 열람). 없으면 null(404). */
export async function getUserProfile(username: string): Promise<UserProfile | null> {
  const res = await fetch(`${API_URL}/users/${encodeURIComponent(username)}`, { cache: "no-store" });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`profile fetch failed: ${res.status}`);
  const json = await res.json();
  return json.data as UserProfile;
}
