import { replay } from "@shared/game/four";
import { createGameSchema } from "@shared/schemas/games";
import { Hono } from "hono";
import type { AppEnv } from "../env";
import { fail, validate } from "../lib/errors";
import { createAdminClient } from "../lib/supabase";

/*
 * Saved games of tic-tac-toe, variant "four". Copied from the shape of
 * server/routes/events.ts. See docs/design.md.
 *
 * Two rules run through this file:
 * - A game belongs to the person who saved it, so every query is filtered by
 *   `c.get("user").id`, never by an id from the browser.
 * - The server never trusts the browser's result. The browser sends only the
 *   moves; the server replays them with the same rules the page plays with,
 *   and saves the result IT calculated.
 */

/** The columns we send to the browser. Listed out so a new column doesn't leak. */
const COLUMNS = "id, moves, result, created_at";

export const games = new Hono<AppEnv>()

  // GET /api/games - the logged-in user's games, newest first.
  .get("/", async (c) => {
    const { data, error } = await createAdminClient(c.env)
      .from("games")
      .select(COLUMNS)
      .eq("owner_id", c.get("user").id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("list games failed:", error);
      return fail(c, 500, "database_error", "Could not load your games.");
    }
    return c.json(data);
  })

  // POST /api/games - save a finished game. Responds 201 with the saved game.
  .post("/", validate("json", createGameSchema), async (c) => {
    // Zod has already checked the shape: a list of 1-16 cells, 0-15.
    const { moves } = c.req.valid("json");

    // Now check that it is a real game, by playing it from the first move.
    const outcome = replay(moves);
    if (!outcome.ok) {
      return fail(c, 400, "invalid_game", outcome.error.message);
    }
    // Every move was legal, but nobody has won and the board isn't full.
    if (outcome.result === null) {
      return fail(c, 400, "invalid_game", "The game hasn't ended yet.");
    }

    const { data, error } = await createAdminClient(c.env)
      .from("games")
      // owner_id comes from the verified token and result from replay():
      // neither one comes from the request body.
      .insert({ moves, result: outcome.result, owner_id: c.get("user").id })
      .select(COLUMNS)
      .single();

    if (error) {
      console.error("save game failed:", error);
      return fail(c, 500, "database_error", "Could not save the game.");
    }
    return c.json(data, 201);
  });
