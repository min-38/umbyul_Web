"use client";

import { createContext, useContext } from "react";
import { type Locale, translate } from "@/lib/i18n";

const LocaleContext = createContext<Locale>("ko");

export function I18nProvider({ locale, children }: { locale: Locale; children: React.ReactNode }) {
  return <LocaleContext.Provider value={locale}>{children}</LocaleContext.Provider>;
}

/** 클라이언트 컴포넌트용 t. */
export function useT() {
  const locale = useContext(LocaleContext);
  return (ko: string, params?: Record<string, string | number>) => translate(locale, ko, params);
}

export function useLocale() {
  return useContext(LocaleContext);
}
