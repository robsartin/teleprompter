import { describe, it, expect } from "vitest";
import { DISPLAY_WIDTH, DISPLAY_HEIGHT, CHARS_PER_LINE } from "../src/teleprompter";

describe("display constants", () => {
  it("DISPLAY_WIDTH is 576", () => {
    expect(DISPLAY_WIDTH).toBe(576);
  });

  it("DISPLAY_HEIGHT is 288", () => {
    expect(DISPLAY_HEIGHT).toBe(288);
  });

  it("CHARS_PER_LINE is 40", () => {
    expect(CHARS_PER_LINE).toBe(40);
  });
});

describe("viewport line count", () => {
  it("7 lines fit in 288px at 24px font with 1.6 line-height", () => {
    const lineHeight = 24 * 1.6;
    const visibleLines = Math.floor(DISPLAY_HEIGHT / lineHeight);
    expect(visibleLines).toBe(7);
  });
});
