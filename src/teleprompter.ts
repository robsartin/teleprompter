/**
 * Core teleprompter logic — pure functions, no SDK dependency.
 */

export const SAMPLE_TEXT = "Hello, world.";

/** Glasses display dimensions. */
export const DISPLAY_WIDTH = 576;
export const DISPLAY_HEIGHT = 288;

/** Max characters per text container upgrade. */
export const MAX_TEXT_LENGTH = 2000;

export interface TeleprompterState {
  text: string;
  scrolling: boolean;
  speedWpm: number;
  /** Current character offset into the text. */
  charOffset: number;
}

export function createState(text: string = SAMPLE_TEXT): TeleprompterState {
  return {
    text,
    scrolling: false,
    speedWpm: 150,
    charOffset: 0,
  };
}

export function toggleScrolling(state: TeleprompterState): TeleprompterState {
  return { ...state, scrolling: !state.scrolling };
}

export function setSpeed(state: TeleprompterState, wpm: number): TeleprompterState {
  return { ...state, speedWpm: Math.max(10, wpm) };
}

export function restart(state: TeleprompterState): TeleprompterState {
  return { ...state, charOffset: 0, scrolling: false };
}

/**
 * Characters to advance per tick at 60fps for a given WPM.
 * Assumes ~5 characters per word.
 */
export function charsPerTick(speedWpm: number): number {
  const charsPerSecond = (speedWpm * 5) / 60;
  return charsPerSecond / 60;
}

/**
 * Advance the state by one tick. Returns new state with updated charOffset.
 */
export function tick(state: TeleprompterState): TeleprompterState {
  if (!state.scrolling) return state;
  const newOffset = Math.min(state.charOffset + charsPerTick(state.speedWpm), state.text.length);
  return { ...state, charOffset: newOffset };
}

/**
 * Get the visible text chunk for the current offset.
 * Returns up to MAX_TEXT_LENGTH characters starting from charOffset.
 */
export function visibleText(state: TeleprompterState): string {
  const start = Math.floor(state.charOffset);
  return state.text.slice(start, start + MAX_TEXT_LENGTH);
}

/**
 * Progress through the script as a percentage (0–100).
 */
export function progress(state: TeleprompterState): number {
  if (state.text.length === 0) return 100;
  return Math.min(100, Math.round((state.charOffset / state.text.length) * 100));
}

/**
 * Whether the script has reached the end.
 */
export function isFinished(state: TeleprompterState): boolean {
  return Math.floor(state.charOffset) >= state.text.length;
}
