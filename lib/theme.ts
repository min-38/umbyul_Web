export type Theme = "light" | "dark" | "system";

export const THEME_LABELS: Record<Theme, string> = {
  light: "라이트",
  dark: "다크",
  system: "시스템",
};

export function resolveDark(t: Theme): boolean {
  return t === "dark" || (t === "system" && matchMedia("(prefers-color-scheme: dark)").matches);
}

export function applyTheme(t: Theme): void {
  document.documentElement.classList.toggle("dark", resolveDark(t));
}

export function getStoredTheme(): Theme {
  return (localStorage.getItem("theme") as Theme) || "system";
}

/** 저장 + 적용 + 다른 컴포넌트(헤더 토글 ↔ 설정) 동기화용 이벤트 발행 */
export function setStoredTheme(t: Theme): void {
  localStorage.setItem("theme", t);
  applyTheme(t);
  window.dispatchEvent(new CustomEvent("themechange", { detail: t }));
}
