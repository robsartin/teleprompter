/**
 * Core teleprompter logic — pure functions, no SDK dependency.
 */

export const SAMPLE_TEXT = `Four score and seven years ago our fathers brought forth on this continent, a new nation, conceived in Liberty, and dedicated to the proposition that all men are created equal.

Now we are engaged in a great civil war, testing whether that nation, or any nation so conceived and so dedicated, can long endure. We are met on a great battle-field of that war. We have come to dedicate a portion of that field, as a final resting place for those who here gave their lives that that nation might live. It is altogether fitting and proper that we should do this.

But, in a larger sense, we can not dedicate — we can not consecrate — we can not hallow — this ground. The brave men, living and dead, who struggled here, have consecrated it, far above our poor power to add or detract. The world will little note, nor long remember what we say here, but it can never forget what they did here. It is for us the living, rather, to be dedicated here to the unfinished work which they who fought here have thus far so nobly advanced. It is rather for us to be here dedicated to the great task remaining before us — that from these honored dead we take increased devotion to that cause for which they gave the last full measure of devotion — that we here highly resolve that these dead shall not have died in vain — that this nation, under God, shall have a new birth of freedom — and that government of the people, by the people, for the people, shall not perish from the earth.`;

/** Glasses display dimensions. */
export const DISPLAY_WIDTH = 576;
export const DISPLAY_HEIGHT = 288;

/** Max characters per text container upgrade. */
export const MAX_TEXT_LENGTH = 2000;

/** Default characters per line for word-wrapping. */
export const CHARS_PER_LINE = 40;

export interface TeleprompterState {
  lines: string[];
  scrolling: boolean;
  speedWpm: number;
  /** Current line index (top visible line). */
  lineIndex: number;
  /** Fractional accumulator for sub-line ticks. */
  _lineFrac: number;
}

/**
 * Word-wrap text into lines of at most `width` characters.
 * Preserves paragraph breaks (empty lines).
 */
export function wrapText(text: string, width: number = CHARS_PER_LINE): string[] {
  const result: string[] = [];
  for (const paragraph of text.split("\n")) {
    if (paragraph.trim() === "") {
      result.push("");
      continue;
    }
    const words = paragraph.split(/\s+/);
    let line = "";
    for (const word of words) {
      if (line.length === 0) {
        line = word;
      } else if (line.length + 1 + word.length <= width) {
        line += " " + word;
      } else {
        result.push(line);
        line = word;
      }
    }
    if (line.length > 0) result.push(line);
  }
  return result;
}

export function createState(text: string = SAMPLE_TEXT): TeleprompterState {
  return {
    lines: wrapText(text),
    scrolling: false,
    speedWpm: 150,
    lineIndex: 0,
    _lineFrac: 0,
  };
}

export function toggleScrolling(state: TeleprompterState): TeleprompterState {
  return { ...state, scrolling: !state.scrolling };
}

export function setSpeed(state: TeleprompterState, wpm: number): TeleprompterState {
  return { ...state, speedWpm: Math.max(10, wpm) };
}

export function restart(state: TeleprompterState): TeleprompterState {
  return { ...state, lineIndex: 0, _lineFrac: 0, scrolling: false };
}

/**
 * Lines to advance per tick at 60fps for a given WPM.
 * Assumes ~6 words per line at CHARS_PER_LINE width.
 */
export function linesPerTick(speedWpm: number): number {
  const linesPerSecond = speedWpm / 60 / 6;
  return linesPerSecond / 60;
}

/**
 * Advance the state by one tick. Moves to the next line when enough
 * fractional ticks have accumulated.
 */
export function tick(state: TeleprompterState): TeleprompterState {
  if (!state.scrolling) return state;
  const maxLine = state.lines.length - 1;
  if (state.lineIndex >= maxLine) return { ...state, scrolling: false };

  const newFrac = state._lineFrac + linesPerTick(state.speedWpm);
  const wholeLines = Math.floor(newFrac);
  const remainder = newFrac - wholeLines;
  const newIndex = Math.min(state.lineIndex + wholeLines, maxLine);

  return { ...state, lineIndex: newIndex, _lineFrac: remainder };
}

/**
 * Get the visible lines starting from the current lineIndex.
 * Returns up to `count` lines.
 */
export function visibleLines(state: TeleprompterState, count: number = 8): string[] {
  return state.lines.slice(state.lineIndex, state.lineIndex + count);
}

/**
 * Get visible text as a single string (for glasses text container).
 */
export function visibleText(state: TeleprompterState, lineCount: number = 8): string {
  return visibleLines(state, lineCount).join("\n");
}

/**
 * Progress through the script as a percentage (0–100).
 */
export function progress(state: TeleprompterState): number {
  if (state.lines.length <= 1) return 100;
  return Math.min(100, Math.round((state.lineIndex / (state.lines.length - 1)) * 100));
}

export interface AnnotatedLine {
  text: string;
  isCurrent: boolean;
}

/**
 * Get visible lines annotated with whether each is the current line.
 * The first line (at lineIndex) has isCurrent: true; the rest are false.
 */
export function annotatedLines(state: TeleprompterState, count: number = 8): AnnotatedLine[] {
  return visibleLines(state, count).map((text, i) => ({
    text,
    isCurrent: i === 0,
  }));
}

/**
 * Whether the script has reached the last line.
 */
export function isFinished(state: TeleprompterState): boolean {
  return state.lineIndex >= state.lines.length - 1;
}
