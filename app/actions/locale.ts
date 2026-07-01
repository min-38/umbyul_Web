"use server";

import { cookies } from "next/headers";
import type { Locale } from "@/lib/i18n";

export async function setLocale(locale: Locale) {
  (await cookies()).set("locale", locale, { path: "/", maxAge: 60 * 60 * 24 * 365 });
}
