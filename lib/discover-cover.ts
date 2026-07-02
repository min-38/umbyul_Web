import type { DiscoverItem } from "./api";

// 커버 카드 표시 모델(클라/서버 공용, 서버 전용 import 없음).
export type CoverItem = {
  key: string;
  href: string;
  imageUrl: string | null;
  name: string | null;
  artist: string | null; // 조인된 이름(폴백 — 구 데이터는 링크 없이 이 값만)
  artists: { name: string; href: string | null }[]; // 개별 아티스트(있으면 각각 링크)
};

export function toCover(x: DiscoverItem): CoverItem {
  return {
    key: `${x.targetType}-${x.spotifyId}`,
    href: `/${x.targetType}/${x.spotifyId}`,
    imageUrl: x.imageUrl,
    name: x.name,
    artist: x.artist,
    artists: (x.artists ?? [])
      .filter((a) => a.name)
      .map((a) => ({ name: a.name, href: a.id ? `/artist/${a.id}` : null })),
  };
}
