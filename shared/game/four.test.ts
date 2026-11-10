import { describe, expect, it } from "vitest";
import { LINES, nextPlayer, play, replay, type Moves } from "./four";

/*
 * The rules of "four" decide which games the server agrees to save, so every
 * win line, the draw and every kind of illegal move is tested here.
 */

/** Moves where X plays `line` and O plays three cells off it. X wins on move 7. */
function xWinsOn(line: readonly number[]): Moves {
  const others = [...Array(16).keys()].filter((c) => !line.includes(c));
  const [o1, o2, o3] = others;
  return [line[0]!, o1!, line[1]!, o2!, line[2]!, o3!, line[3]!];
}

/**
 * Moves where O plays `line` and X plays four cells off it that aren't a
 * line themselves (the first three free cells, and the last). O wins on move 8.
 */
function oWinsOn(line: readonly number[]): Moves {
  const others = [...Array(16).keys()].filter((c) => !line.includes(c));
  const xs = [others[0]!, others[1]!, others[2]!, others.at(-1)!];
  return [
    xs[0]!,
    line[0]!,
    xs[1]!,
    line[1]!,
    xs[2]!,
    line[2]!,
    xs[3]!,
    line[3]!,
  ];
}

/*
 * A full board with no four in a row:
 *
 *   x x o o
 *   o o x x
 *   x x o o
 *   o o x x
 */
const draw: Moves = [0, 2, 1, 3, 6, 4, 7, 5, 8, 10, 9, 11, 14, 12, 15, 13];

describe("replay: wins", () => {
  it("has exactly 10 lines", () => {
    expect(LINES).toHaveLength(10);
  });

  it.each(LINES.map((line) => [line.join(",")]))("X wins with %s", (key) => {
    const line = key.split(",").map(Number);
    expect(replay(xWinsOn(line))).toMatchObject({ ok: true, result: "x" });
  });

  it.each(LINES.map((line) => [line.join(",")]))("O wins with %s", (key) => {
    const line = key.split(",").map(Number);
    expect(replay(oWinsOn(line))).toMatchObject({ ok: true, result: "o" });
  });

  it("can end on move 7, the shortest game", () => {
    const moves = xWinsOn([0, 1, 2, 3]);
    expect(moves).toHaveLength(7);
    expect(replay(moves)).toMatchObject({ ok: true, result: "x" });
  });

  it("puts each player's mark where they played", () => {
    const outcome = replay([5, 0]);
    expect(outcome.ok && outcome.board[5]).toBe("x");
    expect(outcome.ok && outcome.board[0]).toBe("o");
  });
});

describe("replay: draw and unfinished games", () => {
  it("is a draw when the board is full and nobody has a row", () => {
    expect(replay(draw)).toMatchObject({ ok: true, result: "draw" });
  });

  it("is not over yet with no moves", () => {
    expect(replay([])).toMatchObject({ ok: true, result: null });
  });

  it("is not over yet one move before the end", () => {
    expect(replay(draw.slice(0, 15))).toMatchObject({ ok: true, result: null });
  });
});

describe("replay: illegal moves", () => {
  it("rejects a cell played twice", () => {
    expect(replay([0, 1, 0])).toMatchObject({
      ok: false,
      error: { code: "cell_taken", moveIndex: 2 },
    });
  });

  it("rejects a move after someone already won", () => {
    const moves = [...xWinsOn([0, 1, 2, 3]), 15];
    expect(replay(moves)).toMatchObject({
      ok: false,
      error: { code: "game_over", moveIndex: 7 },
    });
  });

  it.each([[-1], [16], [1.5], [NaN]])("rejects cell %s", (cell) => {
    expect(replay([0, cell])).toMatchObject({
      ok: false,
      error: { code: "out_of_range", moveIndex: 1 },
    });
  });

  it("says which move was wrong, counting from 1", () => {
    const outcome = replay([0, 1, 0]);
    expect(!outcome.ok && outcome.error.message).toBe(
      "Move 3: cell 0 is already taken",
    );
  });
});

describe("play and nextPlayer", () => {
  it("X plays first, then they take turns", () => {
    expect(nextPlayer([])).toBe("x");
    expect(nextPlayer([0])).toBe("o");
    expect(nextPlayer([0, 1])).toBe("x");
  });

  it("can't play out of turn: a move's player comes from its position", () => {
    // There is no way to say "X plays again": the 2nd move is always O's.
    const outcome = replay([0, 1, 2]);
    expect(outcome.ok && outcome.board.slice(0, 3)).toEqual(["x", "o", "x"]);
  });

  it("plays one more move", () => {
    expect(play([0], 1)).toMatchObject({ ok: true, result: null });
    expect(play([0], 0)).toMatchObject({
      ok: false,
      error: { code: "cell_taken" },
    });
  });

  it("does not change the moves it is given", () => {
    const moves = [0, 1];
    play(moves, 2);
    expect(moves).toEqual([0, 1]);
  });
});
