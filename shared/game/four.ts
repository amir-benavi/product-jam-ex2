/*
 * The rules of tic-tac-toe, variant "four": a 4×4 board, and four in a row
 * (across, down or diagonally) wins. A full board with no row is a draw.
 *
 * These are pure functions: no React, no database, no Zod. The page uses
 * them to play, and POST /api/games uses the SAME functions to replay the
 * moves the browser sent, so the server never has to trust the browser's
 * result.
 *
 * A game's whole state is its list of moves. The board, whose turn it is and
 * the result are always calculated from that list, never stored next to it,
 * so they can't disagree with it.
 */

export type Player = "x" | "o";

/** One square on the board: empty, or taken by a player. */
export type Cell = Player | null;

/** How a finished game ended. The same values as the `result` column. */
export type Result = Player | "draw";

/**
 * The cells played, in order. Cells are numbered 0 to 15, row by row:
 * 0-3 is the top row, 12-15 the bottom. X plays the moves at even positions
 * in the list, O the odd ones.
 */
export type Moves = number[];

export const SIZE = 4;
export const CELL_COUNT = SIZE * SIZE;

/*
 * Every way to make four in a row. On a 4×4 board a row of four must fill a
 * whole row, a whole column or one of the two long diagonals, so there are
 * exactly 10. Written out by hand so you can check them against the board:
 *
 *    0  1  2  3
 *    4  5  6  7
 *    8  9 10 11
 *   12 13 14 15
 */
export const LINES: readonly (readonly number[])[] = [
  // across
  [0, 1, 2, 3],
  [4, 5, 6, 7],
  [8, 9, 10, 11],
  [12, 13, 14, 15],
  // down
  [0, 4, 8, 12],
  [1, 5, 9, 13],
  [2, 6, 10, 14],
  [3, 7, 11, 15],
  // diagonal
  [0, 5, 10, 15],
  [3, 6, 9, 12],
];

/** What can be wrong with a move. */
export type GameError = {
  code: "out_of_range" | "cell_taken" | "game_over";
  /** Which move in the list was wrong, counting from 0. */
  moveIndex: number;
  /** Safe to show to the user. Counts moves from 1, like a person would. */
  message: string;
};

/**
 * What replaying a list of moves gives you: the board and the result
 * (`null` while the game is still going), or the first move that broke the
 * rules. Like Zod's `safeParse`, it returns the error instead of throwing it.
 */
export type ReplayOutcome =
  | { ok: true; board: Cell[]; result: Result | null }
  | { ok: false; error: GameError };

/** A board with nothing played on it yet. */
export function emptyBoard(): Cell[] {
  return Array<Cell>(CELL_COUNT).fill(null);
}

/** Who plays the move at this position in the list. X plays first. */
export function playerAt(moveIndex: number): Player {
  return moveIndex % 2 === 0 ? "x" : "o";
}

/** Whose turn it is after these moves. */
export function nextPlayer(moves: Moves): Player {
  return playerAt(moves.length);
}

/** The player who has four in a row, or `null` if nobody does. */
export function winnerOf(board: Cell[]): Player | null {
  for (const line of LINES) {
    const first = board[line[0]!];
    if (first && line.every((cell) => board[cell] === first)) return first;
  }
  return null;
}

/** How the game ended, or `null` if it hasn't ended yet. */
export function resultOf(board: Cell[]): Result | null {
  const winner = winnerOf(board);
  if (winner) return winner;
  return board.every((cell) => cell !== null) ? "draw" : null;
}

/**
 * Play the moves from an empty board, checking each one. Stops at the first
 * move that breaks the rules.
 *
 * A legal game that hasn't ended yet is NOT an error here: it is
 * `{ ok: true, result: null }`, because the page needs exactly that to keep
 * playing. The server is the one that rejects an unfinished game.
 */
export function replay(moves: Moves): ReplayOutcome {
  const board = emptyBoard();

  for (const [moveIndex, cell] of moves.entries()) {
    const fail = (code: GameError["code"], message: string): ReplayOutcome => ({
      ok: false,
      error: { code, moveIndex, message: `Move ${moveIndex + 1}: ${message}` },
    });

    // Zod checks this too, but the rules don't count on the caller having
    // run Zod first.
    if (!Number.isInteger(cell) || cell < 0 || cell >= CELL_COUNT) {
      return fail("out_of_range", `${cell} is not a cell on the board`);
    }
    if (resultOf(board) !== null) {
      return fail("game_over", "the game was already over");
    }
    if (board[cell] !== null) {
      return fail("cell_taken", `cell ${cell} is already taken`);
    }

    board[cell] = playerAt(moveIndex);
  }

  return { ok: true, board, result: resultOf(board) };
}

/**
 * Play one more move. The page calls this when someone clicks a cell; on
 * success, the new moves are `[...moves, cell]`. It never changes `moves`.
 */
export function play(moves: Moves, cell: number): ReplayOutcome {
  return replay([...moves, cell]);
}
