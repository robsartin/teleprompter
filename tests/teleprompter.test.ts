import { describe, it, expect } from "vitest";
import {
  SAMPLE_TEXT,
  CHARS_PER_LINE,
  createState,
  toggleScrolling,
  setSpeed,
  tick,
  visibleLines,
  visibleText,
  progress,
  restart,
  linesPerTick,
  isFinished,
  wrapText,
  annotatedLines,
  startCountdown,
  countdownText,
} from "../src/teleprompter";
import type { AnnotatedLine } from "../src/teleprompter";

describe("wrapText", () => {
  it("wraps long lines at word boundaries", () => {
    const lines = wrapText("one two three four five six", 10);
    for (const line of lines) {
      expect(line.length).toBeLessThanOrEqual(10);
    }
  });

  it("preserves empty lines for paragraph breaks", () => {
    const lines = wrapText("hello\n\nworld", 40);
    expect(lines).toEqual(["hello", "", "world"]);
  });

  it("keeps short lines intact", () => {
    expect(wrapText("hi", 40)).toEqual(["hi"]);
  });
});

describe("createState", () => {
  it("wraps sample text into lines", () => {
    const state = createState();
    expect(state.lines.length).toBeGreaterThan(1);
    expect(state.lines[0]).toBeTruthy();
  });

  it("accepts custom text", () => {
    const state = createState("Custom");
    expect(state.lines).toEqual(["Custom"]);
  });

  it("starts paused", () => {
    expect(createState().scrolling).toBe(false);
  });

  it("defaults to 150 WPM", () => {
    expect(createState().speedWpm).toBe(150);
  });

  it("starts at line 0", () => {
    expect(createState().lineIndex).toBe(0);
  });

  it("starts with countdown at 0", () => {
    expect(createState().countdown).toBe(0);
  });
});

describe("toggleScrolling", () => {
  it("toggles paused to scrolling", () => {
    expect(toggleScrolling(createState()).scrolling).toBe(true);
  });

  it("toggles back to paused", () => {
    expect(toggleScrolling(toggleScrolling(createState())).scrolling).toBe(false);
  });

  it("cancels countdown when countdown > 0 (scrolling stays false)", () => {
    const state = { ...createState("Hello"), countdown: 2 };
    const result = toggleScrolling(state);
    expect(result.countdown).toBe(0);
    expect(result.scrolling).toBe(false);
  });
});

describe("setSpeed", () => {
  it("sets speed", () => {
    expect(setSpeed(createState(), 200).speedWpm).toBe(200);
  });

  it("enforces minimum of 10 WPM", () => {
    expect(setSpeed(createState(), 5).speedWpm).toBe(10);
  });
});

describe("linesPerTick", () => {
  it("returns positive value", () => {
    expect(linesPerTick(150)).toBeGreaterThan(0);
  });

  it("scales with speed", () => {
    expect(linesPerTick(200)).toBeGreaterThan(linesPerTick(100));
  });
});

describe("tick", () => {
  it("does not advance when paused", () => {
    const state = createState("Hello world line one\nLine two");
    expect(tick(state).lineIndex).toBe(0);
  });

  it("advances lines when scrolling", () => {
    let state = toggleScrolling(createState(SAMPLE_TEXT));
    for (let i = 0; i < 10000; i++) state = tick(state);
    expect(state.lineIndex).toBeGreaterThan(0);
  });

  it("decrements countdown when countdown > 0", () => {
    const state = { ...createState("Hello"), countdown: 3 };
    const result = tick(state);
    expect(result.countdown).toBeCloseTo(3 - 1 / 60, 10);
  });

  it("does not scroll while countdown is active", () => {
    const state = { ...createState("Hello"), countdown: 3 };
    const result = tick(state);
    expect(result.lineIndex).toBe(0);
    expect(result.scrolling).toBe(false);
  });

  it("starts scrolling when countdown crosses 0", () => {
    const state = { ...createState("Hello"), countdown: 1 / 120 };
    const result = tick(state);
    expect(result.countdown).toBe(0);
    expect(result.scrolling).toBe(true);
  });

  it("does not exceed last line", () => {
    let state = toggleScrolling(createState("line1\nline2\nline3"));
    for (let i = 0; i < 100000; i++) state = tick(state);
    expect(state.lineIndex).toBeLessThanOrEqual(state.lines.length - 1);
  });

  it("stops scrolling at the end", () => {
    let state = toggleScrolling(createState("line1\nline2"));
    for (let i = 0; i < 100000; i++) state = tick(state);
    expect(state.scrolling).toBe(false);
  });
});

describe("visibleLines", () => {
  it("returns lines from current index", () => {
    const state = { ...createState("a\nb\nc\nd\ne"), lineIndex: 1, _lineFrac: 0 };
    const lines = visibleLines(state, 3);
    expect(lines[0]).toBe("b");
    expect(lines.length).toBe(3);
  });
});

describe("visibleText", () => {
  it("joins visible lines with newlines", () => {
    const state = createState("line1\nline2\nline3");
    expect(visibleText(state, 2)).toBe("line1\nline2");
  });
});

describe("progress", () => {
  it("is 0 at start", () => {
    expect(progress(createState(SAMPLE_TEXT))).toBe(0);
  });

  it("is 100 at last line", () => {
    const state = createState("a\nb\nc");
    expect(progress({ ...state, lineIndex: state.lines.length - 1, _lineFrac: 0 })).toBe(100);
  });

  it("is 100 for single-line text", () => {
    expect(progress(createState("Hello"))).toBe(100);
  });
});

describe("restart", () => {
  it("resets lineIndex to 0", () => {
    const state = { ...createState(SAMPLE_TEXT), lineIndex: 5, _lineFrac: 0.5, scrolling: true };
    const restarted = restart(state);
    expect(restarted.lineIndex).toBe(0);
    expect(restarted._lineFrac).toBe(0);
  });

  it("pauses scrolling", () => {
    const state = { ...createState(SAMPLE_TEXT), scrolling: true };
    expect(restart(state).scrolling).toBe(false);
  });

  it("resets countdown", () => {
    const state = { ...createState(SAMPLE_TEXT), countdown: 2 };
    expect(restart(state).countdown).toBe(0);
  });
});

describe("startCountdown", () => {
  it("sets countdown to given seconds", () => {
    expect(startCountdown(createState("Hello"), 3).countdown).toBe(3);
  });

  it("defaults to 3 seconds", () => {
    expect(startCountdown(createState("Hello")).countdown).toBe(3);
  });

  it("sets scrolling to false", () => {
    const state = { ...createState("Hello"), scrolling: true };
    expect(startCountdown(state, 3).scrolling).toBe(false);
  });
});

describe("countdownText", () => {
  it("returns null when countdown is 0", () => {
    expect(countdownText(createState("Hello"))).toBeNull();
  });

  it("returns '3' when countdown is between 2 and 3", () => {
    expect(countdownText({ ...createState("Hello"), countdown: 2.5 })).toBe("3");
  });

  it("returns '2' when countdown is between 1 and 2", () => {
    expect(countdownText({ ...createState("Hello"), countdown: 1.5 })).toBe("2");
  });

  it("returns '1' when countdown is between 0 and 1", () => {
    expect(countdownText({ ...createState("Hello"), countdown: 0.5 })).toBe("1");
  });

  it("returns '3' when countdown is exactly 3", () => {
    expect(countdownText({ ...createState("Hello"), countdown: 3 })).toBe("3");
  });
});

describe("isFinished", () => {
  it("false at start", () => {
    expect(isFinished(createState(SAMPLE_TEXT))).toBe(false);
  });

  it("true at last line", () => {
    const state = createState("a\nb");
    expect(isFinished({ ...state, lineIndex: state.lines.length - 1, _lineFrac: 0 })).toBe(true);
  });
});

describe("annotatedLines", () => {
  it("marks the first line as current", () => {
    const state = createState("a\nb\nc\nd\ne");
    const result: AnnotatedLine[] = annotatedLines(state, 3);
    expect(result[0]).toEqual({ text: "a", isCurrent: true });
  });

  it("marks remaining lines as not current", () => {
    const state = createState("a\nb\nc\nd\ne");
    const result = annotatedLines(state, 3);
    expect(result[1]).toEqual({ text: "b", isCurrent: false });
    expect(result[2]).toEqual({ text: "c", isCurrent: false });
  });

  it("returns up to count lines", () => {
    const state = createState("a\nb\nc\nd\ne");
    expect(annotatedLines(state, 3).length).toBe(3);
  });

  it("respects lineIndex offset", () => {
    const state = { ...createState("a\nb\nc\nd\ne"), lineIndex: 2, _lineFrac: 0 };
    const result = annotatedLines(state, 2);
    expect(result[0]).toEqual({ text: "c", isCurrent: true });
    expect(result[1]).toEqual({ text: "d", isCurrent: false });
  });

  it("returns fewer lines when near end of text", () => {
    const state = { ...createState("a\nb\nc"), lineIndex: 2, _lineFrac: 0 };
    const result = annotatedLines(state, 5);
    expect(result.length).toBe(1);
    expect(result[0]).toEqual({ text: "c", isCurrent: true });
  });
});
