"use client";

import Link from "next/link";

// NON-6: 버튼은 항상 노출, 비로그인 클릭 시 로그인 유도(기획 §3).
// 로그인 상태의 작성/수정 폼은 NON-7에서 연결.
export function RateButton({ loggedIn }: { loggedIn: boolean }) {
  const cls =
    "inline-flex items-center justify-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500";

  if (!loggedIn) {
    return (
      <Link href="/login" className={cls}>
        평가하기
      </Link>
    );
  }
  return (
    <button type="button" className={cls}>
      평가하기
    </button>
  );
}
