import { describe, expect, it } from "vitest";
import { initialState, reducer } from "./simulation";

describe("state isolation and completed receipts", () => {
  it("does not change a previous state while processing an order", () => {
    const queued = reducer(initialState(1), {
      type: "order.create",
      quantities: { chips: 1 },
      source: "manual",
      now: 10,
    });
    const snapshot = structuredClone(queued);
    const next = reducer(queued, { type: "tick", dt: 1000, now: 1010 });
    expect(queued).toEqual(snapshot);
    expect(next.orders[0]).not.toBe(queued.orders[0]);
    expect(next.orders[0].steps).not.toBe(queued.orders[0].steps);
  });
  it("retains completed immutable receipts when creating the next order", () => {
    let state = reducer(initialState(1), {
      type: "order.create",
      quantities: { water: 1 },
      source: "manual",
      now: 10,
    });
    for (let i = 0; i < 40; i++)
      state = reducer(state, { type: "tick", dt: 250, now: 1000 + i * 250 });
    expect(state.orders[0].status).toBe("completed");
    const next = reducer(state, {
      type: "order.create",
      quantities: { chips: 1 },
      source: "manual",
      now: 12000,
    });
    expect(next.orders[0]).toBe(state.orders[0]);
    expect(state.orders).toHaveLength(1);
    expect(next.orders).toHaveLength(2);
  });
});
