/**
 * Settings persistence — pure functions, no side effects.
 */

export interface Settings {
  speedWpm: number;
}

export const DEFAULT_SETTINGS: Settings = { speedWpm: 150 };
