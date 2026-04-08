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

export function decodeSettingsFromParams(search: string): { speedWpm?: number; scriptUrl?: string } {
  const params = new URLSearchParams(search);
  const result: { speedWpm?: number; scriptUrl?: string } = {};
  const speed = params.get("speed");
  if (speed !== null) {
    const num = Number(speed);
    if (!Number.isNaN(num) && speed !== "") {
      result.speedWpm = num;
    }
  }
  const script = params.get("script");
  if (script) {
    result.scriptUrl = script;
  }
  return result;
}
