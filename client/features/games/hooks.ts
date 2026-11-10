import type { CreateGameInput, Game } from "@shared/schemas/games";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../../lib/api";

/*
 * Talking to /api/games from the browser. Copied from the shape of
 * client/features/events/hooks.ts.
 *
 * There are only two routes: the list of my games, and saving one. A game is
 * never fetched, changed or deleted on its own, so there is no `one(id)` key
 * and no update or delete hook.
 */

/** The name the list of games is filed under. See eventKeys for why it matters. */
export const gameKeys = {
  all: ["games"] as const,
};

/** The logged-in user's saved games, newest first (the server sorts them). */
export function useGames() {
  return useQuery({
    queryKey: gameKeys.all,
    queryFn: () => api<Game[]>("/api/games"),
  });
}

/**
 * Saves a finished game. Send only the moves: the server replays them and
 * works out the result itself.
 *
 *     const saveGame = useSaveGame();
 *     saveGame.mutate({ moves });
 */
export function useSaveGame() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateGameInput) =>
      api<Game>("/api/games", { method: "POST", body: input }),
    onSuccess: () => {
      // The list is now out of date - fetch it again.
      void queryClient.invalidateQueries({ queryKey: gameKeys.all });
    },
  });
}
