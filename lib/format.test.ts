import { describe, it, expect, vi, afterEach } from "vitest";
import { formatDuration, formatTotalDuration, formatReleaseDate, dateLocale, formatRelativeTime } from "./format";

// QA7-3: format.ts (100% 순수, 그동안 0% 커버).
describe("formatDuration", () => {
  it.each([
    [0, "0:00"],
    [-5, "0:00"],
    [1000, "0:01"],
    [61000, "1:01"],
    [238000, "3:58"],
    [59500, "1:00"], // 59.5s 반올림 → 60s
  ])("%i ms → %s", (ms, expected) => expect(formatDuration(ms)).toBe(expected));
});

describe("formatTotalDuration", () => {
  it("under an hour", () => expect(formatTotalDuration([180000, 60000])).toBe("4:00"));
  it("zero-pads minutes past an hour", () => expect(formatTotalDuration([3750000])).toBe("1:02:30"));
  it("empty → 0:00", () => expect(formatTotalDuration([])).toBe("0:00"));
});

describe("formatReleaseDate", () => {
  it.each([
    ["2023-07-07", "2023.07.07"],
    ["2023-07", "2023.07"],
    ["2023", "2023"],
  ])("%s → %s", (d, e) => expect(formatReleaseDate(d)).toBe(e));
  it("null → -", () => expect(formatReleaseDate(null)).toBe("-"));
});

describe("dateLocale", () => {
  it.each([
    ["ko", "ko-KR"],
    ["en", "en-US"],
    ["ja", "ja-JP"],
    ["es", "es-ES"],
    ["xx", "en-US"], // 미지원 → en-US
  ])("%s → %s", (l, e) => expect(dateLocale(l)).toBe(e));
});

describe("formatRelativeTime", () => {
  afterEach(() => vi.useRealTimers());
  const fix = (iso: string) => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(iso));
  };

  it("invalid ISO → empty", () => expect(formatRelativeTime("not-a-date")).toBe(""));

  it("under a minute → now", () => {
    fix("2023-01-01T00:00:30Z");
    expect(formatRelativeTime("2023-01-01T00:00:00Z", "en")).toBe("just now");
  });
  it("minutes", () => {
    fix("2023-01-01T00:05:00Z");
    expect(formatRelativeTime("2023-01-01T00:00:00Z", "en")).toBe("5m ago");
  });
  it("hours", () => {
    fix("2023-01-01T03:00:00Z");
    expect(formatRelativeTime("2023-01-01T00:00:00Z", "en")).toBe("3h ago");
  });
  it("days", () => {
    fix("2023-01-04T00:00:00Z");
    expect(formatRelativeTime("2023-01-01T00:00:00Z", "en")).toBe("3d ago");
  });
  it("weeks", () => {
    fix("2023-01-15T00:00:00Z");
    expect(formatRelativeTime("2023-01-01T00:00:00Z", "en")).toBe("2w ago");
  });
  it("30+ days → absolute date (contains year)", () => {
    fix("2023-03-01T00:00:00Z");
    expect(formatRelativeTime("2023-01-01T00:00:00Z", "en")).toContain("2023");
  });
});
