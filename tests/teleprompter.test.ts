import { describe, it, expect } from "vitest";
import {
  SAMPLE_TEXT,
  createState,
  toggleScrolling,
  setSpeed,
  tick,
  visibleText,
  progress,
  restart,
  charsPerTick,
  isFinished,
  MAX_TEXT_LENGTH,
} from "../src/teleprompter";

describe("createState", () => {
  it("uses sample text by default", () => {
    expect(createState().text).toBe(SAMPLE_TEXT);
  });

  it("accepts custom text", () => {
    expect(createState("Custom").text).toBe("Custom");
  });

  it("starts paused", () => {
    expect(createState().scrolling).toBe(false);
  });

  it("defaults to 150 WPM", () => {
    expect(createState().speedWpm).toBe(150);
  });

  it("starts at charOffset 0", () => {
    expect(createState().charOffset).toBe(0);
  });
});

describe("toggleScrolling", () => {
  it("toggles paused to scrolling", () => {
    expect(toggleScrolling(createState()).scrolling).toBe(true);
  });

  it("toggles back to paused", () => {
    expect(toggleScrolling(toggleScrolling(createState())).scrolling).toBe(false);
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

describe("charsPerTick", () => {
  it("returns positive value", () => {
    expect(charsPerTick(150)).toBeGreaterThan(0);
  });

  it("scales with speed", () => {
    expect(charsPerTick(200)).toBeGreaterThan(charsPerTick(100));
  });
});

describe("tick", () => {
  it("does not advance when paused", () => {
    const state = createState("Hello");
    expect(tick(state).charOffset).toBe(0);
  });

  it("advances when scrolling", () => {
    let state = toggleScrolling(createState("Hello, this is a longer text for testing."));
    state = tick(state);
    expect(state.charOffset).toBeGreaterThan(0);
  });

  it("does not exceed text length", () => {
    let state = toggleScrolling(createState("Hi"));
    for (let i = 0; i < 100000; i++) state = tick(state);
    expect(state.charOffset).toBeLessThanOrEqual(state.text.length);
  });
});

describe("visibleText", () => {
  it("returns text from current offset", () => {
    const state = { ...createState("ABCDEF"), charOffset: 2 };
    expect(visibleText(state)).toBe("CDEF");
  });

  it("truncates to MAX_TEXT_LENGTH", () => {
    const longText = "x".repeat(5000);
    const state = createState(longText);
    expect(visibleText(state).length).toBe(MAX_TEXT_LENGTH);
  });
});

describe("progress", () => {
  it("is 0 at start", () => {
    expect(progress(createState("Hello"))).toBe(0);
  });

  it("is 100 at end", () => {
    const state = { ...createState("Hi"), charOffset: 2 };
    expect(progress(state)).toBe(100);
  });

  it("is 100 for empty text", () => {
    expect(progress(createState(""))).toBe(100);
  });
});

describe("restart", () => {
  it("resets offset to 0", () => {
    const state = { ...createState("Hello"), charOffset: 3, scrolling: true };
    expect(restart(state).charOffset).toBe(0);
  });

  it("pauses scrolling", () => {
    const state = { ...createState("Hello"), scrolling: true };
    expect(restart(state).scrolling).toBe(false);
  });
});

describe("isFinished", () => {
  it("false at start", () => {
    expect(isFinished(createState("Hello"))).toBe(false);
  });

  it("true when offset reaches text length", () => {
    const state = { ...createState("Hi"), charOffset: 2 };
    expect(isFinished(state)).toBe(true);
  });
});
