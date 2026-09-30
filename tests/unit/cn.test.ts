import { describe, expect, it } from "vitest";
import { cn } from "@/lib/cn";

describe("cn", () => {
  it("lets later classes override earlier ones for the same property", () => {
    expect(cn("inline-flex px-4", "hidden px-3 sm:inline-flex")).toBe("hidden px-3 sm:inline-flex");
  });

  it("keeps custom font sizes and text colors apart", () => {
    expect(cn("text-reading text-ink")).toBe("text-reading text-ink");
    expect(cn("text-base", "text-heading")).toBe("text-heading");
  });

  it("skips falsy values", () => {
    expect(cn("a", false, null, undefined, "b")).toBe("a b");
  });
});
