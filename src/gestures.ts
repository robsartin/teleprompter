export type GestureAction = "toggle" | "restart" | "speed_up" | "speed_down" | "none";

export interface GlassesEvent {
  listEvent?: { currentSelectItemIndex?: number };
  textEvent?: { containerID?: number };
  sysEvent?: { eventType?: string };
}

export function mapEventToAction(event: GlassesEvent): GestureAction {
  if (event.sysEvent?.eventType?.includes("double")) {
    return "restart";
  }
  if (event.textEvent) {
    return "toggle";
  }
  if (event.listEvent) {
    if (event.listEvent.currentSelectItemIndex === 0) return "speed_up";
    if (event.listEvent.currentSelectItemIndex === 1) return "speed_down";
  }
  return "none";
}
