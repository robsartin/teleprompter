import { describe, it, expect } from "vitest";
import { DEFAULT_SETTINGS } from "../src/storage";

describe("DEFAULT_SETTINGS", () => {
  it("has speedWpm of 150", () => {
    expect(DEFAULT_SETTINGS.speedWpm).toBe(150);
  });
});
