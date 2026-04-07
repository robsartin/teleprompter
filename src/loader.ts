/**
 * Script loading utilities — parse URL params and validate URLs.
 */

export function parseScriptUrl(search: string): string | null {
  const params = new URLSearchParams(search);
  const url = params.get("script");
  return url || null;
}

export function isValidUrl(str: string): boolean {
  try {
    const url = new URL(str);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}
