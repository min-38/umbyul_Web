"use server";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// 공개 문의 접수(NON-78). 로그인 무관. code 만 돌려주고 표시 문구는 클라가 매핑.
export async function submitInquiry(input: {
  category: string;
  email: string;
  title: string;
  content: string;
  website: string; // honeypot (봇 차단)
}): Promise<{ ok: boolean; code: string }> {
  try {
    const res = await fetch(`${API_URL}/inquiries`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
      cache: "no-store",
    });
    const json = await res.json().catch(() => null);
    return { ok: res.ok, code: (json?.code as string) ?? (res.ok ? "OK" : "UNKNOWN") };
  } catch {
    return { ok: false, code: "DB_UNAVAILABLE" };
  }
}
