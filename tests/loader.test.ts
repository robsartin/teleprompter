import { describe, it, expect } from "vitest";
import { parseScriptUrl, isValidUrl } from "../src/loader";

describe("parseScriptUrl", () => {
  it("extracts script URL from query string", () => {
    expect(parseScriptUrl("?script=https://example.com/speech.txt")).toBe("https://example.com/speech.txt");
  });

  it("returns null when no script param", () => {
    expect(parseScriptUrl("?other=value")).toBeNull();
  });

  it("returns null for empty query string", () => {
    expect(parseScriptUrl("")).toBeNull();
  });

  it("returns null when script param is empty", () => {
    expect(parseScriptUrl("?script=")).toBeNull();
  });

  it("handles encoded URLs", () => {
    expect(parseScriptUrl("?script=https%3A%2F%2Fexample.com%2Ftest.txt")).toBe("https://example.com/test.txt");
  });
});

describe("isValidUrl", () => {
  it("accepts https URLs", () => {
    expect(isValidUrl("https://example.com/file.txt")).toBe(true);
  });

  it("accepts http URLs", () => {
    expect(isValidUrl("http://example.com/file.txt")).toBe(true);
  });

  it("rejects non-http protocols", () => {
    expect(isValidUrl("ftp://example.com")).toBe(false);
  });

  it("rejects plain text", () => {
    expect(isValidUrl("not a url")).toBe(false);
  });

  it("rejects empty string", () => {
    expect(isValidUrl("")).toBe(false);
  });
});
