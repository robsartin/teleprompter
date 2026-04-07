import { describe, it, expect } from "vitest";
import { mapEventToAction } from "../src/gestures";

describe("mapEventToAction", () => {
  it('returns "restart" for sysEvent with eventType containing "double"', () => {
    const action = mapEventToAction({ sysEvent: { eventType: "double_tap" } });
    expect(action).toBe("restart");
  });

  it('returns "toggle" for any textEvent (single tap)', () => {
    const action = mapEventToAction({ textEvent: { containerID: 1 } });
    expect(action).toBe("toggle");
  });

  it('returns "speed_up" for listEvent with currentSelectItemIndex 0', () => {
    const action = mapEventToAction({ listEvent: { currentSelectItemIndex: 0 } });
    expect(action).toBe("speed_up");
  });

  it('returns "speed_down" for listEvent with currentSelectItemIndex 1', () => {
    const action = mapEventToAction({ listEvent: { currentSelectItemIndex: 1 } });
    expect(action).toBe("speed_down");
  });
});
