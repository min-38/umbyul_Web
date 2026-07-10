"use client";

import { useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// 공지 조회수 집계(NON-173/QA4-2). 상세는 서버 컴포넌트 SSR라 API가 보는 IP가 항상 Next 서버 →
// 브라우저에서 직접 /view를 호출해 진짜 클라이언트 IP·로그인 identity를 전달(익명·로그인 모두 뷰어당 1회 dedup).
// 렌더는 없음(부수효과 전용).
export function AnnouncementViewPing({ id }: { id: string }) {
  const pinged = useRef(false);

  useEffect(() => {
    if (pinged.current) return; // 이중 마운트(StrictMode)·리렌더 중복 핑 방지
    pinged.current = true;
    (async () => {
      try {
        const supabase = createClient();
        const {
          data: { session },
        } = await supabase.auth.getSession();
        await fetch(`${API_URL}/announcements/${encodeURIComponent(id)}/view`, {
          method: "POST",
          headers: session ? { Authorization: `Bearer ${session.access_token}` } : {},
          keepalive: true,
        });
      } catch {
        // best-effort — 조회수 집계 실패는 무시(페이지 동작에 영향 없음).
      }
    })();
  }, [id]);

  return null;
}
