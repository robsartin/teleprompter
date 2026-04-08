/**
 * Connection status tracking for Even Realities glasses.
 */

export type ConnectionState = "connected" | "disconnected" | "unknown";

export interface ConnectionInfo {
  state: ConnectionState;
  batteryLevel?: number;
}

export const DEFAULT_CONNECTION: ConnectionInfo = { state: "unknown" };
