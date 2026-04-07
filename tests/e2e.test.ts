// @vitest-environment jsdom

import { describe, it, expect } from "vitest";
import {
  SAMPLE_TEXT,
  createState,
  toggleScrolling,
  tick,
  visibleText,
  annotatedLines,
  restart,
} from "../src/teleprompter";

describe("E2E: createState produces correct initial lines from SAMPLE_TEXT", () => {
  it("creates lines from SAMPLE_TEXT that cover the full text content", () => {
    const state = createState(SAMPLE_TEXT);
    expect(state.lines.length).toBeGreaterThan(10);
    // First line should start with "Four score"
    expect(state.lines[0]).toMatch(/^Four score/);
    // Last line should end with content from the speech
    expect(state.lines[state.lines.length - 1]).toContain("earth.");
  });

  it("preserves paragraph breaks as empty lines", () => {
    const state = createState(SAMPLE_TEXT);
    const emptyLines = state.lines.filter((l) => l === "");
    expect(emptyLines.length).toBeGreaterThan(0);
  });
});

describe("E2E: annotatedLines marks first line as current", () => {
  it("first visible line is marked current at initial state", () => {
    const state = createState(SAMPLE_TEXT);
    const lines = annotatedLines(state);
    expect(lines[0].isCurrent).toBe(true);
    expect(lines[0].text).toMatch(/^Four score/);
  });

  it("after scrolling forward, new first line is still marked current", () => {
    let state = toggleScrolling(createState(SAMPLE_TEXT));
    for (let i = 0; i < 10000; i++) state = tick(state);
    const lines = annotatedLines(state);
    expect(lines[0].isCurrent).toBe(true);
    // Should have advanced past the first line
    expect(lines[0].text).not.toMatch(/^Four score/);
  });

  it("non-first visible lines are not marked current", () => {
    const state = createState(SAMPLE_TEXT);
    const lines = annotatedLines(state);
    for (let i = 1; i < lines.length; i++) {
      expect(lines[i].isCurrent).toBe(false);
    }
  });
});

describe("E2E: toggleScrolling changes state correctly", () => {
  it("transitions from paused to scrolling and back", () => {
    const initial = createState(SAMPLE_TEXT);
    expect(initial.scrolling).toBe(false);

    const scrolling = toggleScrolling(initial);
    expect(scrolling.scrolling).toBe(true);

    const paused = toggleScrolling(scrolling);
    expect(paused.scrolling).toBe(false);
  });

  it("preserves other state fields when toggling", () => {
    const initial = createState(SAMPLE_TEXT);
    const toggled = toggleScrolling(initial);
    expect(toggled.lines).toEqual(initial.lines);
    expect(toggled.speedWpm).toBe(initial.speedWpm);
    expect(toggled.lineIndex).toBe(initial.lineIndex);
  });
});

describe("E2E: visibleText changes after multiple ticks while scrolling", () => {
  it("visible text differs after sufficient ticks", () => {
    let state = toggleScrolling(createState(SAMPLE_TEXT));
    const initialText = visibleText(state);

    for (let i = 0; i < 50000; i++) state = tick(state);

    const laterText = visibleText(state);
    expect(laterText).not.toBe(initialText);
  });

  it("visible text stays the same when paused", () => {
    const state = createState(SAMPLE_TEXT);
    const initialText = visibleText(state);

    let tickedState = state;
    for (let i = 0; i < 1000; i++) tickedState = tick(tickedState);

    expect(visibleText(tickedState)).toBe(initialText);
  });
});

describe("E2E: restart brings state back to beginning", () => {
  it("resets to initial position after scrolling", () => {
    let state = toggleScrolling(createState(SAMPLE_TEXT));
    for (let i = 0; i < 10000; i++) state = tick(state);
    expect(state.lineIndex).toBeGreaterThan(0);

    const restarted = restart(state);
    expect(restarted.lineIndex).toBe(0);
    expect(restarted._lineFrac).toBe(0);
    expect(restarted.scrolling).toBe(false);
  });

  it("visible text matches initial text after restart", () => {
    const initial = createState(SAMPLE_TEXT);
    let state = toggleScrolling(initial);
    for (let i = 0; i < 10000; i++) state = tick(state);

    const restarted = restart(state);
    expect(visibleText(restarted)).toBe(visibleText(initial));
  });
});

describe("E2E: keyboard event simulation", () => {
  it("Space KeyboardEvent can be used to toggle scrolling", () => {
    let state = createState(SAMPLE_TEXT);
    expect(state.scrolling).toBe(false);

    const spaceEvent = new KeyboardEvent("keydown", { code: "Space" });
    expect(spaceEvent.code).toBe("Space");

    // Simulate what the app's keydown handler does
    if (spaceEvent.code === "Space") {
      state = toggleScrolling(state);
    }
    expect(state.scrolling).toBe(true);

    // Pressing space again pauses
    const spaceEvent2 = new KeyboardEvent("keydown", { code: "Space" });
    if (spaceEvent2.code === "Space") {
      state = toggleScrolling(state);
    }
    expect(state.scrolling).toBe(false);
  });

  it("KeyR KeyboardEvent can trigger restart", () => {
    let state = toggleScrolling(createState(SAMPLE_TEXT));
    for (let i = 0; i < 10000; i++) state = tick(state);
    expect(state.lineIndex).toBeGreaterThan(0);

    const rEvent = new KeyboardEvent("keydown", { code: "KeyR" });
    if (rEvent.code === "KeyR") {
      state = restart(state);
    }
    expect(state.lineIndex).toBe(0);
    expect(state.scrolling).toBe(false);
  });
});
