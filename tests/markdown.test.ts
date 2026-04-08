import { describe, it, expect } from "vitest";
import { parseLine, isHeading, stripMarkdown, stripAllMarkdown } from "../src/markdown";
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

describe("stripMarkdown", () => {
  it("removes **bold** markers", () => {
    expect(stripMarkdown("this is **bold** text")).toBe("this is bold text");
  });

  it("removes *italic* markers", () => {
    expect(stripMarkdown("this is *italic* text")).toBe("this is italic text");
  });

  it("removes heading prefix", () => {
    expect(stripMarkdown("# Introduction")).toBe("Introduction");
  });

  it("returns plain text unchanged", () => {
    expect(stripMarkdown("hello world")).toBe("hello world");
  });

  it("handles mixed markdown", () => {
    expect(stripMarkdown("# **Bold** and *italic*")).toBe("Bold and italic");
  });

  it("returns empty string for empty input", () => {
    expect(stripMarkdown("")).toBe("");
  });
});

describe("stripAllMarkdown", () => {
  it("strips markdown from all lines", () => {
    const lines = ["# Title", "**bold** text", "*italic* words", "plain"];
    expect(stripAllMarkdown(lines)).toEqual([
      "Title",
      "bold text",
      "italic words",
      "plain",
    ]);
  });

  it("returns empty array for empty input", () => {
    expect(stripAllMarkdown([])).toEqual([]);
  });

  it("preserves empty lines", () => {
    const lines = ["# Heading", "", "body"];
    expect(stripAllMarkdown(lines)).toEqual(["Heading", "", "body"]);
  });
});
