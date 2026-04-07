import { describe, it, expect } from "vitest";
import { mapEventToAction } from "../src/gestures";

describe("mapEventToAction", () => {
  it('returns "restart" for sysEvent with eventType containing "double"', () => {
    const action = mapEventToAction({ sysEvent: { eventType: "double_tap" } });
    expect(action).toBe("restart");
  });
});
