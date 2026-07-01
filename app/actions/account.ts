"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

type Result = { ok: boolean; code: string };

export async function updateUsername(username: string): Promise<Result & { username?: string }> {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) return { ok: false, code: "UNAUTHORIZED" };

  try {
    const res = await fetch(`${API_URL}/me/username`, {
      method: "POST",
      headers: { Authorization: `Bearer ${session.access_token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ username }),
      cache: "no-store",
    });
    const json = await res.json().catch(() => null);
    if (res.ok) revalidatePath("/", "layout");
    return { ok: res.ok, code: json?.code ?? (res.ok ? "OK" : "UNKNOWN"), username: json?.data?.username };
  } catch {
    return { ok: false, code: "DB_UNAVAILABLE" };
  }
}

export async function uploadAvatar(formData: FormData): Promise<Result & { avatarUrl?: string }> {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) return { ok: false, code: "UNAUTHORIZED" };

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) return { ok: false, code: "NO_FILE" };

  const fd = new FormData();
  fd.append("file", file);
  try {
    const res = await fetch(`${API_URL}/me/avatar`, {
      method: "POST",
      headers: { Authorization: `Bearer ${session.access_token}` }, // content-type 은 fetch 가 multipart boundary 로 설정
      body: fd,
      cache: "no-store",
    });
    const json = await res.json().catch(() => null);
    if (res.ok) revalidatePath("/", "layout");
    return { ok: res.ok, code: json?.code ?? (res.ok ? "OK" : "UNKNOWN"), avatarUrl: json?.data?.avatarUrl };
  } catch {
    return { ok: false, code: "DB_UNAVAILABLE" };
  }
}

export async function deleteAccount(): Promise<Result> {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) return { ok: false, code: "UNAUTHORIZED" };

  try {
    const res = await fetch(`${API_URL}/me/account`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${session.access_token}` },
      cache: "no-store",
    });
    const json = await res.json().catch(() => null);
    if (res.ok) await supabase.auth.signOut();
    return { ok: res.ok, code: json?.code ?? (res.ok ? "OK" : "UNKNOWN") };
  } catch {
    return { ok: false, code: "DB_UNAVAILABLE" };
  }
}
