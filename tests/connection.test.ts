import { describe, it, expect } from "vitest";
import { DEFAULT_CONNECTION } from "../src/connection";

describe("DEFAULT_CONNECTION", () => {
  it("has state of unknown", () => {
    expect(DEFAULT_CONNECTION.state).toBe("unknown");
  });
});
