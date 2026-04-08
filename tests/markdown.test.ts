import { describe, it, expect } from "vitest";
import { parseLine, isHeading } from "../src/markdown";
import type { Token } from "../src/markdown";

describe("parseLine", () => {
  it("returns plain text as a single token", () => {
    const tokens = parseLine("hello world");
    expect(tokens).toEqual([{ text: "hello world" }]);
  });

  it("parses **bold** text", () => {
    const tokens = parseLine("this is **bold** text");
    expect(tokens).toEqual([
      { text: "this is " },
      { text: "bold", bold: true },
      { text: " text" },
    ]);
  });

  it("parses *italic* text", () => {
    const tokens = parseLine("this is *italic* text");
    expect(tokens).toEqual([
      { text: "this is " },
      { text: "italic", italic: true },
      { text: " text" },
    ]);
  });

  it("parses mixed bold and italic", () => {
    const tokens = parseLine("**bold** and *italic*");
    expect(tokens).toEqual([
      { text: "bold", bold: true },
      { text: " and " },
      { text: "italic", italic: true },
    ]);
  });

  it("returns empty array for empty string", () => {
    const tokens = parseLine("");
    expect(tokens).toEqual([]);
  });
});

describe("isHeading", () => {
  it("returns true for lines starting with '# '", () => {
    expect(isHeading("# Introduction")).toBe(true);
  });

  it("returns false for plain text", () => {
    expect(isHeading("hello world")).toBe(false);
  });

  it("returns false for lines with # not at start", () => {
    expect(isHeading("not a # heading")).toBe(false);
  });

  it("returns false for # without space after", () => {
    expect(isHeading("#nospace")).toBe(false);
  });

  it("returns false for empty string", () => {
    expect(isHeading("")).toBe(false);
  });
});
