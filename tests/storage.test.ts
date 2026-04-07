import { describe, it, expect } from "vitest";
import { DEFAULT_SETTINGS, serializeSettings } from "../src/storage";

describe("DEFAULT_SETTINGS", () => {
  it("has speedWpm of 150", () => {
    expect(DEFAULT_SETTINGS.speedWpm).toBe(150);
  });
});

describe("serializeSettings", () => {
  it("returns JSON string of settings", () => {
    expect(serializeSettings({ speedWpm: 200 })).toBe('{"speedWpm":200}');
  });
});
