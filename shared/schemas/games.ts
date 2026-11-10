import { z } from "zod";
import { CELL_COUNT } from "../game/four";

/*
 * What a saved game of tic-tac-toe looks like, for both sides. Copied from
 * the shape of shared/schemas/events.ts.
 *
 * This schema only checks the SHAPE of the moves: a list of cells on the
 * board. Whether they are a real, finished game is a question for the rules,
 * so the server replays them with replay() from shared/game/four.ts after
 * this schema passes.
 */

/** How a game ended. The same values as `Result` in shared/game/four.ts. */
export const resultSchema = z.enum(["x", "o", "draw"]);

/** A saved game, as the API returns it. Dates are ISO strings. */
export const gameSchema = z.object({
  id: z.string(),
  moves: z.array(z.number()),
  result: resultSchema,
  created_at: z.string(),
});

/**
 * What the browser sends to save a game: only the moves. There is no
 * `result` here on purpose; the server calculates it, because the browser
 * could lie about who won. Zod drops any key it doesn't know, so a `result`
 * the browser sends anyway never reaches the route.
 */
export const createGameSchema = z.object({
  moves: z
    .array(
      z
        .int("Every move must be a whole number")
        .min(0, "Every move must be a cell on the board")
        .max(CELL_COUNT - 1, "Every move must be a cell on the board"),
    )
    .min(1, "A game needs at least one move")
    .max(CELL_COUNT, "A game can't have more moves than cells"),
});

// Types read straight off the schemas, never hand-written.
export type Game = z.infer<typeof gameSchema>;
export type CreateGameInput = z.infer<typeof createGameSchema>;
