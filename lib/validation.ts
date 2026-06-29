// 회원가입·온보딩·재설정에서 공용으로 쓰는 클라이언트 검증 규칙.

export const isEmail = (s: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);

// 고유 핸들: 영문/숫자, 하이픈은 중간에만, 2–30자
export const USERNAME_RE = /^[a-zA-Z0-9]+(-[a-zA-Z0-9]+)*$/;
export const isUsername = (s: string) =>
  s.length >= 2 && s.length <= 30 && USERNAME_RE.test(s);

// 8자 이상 + 대문자·소문자·숫자·특수문자 각 1개 이상
export type PasswordChecks = {
  length: boolean;
  upper: boolean;
  lower: boolean;
  digit: boolean;
  special: boolean;
  all: boolean;
};
export function passwordChecks(pw: string): PasswordChecks {
  const length = pw.length >= 8;
  const upper = /[A-Z]/.test(pw);
  const lower = /[a-z]/.test(pw);
  const digit = /\d/.test(pw);
  const special = /[^A-Za-z0-9]/.test(pw);
  return { length, upper, lower, digit, special, all: length && upper && lower && digit && special };
}

// 입력란 테두리 색 (idle/valid/invalid)
export type FieldStatus = "idle" | "valid" | "invalid";
export const borderClass = (s: FieldStatus) =>
  s === "valid"
    ? "border-green-500 dark:border-green-500"
    : s === "invalid"
      ? "border-red-500 dark:border-red-500"
      : "border-zinc-300 dark:border-zinc-700";
