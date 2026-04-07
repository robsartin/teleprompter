/**
 * Gesture mapping — pure functions to translate glasses events into actions.
 */

export type GestureAction = "toggle" | "restart" | "speed_up" | "speed_down" | "none";

export function mapEventToAction(event: {
  listEvent?: any;
  textEvent?: any;
  sysEvent?: any;
}): GestureAction {
  if (event.sysEvent && typeof event.sysEvent.eventType === "string" && event.sysEvent.eventType.includes("double")) {
    return "restart";
  }
  if (event.textEvent) {
    return "toggle";
  }
  return "none";
}
