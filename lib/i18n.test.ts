import { describe, it, expect } from "vitest";
import { translate } from "./i18n";

// QA7-3: i18n translate() — ko 패스스루, en 룩업, 누락 폴백, {param} 치환.
describe("translate", () => {
  it("ko passthrough (dict 없음)", () => expect(translate("ko", "차트")).toBe("차트"));
  it("en lookup", () => expect(translate("en", "차트")).toBe("Charts"));
  it("missing key → ko fallback", () =>
    expect(translate("en", "존재하지_않는_키_zzz")).toBe("존재하지_않는_키_zzz"));
  it("param substitution (ko 로케일)", () =>
    expect(translate("ko", "안녕 {name}", { name: "민서" })).toBe("안녕 민서"));
  it("repeated param (replaceAll)", () =>
    expect(translate("ko", "{x}-{x}", { x: "z" })).toBe("z-z"));
  it("number param", () =>
    expect(translate("ko", "조회 {count}", { count: 5 })).toBe("조회 5"));

  // QA10-1: 복수형("단수형|복수형") — count=1은 단수, 그 외 복수. ko/ja는 파이프 없어 무관.
  it("en plural: count=1 → singular", () =>
    expect(translate("en", "{count}개 평가", { count: 1 })).toBe("1 rating"));
  it("en plural: count>1 → plural", () =>
    expect(translate("en", "{count}개 평가", { count: 3 })).toBe("3 ratings"));
  it("es plural: count=1 → singular", () =>
    expect(translate("es", "리뷰 {count}", { count: 1 })).toBe("1 reseña"));
  it("es plural: count=0 → plural", () =>
    expect(translate("es", "리뷰 {count}", { count: 0 })).toBe("0 reseñas"));
  it("plural by score: score=1 → singular", () =>
    expect(translate("en", "{score}점", { score: 1 })).toBe("1 star"));
  it("plural by score: score=0.5 → plural", () =>
    expect(translate("en", "{score}점", { score: 0.5 })).toBe("0.5 stars"));

  // QA10-1: 소수점 로케일 — 소수만 로케일 소수점(es 쉼표), 정수는 그룹핑 없이 그대로.
  it("es decimal uses comma", () =>
    expect(translate("es", "{score}점", { score: 3.5 })).toBe("3,5 estrellas"));
  it("en decimal uses period", () =>
    expect(translate("en", "{score}점", { score: 3.5 })).toBe("3.5 stars"));
  it("integer keeps plain form (no grouping)", () =>
    expect(translate("en", "조회 {count}", { count: 2000 })).toBe("2000 views"));
});
