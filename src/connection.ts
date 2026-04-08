/**
 * Connection status tracking for Even Realities glasses.
 */

export type ConnectionState = "connected" | "disconnected" | "unknown";

export interface ConnectionInfo {
  state: ConnectionState;
  batteryLevel?: number;
}

export const DEFAULT_CONNECTION: ConnectionInfo = { state: "unknown" };

export function formatConnectionStatus(info: ConnectionInfo): string {
  switch (info.state) {
    case "connected":
      return info.batteryLevel !== undefined
        ? `Glasses connected (${info.batteryLevel}%)`
        : "Glasses connected";
    case "disconnected":
      return "Glasses disconnected";
    case "unknown":
      return "Browser only";
  }
}
