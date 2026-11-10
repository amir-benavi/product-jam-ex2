import { describe, expect, it } from "vitest";
import { createGameSchema } from "./games";

/*
 * createGameSchema decides which requests to POST /api/games even reach the
 * rules. It checks the shape only; four.test.ts tests whether moves are a
 * real game.
 */

describe("createGameSchema", () => {
  it("accepts a list of cells", () => {
    const result = createGameSchema.safeParse({ moves: [0, 4, 1, 5, 2, 6, 3] });
    expect(result.success).toBe(true);
  });

  it("accepts all 16 cells", () => {
    const moves = [...Array(16).keys()];
    expect(createGameSchema.safeParse({ moves }).success).toBe(true);
  });

  it("drops a result the browser sends", () => {
    const result = createGameSchema.safeParse({ moves: [0], result: "x" });
    expect(result.data).toEqual({ moves: [0] });
  });

  it("rejects a missing list", () => {
    const result = createGameSchema.safeParse({});
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.path).toEqual(["moves"]);
  });

  it("rejects an empty list", () => {
    expect(createGameSchema.safeParse({ moves: [] }).success).toBe(false);
  });

  it("rejects more than 16 moves", () => {
    const moves = [...Array(17).keys()].map((i) => i % 16);
    expect(createGameSchema.safeParse({ moves }).success).toBe(false);
  });

  it.each([[-1], [16], [1.5], ["3"], [null]])("rejects the move %s", (cell) => {
    const result = createGameSchema.safeParse({ moves: [0, cell] });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.path).toEqual(["moves", 1]);
  });
});
