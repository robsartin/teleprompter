/**
 * Settings persistence — pure functions, no side effects.
 */

export interface Settings {
  speedWpm: number;
}

export const DEFAULT_SETTINGS: Settings = { speedWpm: 150 };

export const STORAGE_KEY = "teleprompter-settings";

export function serializeSettings(settings: Settings): string {
  return JSON.stringify(settings);
}

export function deserializeSettings(raw: string): Settings {
  try {
    const parsed = JSON.parse(raw);
    if (typeof parsed?.speedWpm !== "number") return DEFAULT_SETTINGS;
    return { speedWpm: parsed.speedWpm };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function mergeSettings(saved: Partial<Settings>, defaults: Settings): Settings {
  return { ...defaults, ...saved };
}
