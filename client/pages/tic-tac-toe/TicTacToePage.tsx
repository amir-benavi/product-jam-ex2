import { useState } from "react";
import {
  CELL_COUNT,
  nextPlayer,
  play,
  replay,
  SIZE,
  type Moves,
  type Player,
  type Result,
} from "@shared/game/four";
import { Button, Card, Spinner } from "../../components";
import { useGames, useSaveGame } from "../../features/games/hooks";
import { LANG } from "../../lib/config";
import styles from "./TicTacToePage.module.css";

/**
 * Tic-tac-toe, variant "four": 4×4, four in a row wins. Two players share
 * the screen, X first.
 *
 * The page keeps only the list of moves in state. The board and the result
 * are calculated from it with the rules in shared/game/four.ts, the same
 * functions the server replays the game with when it is saved.
 */
export default function TicTacToePage() {
  const [moves, setMoves] = useState<Moves>([]);
  const saveGame = useSaveGame();

  // The page only ever adds legal moves (see handleClick), so this is
  // always ok. The fallback keeps TypeScript happy without a cast.
  const outcome = replay(moves);
  const board = outcome.ok ? outcome.board : [];
  const result = outcome.ok ? outcome.result : null;

  function handleClick(cell: number) {
    const next = play(moves, cell);
    if (!next.ok) return; // a taken cell, or the game is over
    const nextMoves = [...moves, cell];
    setMoves(nextMoves);

    // Save in the click handler, not in a useEffect, so a game is saved
    // exactly once: on the move that ended it.
    if (next.result !== null) saveGame.mutate({ moves: nextMoves });
  }

  function newGame() {
    setMoves([]);
    saveGame.reset();
  }

  return (
    <main className={styles.page}>
      <h1>Tic-tac-toe</h1>
      <p className={styles.rules}>4×4 board. Four in a row wins.</p>

      <p className={styles.status} aria-live="polite">
        {result === null
          ? `${playerName(nextPlayer(moves))}'s turn`
          : resultText(result)}
      </p>

      <div className={styles.board} role="group" aria-label="Board">
        {Array.from({ length: CELL_COUNT }, (_, cell) => {
          const mark = board[cell] ?? null;
          return (
            <button
              key={cell}
              type="button"
              className={styles.cell}
              data-mark={mark ?? undefined}
              aria-label={`Row ${Math.floor(cell / SIZE) + 1}, column ${(cell % SIZE) + 1}: ${mark ? playerName(mark) : "empty"}`}
              disabled={mark !== null || result !== null}
              onClick={() => handleClick(cell)}
            >
              {mark ? playerName(mark) : ""}
            </button>
          );
        })}
      </div>

      <div className={styles.actions}>
        {/* Not while a save is running or failed: starting over would throw
        away the finished game before it is saved. "Try again" comes first. */}
        <Button
          onClick={newGame}
          disabled={saveGame.isPending || saveGame.isError}
        >
          New game
        </Button>
        <SaveStatus
          save={saveGame}
          onRetry={() => saveGame.mutate({ moves })}
        />
      </div>

      <h2 className={styles.historyTitle}>My games</h2>
      <GameHistory />
    </main>
  );
}

/** Tells the player whether the finished game was saved. */
function SaveStatus({
  save,
  onRetry,
}: {
  save: ReturnType<typeof useSaveGame>;
  onRetry: () => void;
}) {
  if (save.isPending) {
    return (
      <span className={styles.saveNote}>
        <Spinner size="sm" /> Saving…
      </span>
    );
  }
  if (save.isError) {
    return (
      <span className={styles.saveError} role="alert">
        {/* The server's message is written for people, so show it as is. */}
        {save.error.message}{" "}
        <Button variant="secondary" size="sm" onClick={onRetry}>
          Try again
        </Button>
      </span>
    );
  }
  if (save.isSuccess) return <span className={styles.saveNote}>Saved</span>;
  return null;
}

/** The games saved on this account, newest first, in all four states. */
function GameHistory() {
  const gamesQuery = useGames();

  if (gamesQuery.isPending) {
    return (
      <div className={styles.centered}>
        <Spinner size="lg" />
      </div>
    );
  }
  if (gamesQuery.isError) {
    return (
      <Card padding="lg">
        <p role="alert">Could not load your games.</p>
        <Button variant="secondary" onClick={() => void gamesQuery.refetch()}>
          Try again
        </Button>
      </Card>
    );
  }
  if (gamesQuery.data.length === 0) {
    return (
      <Card padding="lg">
        <p className={styles.empty}>
          No games yet. Finish one and it shows up here.
        </p>
      </Card>
    );
  }
  return (
    <ul className={styles.history}>
      {gamesQuery.data.map((game) => (
        <li key={game.id}>
          <Card className={styles.historyItem}>
            <span className={styles.historyResult}>
              {resultText(game.result)}
            </span>
            <span className={styles.historyMeta}>
              {game.moves.length} moves ·{" "}
              <time dateTime={game.created_at}>
                {formatPlayedAt(game.created_at)}
              </time>
            </span>
          </Card>
        </li>
      ))}
    </ul>
  );
}

function playerName(player: Player) {
  return player === "x" ? "X" : "O";
}

function resultText(result: Result) {
  return result === "draw" ? "Draw" : `${playerName(result)} wins`;
}

/** When a game was played, in the app's language. */
function formatPlayedAt(iso: string) {
  return new Intl.DateTimeFormat(LANG, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(iso));
}
