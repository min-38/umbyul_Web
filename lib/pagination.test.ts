import { describe, it, expect } from "vitest";
import { totalPagesFor, pageWindow } from "./pagination";

describe("totalPagesFor", () => {
  it("total 0 → 1 page", () => expect(totalPagesFor(0, 10)).toBe(1));
  it("exact multiple", () => expect(totalPagesFor(30, 10)).toBe(3));
  it("rounds up", () => expect(totalPagesFor(31, 10)).toBe(4));
});

describe("pageWindow", () => {
  it("small range unclamped", () => expect(pageWindow(1, 3)).toEqual([1, 2, 3]));
  it("start clamp (5-window)", () => expect(pageWindow(1, 100)).toEqual([1, 2, 3, 4, 5]));
  it("middle window ±2", () => expect(pageWindow(10, 20)).toEqual([8, 9, 10, 11, 12]));
  // 특성화: 끝에서는 from=page-2, to=totalPages라 윈도우가 줄어듦(시작쪽 백필과 비대칭).
  it("end shrinks (no backfill)", () => expect(pageWindow(100, 100)).toEqual([98, 99, 100]));
});
