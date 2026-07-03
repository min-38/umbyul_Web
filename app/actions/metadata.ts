"use server";

// 장르(NON-122) — 목록·집계 지연 로드. 클라 컴포넌트가 마운트 후 호출.
import { getGenres, getGenresFor } from "@/lib/api";

// 집계는 세션 토큰 실어 mine 포함.
export async function loadGenres() {
  return getGenres();
}

export async function loadGenresFor(type: "track" | "album", id: string) {
  return getGenresFor(type, id);
}
