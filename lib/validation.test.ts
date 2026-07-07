import { describe, it, expect } from "vitest";
import { isEmail, isUsername, passwordChecks, safeHttpUrl, safeSpotifyImageUrl, safeInternalPath } from "./validation";

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

describe("safeHttpUrl", () => {
  it.each([
    "https://open.spotify.com/playlist/abc",
    "http://example.com",
    "https://youtu.be/xyz?t=10",
    "  https://example.com/path  ",
  ])("passes http(s): %s", (u) => {
    expect(safeHttpUrl(u)).not.toBeNull();
  });
  it.each([
    "javascript:alert(1)",
    "JavaScript:alert(1)",
    "java\tscript:alert(1)",
    "data:text/html,<script>alert(1)</script>",
    "vbscript:msgbox(1)",
    "//evil.com",
    "/relative",
    "ftp://host/file",
    "",
    null,
    undefined,
  ])("blocks non-http(s): %s", (u) => {
    expect(safeHttpUrl(u as string)).toBeNull();
  });
});

describe("safeSpotifyImageUrl", () => {
  it.each([
    "https://i.scdn.co/image/ab67616d0000b273abcdef",
    "https://mosaic.scdn.co/640/abc",
    "https://image-cdn-ak.spotifycdn.com/image/abc",
  ])("passes Spotify CDN: %s", (u) => {
    expect(safeSpotifyImageUrl(u)).not.toBeNull();
  });
  it.each([
    "https://evil.com/x.png",
    "http://i.scdn.co/image/abc", // http (not https)
    "https://i.scdn.co.evil.com/x", // suffix spoof
    "javascript:alert(1)",
    "",
    null,
  ])("blocks non-Spotify: %s", (u) => {
    expect(safeSpotifyImageUrl(u as string)).toBeNull();
  });
});

describe("safeInternalPath", () => {
  it.each(["/", "/mixes", "/u/name?tab=sets"])("passes internal: %s", (p) => {
    expect(safeInternalPath(p)).toBe(p);
  });
  it.each(["//evil.com", "/\\evil.com", "https://evil.com", "evil", "", null, undefined])(
    "falls back for: %s",
    (p) => {
      expect(safeInternalPath(p as string)).toBe("/");
    },
  );
  it("uses custom fallback", () => {
    expect(safeInternalPath("//evil.com", "/login")).toBe("/login");
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
