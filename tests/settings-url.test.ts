import { describe, it, expect } from "vitest";
import { encodeSettingsToParams, decodeSettingsFromParams, buildShareUrl } from "../src/settings-url";

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

describe("decodeSettingsFromParams", () => {
  it("decodes speed from query string", () => {
    expect(decodeSettingsFromParams("?speed=180")).toEqual({ speedWpm: 180 });
  });

  it("decodes speed and script URL", () => {
    expect(decodeSettingsFromParams("?speed=200&script=https%3A%2F%2Fexample.com%2Fspeech.txt")).toEqual({
      speedWpm: 200,
      scriptUrl: "https://example.com/speech.txt",
    });
  });

  it("returns empty object for no matching params", () => {
    expect(decodeSettingsFromParams("?other=value")).toEqual({});
  });

  it("returns empty object for empty string", () => {
    expect(decodeSettingsFromParams("")).toEqual({});
  });

  it("ignores non-numeric speed values", () => {
    expect(decodeSettingsFromParams("?speed=abc")).toEqual({});
  });

  it("omits scriptUrl when script param is empty", () => {
    expect(decodeSettingsFromParams("?speed=150&script=")).toEqual({ speedWpm: 150 });
  });
});

describe("buildShareUrl", () => {
  it("combines base URL with settings params", () => {
    expect(buildShareUrl("https://app.example.com", { speedWpm: 180 })).toBe(
      "https://app.example.com?speed=180",
    );
  });

  it("includes script URL when provided", () => {
    expect(
      buildShareUrl("https://app.example.com", { speedWpm: 200, scriptUrl: "https://example.com/speech.txt" }),
    ).toBe("https://app.example.com?speed=200&script=https%3A%2F%2Fexample.com%2Fspeech.txt");
  });

  it("strips trailing slash from base URL", () => {
    expect(buildShareUrl("https://app.example.com/", { speedWpm: 150 })).toBe(
      "https://app.example.com/?speed=150",
    );
  });
});
