import { describe, it, expect } from "vitest";
import { encodeSettingsToParams } from "../src/settings-url";

describe("encodeSettingsToParams", () => {
  it("encodes speed only", () => {
    expect(encodeSettingsToParams({ speedWpm: 180 })).toBe("?speed=180");
  });

  it("encodes speed and script URL", () => {
    const result = encodeSettingsToParams({ speedWpm: 200, scriptUrl: "https://example.com/speech.txt" });
    expect(result).toBe("?speed=200&script=https%3A%2F%2Fexample.com%2Fspeech.txt");
  });

  it("omits script param when scriptUrl is undefined", () => {
    const result = encodeSettingsToParams({ speedWpm: 150 });
    expect(result).not.toContain("script");
  });
});
