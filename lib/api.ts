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
  locale: "ko" | "en" | null;
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

// 내 제재 상태(정지/영구정지). 제재 없으면 banned=false·suspendedUntil=null. (NON-55)
// 경고는 알림으로 전달(NON-58).
export type MySanction = { banned: boolean; suspendedUntil: string | null; reason: string | null };

export async function getMySanction(): Promise<MySanction | null> {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) return null;
  try {
    const res = await fetch(`${API_URL}/me/sanction`, {
      headers: { Authorization: `Bearer ${session.access_token}` },
      cache: "no-store",
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data as MySanction;
  } catch {
    return null;
  }
}

// 약관/개인정보 게시본 조회. 요청 로케일 없으면 서버가 en 폴백. 미게시면 null. (NON-66)
export type LegalDoc = {
  type: string;
  locale: string;
  content: string;
  updatedAt: string;
  version: string | null;
  effectiveDate: string | null;
};

export async function getLegalDoc(type: "terms" | "privacy", locale: string): Promise<LegalDoc | null> {
  try {
    const res = await fetch(`${API_URL}/legal/${type}?locale=${encodeURIComponent(locale)}`, { cache: "no-store" });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data as LegalDoc;
  } catch {
    return null;
  }
}

// 공개 FAQ. 게시 항목(요청 로케일, 없으면 en). 카테고리·순서 정렬. (NON-75)
export type FaqItem = { category: string; question: string; answer: string };

export async function getFaq(locale: string): Promise<FaqItem[]> {
  try {
    const res = await fetch(`${API_URL}/faq?locale=${encodeURIComponent(locale)}`, { cache: "no-store" });
    if (!res.ok) return [];
    const json = await res.json();
    return (json.data?.items ?? []) as FaqItem[];
  } catch {
    return [];
  }
}

// 평점/리뷰수는 NON-7/8 이후. 지금은 메타데이터만.
export type TrackResult = {
  id: string;
  name: string;
  artist: string;
  artists: { id: string; name: string }[];
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
export type TrackRef = { id: string; name: string; durationMs: number; trackNumber: number; rating: RatingSummary | null };
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
  commentCount: number;
};
export type ReviewComment = {
  id: string;
  parentId: string | null;
  userId: string;
  username: string;
  avatarUrl: string | null;
  body: string | null; // 삭제 시 null
  createdAt: string;
  likeCount: number;
  likedByMe: boolean;
  score: number | null; // 작성자가 대상에 매긴 별점, null = 평가 없음
  deleted: boolean;
  edited: boolean; // 수정됨 표시(BUG-11)
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

// ── 평점 시세 (NON-124) — 일별 누적 평균 시계열. 공개. 실패 시 빈 배열. ──
export type RatingPoint = { date: string; avg: number; count: number };

export async function getRatingHistory(type: "track" | "album", targetId: string): Promise<RatingPoint[]> {
  try {
    const qs = new URLSearchParams({ type, id: targetId });
    const res = await fetch(`${API_URL}/detail/rating-history?${qs}`, { cache: "no-store" });
    if (!res.ok) return [];
    const json = await res.json();
    return (json?.data ?? []) as RatingPoint[];
  } catch {
    return [];
  }
}

// ── 유저 장르 태깅 (NON-122) — 커뮤니티 큐레이트. 목록·집계 공개, 태깅은 로그인. ──
export type Genre = { id: number; slug: string; name: string; parentId: number | null; sortOrder: number };
export type GenreCount = { id: number; name: string; parentName: string | null; count: number };
export type GenresFor = { top: GenreCount[]; mine: number[] };

/** 큐레이트 장르 목록(공개). 실패 시 빈 목록. */
export async function getGenres(): Promise<Genre[]> {
  try {
    const res = await fetch(`${API_URL}/genres`, { cache: "no-store" });
    if (!res.ok) return [];
    const json = await res.json();
    return (json?.data ?? []) as Genre[];
  } catch {
    return [];
  }
}

/** 대상의 상위 장르(투표수) + 로그인 시 내 선택. 토큰 있으면 실어 보냄(mine 포함). */
export async function getGenresFor(type: "track" | "album", id: string): Promise<GenresFor> {
  const empty: GenresFor = { top: [], mine: [] };
  try {
    const qs = new URLSearchParams({ type, id });
    const res = await fetch(`${API_URL}/genres/for?${qs}`, { headers: await detailHeaders(), cache: "no-store" });
    if (!res.ok) return empty;
    const json = await res.json();
    return (json?.data ?? empty) as GenresFor;
  } catch {
    return empty;
  }
}

// ── 아티스트 상세 (NON-13) ──
// 아티스트 종합점수는 없음. 릴리스별로 이미 존재하는 평가만 배지로 노출.
// 앱 토큰 제약(실측): followers·popularity·top-tracks 불가 → 앨범(디스코그래피) 중심.
export type RatingBadge = { average: number; count: number };
export type ArtistAlbum = {
  spotifyId: string;
  name: string;
  imageUrl: string | null;
  releaseDate: string | null;
  albumType: string;
  rating: RatingBadge | null;
};
export type ArtistReview = {
  targetType: "track" | "album";
  targetSpotifyId: string;
  username: string;
  avatarUrl: string | null;
  score: number;
  body: string;
  createdAt: string;
  targetName: string;
};
export type ArtistRatedTrack = { spotifyId: string; name: string; imageUrl: string | null; rating: RatingBadge };
export type ArtistDetail = {
  spotifyId: string;
  name: string;
  imageUrl: string | null;
  spotifyUrl: string;
  ratedCount: number;
  totalRatings: number;
  ratedTracks: ArtistRatedTrack[];
  albums: ArtistAlbum[];
  recentReviews: ArtistReview[];
  catalogError: boolean;
};

/** 아티스트 상세 (공개). 없으면 null(404). */
export async function getArtistDetail(id: string): Promise<ArtistDetail | null> {
  const res = await fetch(`${API_URL}/artist/${encodeURIComponent(id)}`, { cache: "no-store" });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`artist detail failed: ${res.status}`);
  const json = await res.json();
  return json.data as ArtistDetail;
}

// ── 홈 피드 (NON-43) ── 전부 DB 캐시 메타데이터라 Spotify 호출 없음.
export type HomeReview = {
  id: string;
  userId: string;
  username: string;
  avatarUrl: string | null;
  targetType: "track" | "album";
  targetSpotifyId: string;
  score: number;
  body: string;
  createdAt: string;
  name: string | null;
  artist: string | null;
  imageUrl: string | null;
};
export type TrendingItem = {
  targetType: "track" | "album";
  spotifyId: string;
  count: number;
  average: number;
  name: string | null;
  artist: string | null;
  imageUrl: string | null;
};
export type HomeData = { recentReviews: HomeReview[]; trending: TrendingItem[]; followFeed: HomeReview[] };

// 홈 피드 v2(NON-88). Reddit식 정렬 + 반응 집계.
export type FeedSort = "hot" | "newest" | "likes" | "ratio" | "rising";
export type FeedScope = "all" | "following";
export type FeedItem = {
  id: string;
  userId: string;
  username: string;
  avatarUrl: string | null;
  targetType: "track" | "album";
  targetSpotifyId: string;
  score: number;
  body: string;
  createdAt: string;
  name: string | null;
  artist: string | null;
  imageUrl: string | null;
  artists: ArtistRef[] | null;
  likes: number;
  dislikes: number;
  myReaction: Reaction | null;
  commentCount: number;
};

/** 홈 피드 v2 (공개, following은 로그인 필요). 실패 시 빈 목록. */
export async function getFeed(sort: FeedSort, scope: FeedScope, offset = 0, limit = 50): Promise<FeedItem[]> {
  try {
    const qs = new URLSearchParams({ sort, scope, offset: String(offset), limit: String(limit) });
    const res = await fetch(`${API_URL}/feed?${qs}`, { headers: await detailHeaders(), cache: "no-store" });
    if (!res.ok) return [];
    const json = await res.json();
    return (json?.data?.items ?? []) as FeedItem[];
  } catch {
    return [];
  }
}

/** 홈 피드 (공개, 로그인 시 팔로우 피드 포함). 실패 시 null(홈이 죽지 않게). */
export async function getHome(): Promise<HomeData | null> {
  try {
    const res = await fetch(`${API_URL}/home`, { headers: await detailHeaders(), cache: "no-store" });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data as HomeData;
  } catch {
    return null;
  }
}

// Discover(NON-81/85). 전부 대상 커버(DiscoverItem). artistId 있으면 아티스트 링크(NON-85).
export type DiscoverItem = TrendingItem & { artists: ArtistRef[] | null };
export type RisingWindows = { day: DiscoverItem[]; week: DiscoverItem[]; month: DiscoverItem[]; year: DiscoverItem[] };
export type DiscoverData = { rising: RisingWindows; new: DiscoverItem[]; myRecent: DiscoverItem[] };

// Chart(NON-82). 랭킹 아이템은 DiscoverItem 과 동일 형태.
export type ChartType = "all" | "album" | "track" | "artist" | "user";
export type ChartSort = "most" | "top";
export type ChartPeriod = "day" | "week" | "month" | "year";
export type ChartGender = "all" | "male" | "female";
export type ChartAge = "all" | "10" | "20" | "30" | "40" | "50";

// 아티스트 차트(NON-87). 앨범/곡 평가를 아티스트별 집계. 커버 없음.
export type ArtistRankItem = { artistId: string; artistName: string | null; count: number; average: number };

/** 아티스트 차트 (공개). `/chart?type=artist`. 실패 시 빈 목록. */
export async function getArtistChart(
  sort: ChartSort,
  period: ChartPeriod,
  gender: ChartGender,
  age: ChartAge,
  limit = 50,
): Promise<ArtistRankItem[]> {
  try {
    const qs = new URLSearchParams({ type: "artist", sort, period, gender, age, limit: String(limit) });
    const res = await fetch(`${API_URL}/chart?${qs}`, { cache: "no-store" });
    if (!res.ok) return [];
    const json = await res.json();
    return (json?.data?.items ?? []) as ArtistRankItem[];
  } catch {
    return [];
  }
}

// 유저 차트(NON-86). 리뷰어 랭킹 3축.
export type ChartUserSort = "reviews" | "likes" | "followers";
export type UserRankItem = { userId: string; username: string; avatarUrl: string | null; count: number };

/** 유저 차트 (공개). 실패 시 빈 목록. */
export async function getUserChart(sort: ChartUserSort, period: ChartPeriod, limit = 50): Promise<UserRankItem[]> {
  try {
    const qs = new URLSearchParams({ sort, period, limit: String(limit) });
    const res = await fetch(`${API_URL}/chart/users?${qs}`, { cache: "no-store" });
    if (!res.ok) return [];
    const json = await res.json();
    return (json?.data?.items ?? []) as UserRankItem[];
  } catch {
    return [];
  }
}

/** Chart (공개). 실패 시 빈 목록(페이지가 죽지 않게). */
export async function getChart(
  type: ChartType,
  sort: ChartSort,
  period: ChartPeriod,
  gender: ChartGender,
  age: ChartAge,
  limit = 50,
): Promise<DiscoverItem[]> {
  try {
    const qs = new URLSearchParams({ type, sort, period, gender, age, limit: String(limit) });
    const res = await fetch(`${API_URL}/chart?${qs}`, { cache: "no-store" });
    if (!res.ok) return [];
    const json = await res.json();
    return (json?.data?.items ?? []) as DiscoverItem[];
  } catch {
    return [];
  }
}

/** Discover (공개, 로그인 시 내 최근 리뷰 포함). 실패·형태 불일치 시 빈 데이터(페이지가 죽지 않게). */
export async function getDiscover(): Promise<DiscoverData> {
  const empty: DiscoverData = { rising: { day: [], week: [], month: [], year: [] }, new: [], myRecent: [] };
  try {
    const res = await fetch(`${API_URL}/discover`, { headers: await detailHeaders(), cache: "no-store" });
    if (!res.ok) return empty;
    const json = await res.json();
    const d = (json?.data ?? {}) as Partial<DiscoverData>;
    const r = (d.rising ?? {}) as Partial<RisingWindows>;
    return {
      rising: { day: r.day ?? [], week: r.week ?? [], month: r.month ?? [], year: r.year ?? [] },
      new: d.new ?? [],
      myRecent: d.myRecent ?? [],
    };
  } catch {
    return empty;
  }
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
  deleted: boolean;
};
export type UserProfile = {
  id: string;
  username: string;
  avatarUrl: string | null;
  joinedAt: string;
  reviewCount: number;
  totalLikes: number;
  followerCount: number;
  followingCount: number;
  isFollowing: boolean;
  reviews: ProfileReview[];
  blocked: boolean; // 내가 이 유저를 차단함(NON-115) — 리뷰/통계 숨김 상태.
};

/** 공개 유저 프로필 (비로그인 열람). 로그인 시 토큰 실어 isFollowing 포함. 없으면 null(404). */
export async function getUserProfile(username: string): Promise<UserProfile | null> {
  const res = await fetch(`${API_URL}/users/${encodeURIComponent(username)}`, {
    headers: await detailHeaders(),
    cache: "no-store",
  });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`profile fetch failed: ${res.status}`);
  const json = await res.json();
  return json.data as UserProfile;
}

// 팔로워/팔로잉 목록 (NON-25)
export type FollowUser = { username: string; avatarUrl: string | null; isFollowing: boolean };

async function fetchFollowList(username: string, kind: "followers" | "following"): Promise<FollowUser[]> {
  const res = await fetch(`${API_URL}/users/${encodeURIComponent(username)}/${kind}`, {
    headers: await detailHeaders(),
    cache: "no-store",
  });
  if (!res.ok) return [];
  const json = await res.json();
  return (json.data as FollowUser[]) ?? [];
}

export const getFollowers = (username: string) => fetchFollowList(username, "followers");
export const getFollowing = (username: string) => fetchFollowList(username, "following");

// ── 알림 (NON-26) ──
export type NotificationItem = {
  id: string;
  type: "follow" | "review_like" | "warning" | "mention";
  actorUsername: string;
  actorAvatarUrl: string | null;
  createdAt: string;
  read: boolean;
  link: string | null;
  detail: string | null;
};
export type NotificationList = { items: NotificationItem[]; unreadCount: number };

/** 내 알림 목록 + 안읽음 수 (로그인). 비로그인/오류 시 빈 값. */
export async function getNotifications(): Promise<NotificationList> {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) return { items: [], unreadCount: 0 };

  try {
    const res = await fetch(`${API_URL}/me/notifications`, {
      headers: { Authorization: `Bearer ${session.access_token}` },
      cache: "no-store",
    });
    if (!res.ok) return { items: [], unreadCount: 0 };
    const json = await res.json();
    return json.data as NotificationList;
  } catch {
    return { items: [], unreadCount: 0 };
  }
}

// 차단 관리 (NON-119) — 내가 차단한 유저 목록.
export type BlockedUser = { username: string; avatarUrl: string | null; createdAt: string };

/** 내가 차단한 유저 목록 (로그인). 오류 시 빈 목록. */
export async function getBlockedUsers(): Promise<BlockedUser[]> {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) return [];

  try {
    const res = await fetch(`${API_URL}/me/blocks`, {
      headers: { Authorization: `Bearer ${session.access_token}` },
      cache: "no-store",
    });
    if (!res.ok) return [];
    const json = await res.json();
    return (json.data ?? []) as BlockedUser[];
  } catch {
    return [];
  }
}

export type NotificationPrefs = { master: boolean; follow: boolean; reviewLike: boolean; mention: boolean };

/** 알림 설정 조회 (로그인). 없으면/오류 시 기본 on. */
export async function getNotificationPrefs(): Promise<NotificationPrefs> {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const defaults: NotificationPrefs = { master: true, follow: true, reviewLike: true, mention: true };
  if (!session) return defaults;

  try {
    const res = await fetch(`${API_URL}/me/notification-prefs`, {
      headers: { Authorization: `Bearer ${session.access_token}` },
      cache: "no-store",
    });
    if (!res.ok) return defaults;
    const json = await res.json();
    return json.data as NotificationPrefs;
  } catch {
    return defaults;
  }
}

// ── DJ 믹스 (NON-133) ──
export type DjSetSummary = {
  id: string;
  ownerId: string;
  ownerUsername: string;
  ownerAvatarUrl: string | null;
  title: string;
  note: string | null;
  listenUrl: string | null;
  createdAt: string;
  trackCount: number;
  updatedAt: string;
  covers: string[];
  likeCount: number;
  likedByMe: boolean;
};
export type DjSetTrack = {
  spotifyId: string;
  position: number;
  isrc: string | null;
  name: string;
  artist: string;
  artists: { id: string; name: string }[];
  albumId: string | null;
  albumName: string | null;
  imageUrl: string | null;
  youtubeUrl: string | null;
  myScore: number | null;
  myReview: string | null;
};
export type DjSetDetail = { set: DjSetSummary; tracks: DjSetTrack[] };
export type DjSetComment = { id: string; userId: string; username: string; avatarUrl: string | null; body: string; createdAt: string; edited: boolean };

/** 믹스 상세 (공개, 로그인 시 트랙별 내 평점 포함). 없으면 null. */
export async function getSet(id: string): Promise<DjSetDetail | null> {
  const res = await fetch(`${API_URL}/sets/${encodeURIComponent(id)}`, {
    headers: await detailHeaders(),
    cache: "no-store",
  });
  if (res.status === 404) return null;
  if (!res.ok) return null;
  const json = await res.json();
  return json.data as DjSetDetail;
}

/** 유저의 믹스 목록 (공개). 실패 시 빈 목록. */
export async function getUserSets(username: string): Promise<DjSetSummary[]> {
  try {
    const res = await fetch(`${API_URL}/users/${encodeURIComponent(username)}/sets`, { cache: "no-store" });
    if (!res.ok) return [];
    const json = await res.json();
    return (json?.data?.items as DjSetSummary[]) ?? [];
  } catch {
    return [];
  }
}

/** 최근 믹스 목록 (전체 유저, 공개). 실패 시 빈 목록. */
export async function getRecentSets(): Promise<DjSetSummary[]> {
  try {
    const res = await fetch(`${API_URL}/sets`, { cache: "no-store" });
    if (!res.ok) return [];
    const json = await res.json();
    return (json?.data?.items as DjSetSummary[]) ?? [];
  } catch {
    return [];
  }
}
