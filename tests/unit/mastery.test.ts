import { describe, expect, it } from "vitest";
import { clampScore, masteryLevel } from "@/lib/mastery";

describe("masteryLevel", () => {
  it.each([
    [0, "needs_work"],
    [39, "needs_work"],
    [40, "learning"],
    [69, "learning"],
    [70, "strong"],
    [89, "strong"],
    [90, "mastered"],
    [100, "mastered"],
  ])("%d is %s", (score, level) => {
    expect(masteryLevel(score)).toBe(level);
  });

  it("handles values outside 0 to 100", () => {
    expect(masteryLevel(-5)).toBe("needs_work");
    expect(masteryLevel(250)).toBe("mastered");
    expect(masteryLevel(Number.NaN)).toBe("needs_work");
  });
});

describe("clampScore", () => {
  it("rounds and clamps", () => {
    expect(clampScore(39.6)).toBe(40);
    expect(clampScore(-1)).toBe(0);
    expect(clampScore(101)).toBe(100);
    expect(clampScore(Number.POSITIVE_INFINITY)).toBe(0);
  });
});
