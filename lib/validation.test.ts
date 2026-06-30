import { describe, it, expect } from "vitest";
import { isEmail, isUsername, passwordChecks } from "./validation";

describe("isEmail", () => {
  it.each(["a@b.com", "x.y@z.co.kr", "user+tag@mail.io"])("valid: %s", (e) => {
    expect(isEmail(e)).toBe(true);
  });
  it.each(["a@b", "ab.com", "a b@c.com", "@b.com", "a@.com", ""])("invalid: %s", (e) => {
    expect(isEmail(e)).toBe(false);
  });
});

describe("isUsername", () => {
  it.each(["ab", "a-b", "User123", "a-b-c"])("valid: %s", (u) => {
    expect(isUsername(u)).toBe(true);
  });
  it.each(["a", "-ab", "ab-", "a--b", "a_b", "한글", ""])("invalid: %s", (u) => {
    expect(isUsername(u)).toBe(false);
  });
  it("length boundaries", () => {
    expect(isUsername("a".repeat(30))).toBe(true);
    expect(isUsername("a".repeat(31))).toBe(false);
  });
});

describe("passwordChecks", () => {
  it("all conditions met", () => {
    expect(passwordChecks("Abcdef1!")).toMatchObject({
      length: true,
      upper: true,
      lower: true,
      digit: true,
      special: true,
      all: true,
    });
  });
  it("missing uppercase", () => {
    const r = passwordChecks("abcdef1!");
    expect(r.upper).toBe(false);
    expect(r.all).toBe(false);
  });
  it("missing lowercase", () => {
    expect(passwordChecks("ABCDEF1!").lower).toBe(false);
  });
  it("missing digit", () => {
    expect(passwordChecks("Abcdefg!").digit).toBe(false);
  });
  it("missing special", () => {
    expect(passwordChecks("Abcdefg1").special).toBe(false);
  });
  it("too short (7 chars)", () => {
    const r = passwordChecks("Abcde1!");
    expect(r.length).toBe(false);
    expect(r.all).toBe(false);
  });
});
