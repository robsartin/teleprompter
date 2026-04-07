import { describe, it, expect } from "vitest";
import {
  DEFAULT_SETTINGS,
  STORAGE_KEY,
  serializeSettings,
  deserializeSettings,
  mergeSettings,
} from "../src/storage";

describe("DEFAULT_SETTINGS", () => {
  it("has speedWpm of 150", () => {
    expect(DEFAULT_SETTINGS.speedWpm).toBe(150);
  });
});

describe("STORAGE_KEY", () => {
  it("is teleprompter-settings", () => {
    expect(STORAGE_KEY).toBe("teleprompter-settings");
  });
});

describe("serializeSettings", () => {
  it("returns JSON string of settings", () => {
    expect(serializeSettings({ speedWpm: 200 })).toBe('{"speedWpm":200}');
  });
});

describe("deserializeSettings", () => {
  it("parses valid JSON into Settings", () => {
    expect(deserializeSettings('{"speedWpm":200}')).toEqual({ speedWpm: 200 });
  });

  it("returns DEFAULT_SETTINGS for invalid JSON", () => {
    expect(deserializeSettings("not json")).toEqual(DEFAULT_SETTINGS);
  });

  it("returns DEFAULT_SETTINGS for empty string", () => {
    expect(deserializeSettings("")).toEqual(DEFAULT_SETTINGS);
  });

  it("returns DEFAULT_SETTINGS when speedWpm is not a number", () => {
    expect(deserializeSettings('{"speedWpm":"fast"}')).toEqual(DEFAULT_SETTINGS);
  });
});

describe("mergeSettings", () => {
  it("uses saved value when present", () => {
    expect(mergeSettings({ speedWpm: 200 }, DEFAULT_SETTINGS)).toEqual({ speedWpm: 200 });
  });

  it("falls back to defaults for missing keys", () => {
    expect(mergeSettings({}, DEFAULT_SETTINGS)).toEqual(DEFAULT_SETTINGS);
  });
});

describe("round-trip", () => {
  it("serialize then deserialize returns original settings", () => {
    const settings = { speedWpm: 275 };
    expect(deserializeSettings(serializeSettings(settings))).toEqual(settings);
  });
});
