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
});
