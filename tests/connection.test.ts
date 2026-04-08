import { describe, it, expect } from "vitest";
import { DEFAULT_CONNECTION, formatConnectionStatus } from "../src/connection";
import type { ConnectionInfo } from "../src/connection";

describe("DEFAULT_CONNECTION", () => {
  it("has state of unknown", () => {
    expect(DEFAULT_CONNECTION.state).toBe("unknown");
  });
});

describe("formatConnectionStatus", () => {
  it("returns 'Browser only' for unknown state", () => {
    expect(formatConnectionStatus({ state: "unknown" })).toBe("Browser only");
  });

  it("returns 'Glasses connected' for connected state without battery", () => {
    expect(formatConnectionStatus({ state: "connected" })).toBe("Glasses connected");
  });

  it("returns 'Glasses connected (85%)' for connected state with battery", () => {
    const info: ConnectionInfo = { state: "connected", batteryLevel: 85 };
    expect(formatConnectionStatus(info)).toBe("Glasses connected (85%)");
  });

  it("returns 'Glasses disconnected' for disconnected state", () => {
    expect(formatConnectionStatus({ state: "disconnected" })).toBe("Glasses disconnected");
  });

  it("returns 'Glasses disconnected' for disconnected state even with battery", () => {
    const info: ConnectionInfo = { state: "disconnected", batteryLevel: 50 };
    expect(formatConnectionStatus(info)).toBe("Glasses disconnected");
  });
});
