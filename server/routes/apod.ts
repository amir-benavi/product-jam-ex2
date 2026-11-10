import {
  apodDateParamSchema,
  type Explanation,
  type Hebrew,
} from "@shared/schemas/apod";
import { Hono } from "hono";
import type { Context } from "hono";
import type { AppEnv } from "../env";
import { fail, validate } from "../lib/errors";
import { explainInHebrew } from "../lib/gemini";
import { fetchPicture, fetchRandomPage } from "../lib/nasa";
import { createAdminClient } from "../lib/supabase";

/*
 * Space pictures from NASA, explained in Hebrew by Gemini. Copied from the
 * shape of server/routes/events.ts. See docs/design.md, Part 2.
 *
 * Two rules run through this file:
 * - The browser sends only a date. The title and explanation Gemini reads
 *   always come from NASA, so nobody can make our Gemini key write about
 *   whatever they like.
 * - Never pay twice for the same answer. An explanation is saved by date, and
 *   a saved one is returned without calling NASA or Gemini.
 *
 * The explanations table has no owner: an explanation is about a public NASA
 * picture, the same for everyone, so no query here filters by user.
 */

/** The columns we read. Listed out so a new column doesn't leak. */
const COLUMNS = "date, title_he, summary_he, tags";

type ExplanationRow = {
  date: string;
  title_he: string;
  summary_he: string;
  tags: Hebrew["tags"];
};

/** A row of `explanations`, in the shape the API answers. */
function toHebrew(row: ExplanationRow): Hebrew {
  return { title: row.title_he, summary: row.summary_he, tags: row.tags };
}

/** Our own answer when NASA fails. Never NASA's error itself. */
function nasaUnavailable(c: Context) {
  return fail(
    c,
    502,
    "nasa_unavailable",
    "NASA isn't answering right now. Please try again in a minute.",
  );
}

export const apod = new Hono<AppEnv>()

  // GET /api/apod - up to 20 random pictures, with their saved explanations.
  .get("/", async (c) => {
    const nasa = await fetchRandomPage();
    if (!nasa.ok) return nasaUnavailable(c);

    // The explanations saved for these dates, in one query.
    const { data, error } = await createAdminClient(c.env)
      .from("explanations")
      .select(COLUMNS)
      .in(
        "date",
        nasa.data.map((picture) => picture.date),
      )
      .returns<ExplanationRow[]>();

    if (error) {
      console.error("list explanations failed:", error);
      return fail(c, 500, "database_error", "Could not load the explanations.");
    }

    const saved = new Map(data.map((row) => [row.date, toHebrew(row)]));
    return c.json(
      nasa.data.map((picture) => ({
        ...picture,
        hebrew: saved.get(picture.date) ?? null,
      })),
    );
  })

  // POST /api/apod/:date/explain - explain one picture in Hebrew.
  .post("/:date/explain", validate("param", apodDateParamSchema), async (c) => {
    // Zod has checked it is a real date, from 1995-06-16 until today.
    const { date } = c.req.valid("param");
    const db = createAdminClient(c.env);

    // 1. Explained before, by anyone? Then it's free.
    const existing = await readExplanation(db, date);
    if (existing.error) {
      console.error("read explanation failed:", existing.error);
      return fail(c, 500, "database_error", "Could not load the explanation.");
    }
    if (existing.data) return c.json(existing.data);

    // 2. The title and explanation, from NASA itself.
    const picture = await fetchPicture(date);
    if (!picture.ok) {
      return picture.reason === "not_found"
        ? fail(c, 404, "no_picture", "NASA has no picture on that date.")
        : nasaUnavailable(c);
    }

    // 3. Gemini, checked with hebrewSchema inside explainInHebrew().
    const ai = await explainInHebrew(c.env.GEMINI_API_KEY, picture.data);
    if (!ai.ok) {
      return ai.reason === "invalid_answer"
        ? fail(
            c,
            502,
            "invalid_ai_answer",
            "The AI's answer wasn't a valid explanation. Please try again.",
          )
        : fail(
            c,
            502,
            "gemini_unavailable",
            "The AI isn't answering right now. Please try again in a minute.",
          );
    }

    // 4. Save it. If someone else saved this date a moment ago, keep
    // theirs: `ignoreDuplicates` is `on conflict (date) do nothing`.
    const { error } = await db.from("explanations").upsert(
      {
        date,
        title_he: ai.answer.title,
        summary_he: ai.answer.summary,
        tags: ai.answer.tags,
        model: ai.model,
      },
      { onConflict: "date", ignoreDuplicates: true },
    );
    if (error) {
      console.error("save explanation failed:", error);
      return fail(c, 500, "database_error", "Could not save the explanation.");
    }

    // 5. Answer with the saved row, so two people who asked at the same
    // time get the same explanation.
    const saved = await readExplanation(db, date);
    if (saved.error || !saved.data) {
      console.error("read saved explanation failed:", saved.error);
      return fail(c, 500, "database_error", "Could not load the explanation.");
    }
    return c.json(saved.data);
  });

/** The saved explanation of one date, or `data: null` if there is none. */
async function readExplanation(
  db: ReturnType<typeof createAdminClient>,
  date: string,
) {
  const { data, error } = await db
    .from("explanations")
    .select(COLUMNS)
    .eq("date", date)
    .returns<ExplanationRow[]>()
    .maybeSingle();
  const explanation: Explanation | null = data
    ? { date: data.date, ...toHebrew(data) }
    : null;
  return { data: explanation, error };
}
