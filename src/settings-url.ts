/**
 * Settings URL encoding/decoding — pure functions for sharing settings via URL.
 */

export function encodeSettingsToParams(settings: { speedWpm: number; scriptUrl?: string }): string {
  const params = new URLSearchParams();
  params.set("speed", String(settings.speedWpm));
  if (settings.scriptUrl) {
    params.set("script", settings.scriptUrl);
  }
  return "?" + params.toString();
}
