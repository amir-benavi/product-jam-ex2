import { z } from "zod";

/*
 * Space pictures (NASA's Astronomy Picture of the Day) and their Hebrew
 * explanations, for both sides. Copied from the shape of
 * shared/schemas/events.ts. See docs/design.md, Part 2.
 */

/**
 * The tags Gemini may choose from. Written once, here: the Zod schema below,
 * the JSON schema sent to Gemini (server/lib/gemini.ts) and the `check` in the
 * explanations table all use this list.
 */
export const APOD_TAGS = [
  "galaxy",
  "nebula",
  "star",
  "planet",
  "moon",
  "sun",
  "earth",
  "comet",
  "aurora",
  "eclipse",
  "spacecraft",
  "other",
] as const;

export const apodTagSchema = z.enum(APOD_TAGS);

/**
 * More Hebrew letters than English ones. Names like "M100" or "NGC 1300" are
 * fine inside a Hebrew sentence, but "Ignore previous instructions ש" isn't.
 */
function isMostlyHebrew(text: string) {
  const hebrew = text.match(/[א-ת]/g)?.length ?? 0;
  const english = text.match(/[a-z]/gi)?.length ?? 0;
  return hebrew > english;
}

/** No HTML and no links: a children's summary needs neither. */
function hasNoMarkupOrLinks(text: string) {
  return !/[<>]|http/i.test(text);
}

/** A Hebrew title or summary, 1 to `max` characters after trimming. */
function hebrewText(field: string, max: number) {
  return z
    .string()
    .trim()
    .min(1)
    .max(max)
    .refine(isMostlyHebrew, `The ${field} must be in Hebrew`)
    .refine(hasNoMarkupOrLinks, `The ${field} must not have HTML or links`);
}

/** The longest title and summary. The same numbers are in the table's checks. */
export const MAX_TITLE_LENGTH = 200;
export const MAX_SUMMARY_LENGTH = 1000;

/**
 * Gemini's answer. Gemini is asked for exactly this shape, but an LLM doesn't
 * always do what it's told, so the server checks the answer with this schema
 * before it saves or sends anything. It is also `hebrew` in the API.
 *
 * A saved answer is shown to everyone and never replaced, so this is strict.
 */
export const hebrewSchema = z.object({
  title: hebrewText("title", MAX_TITLE_LENGTH),
  summary: hebrewText("summary", MAX_SUMMARY_LENGTH),
  tags: z
    .array(apodTagSchema)
    .min(1)
    .max(5)
    .refine((tags) => new Set(tags).size === tags.length, "Each tag only once"),
});

/** One picture, as GET /api/apod returns it. */
export const pictureSchema = z.object({
  /** YYYY-MM-DD, the day it was NASA's picture of the day. */
  date: z.string(),
  title: z.string(),
  /** Plain text: the server cleans NASA's HTML out of it. */
  explanation: z.string(),
  /** NASA's `hdurl`, or null if it has none. */
  image_url: z.string().nullable(),
  /** The saved Hebrew explanation, or null if nobody asked for one yet. */
  hebrew: hebrewSchema.nullable(),
});

/** What POST /api/apod/:date/explain answers. */
export const explanationSchema = hebrewSchema.extend({ date: z.string() });

/** The first Astronomy Picture of the Day. */
export const FIRST_APOD_DATE = "1995-06-16";

/**
 * The date in POST /api/apod/:date/explain: a real date in YYYY-MM-DD, from
 * the first APOD until today. Comparing them as strings works because
 * YYYY-MM-DD sorts the same way as the dates do.
 */
export const apodDateParamSchema = z.object({
  date: z.iso
    .date("The date must be a real date, as YYYY-MM-DD")
    .refine(
      (date) => date >= FIRST_APOD_DATE,
      "There are no pictures before 16 June 1995",
    )
    .refine(
      // Today in UTC. A day later than NASA's own clock at most, and NASA
      // answers 404 for a picture it doesn't have yet.
      (date) => date <= new Date().toISOString().slice(0, 10),
      "There are no pictures from the future",
    ),
});

// Types read straight off the schemas, never hand-written.
export type ApodTag = z.infer<typeof apodTagSchema>;
export type Hebrew = z.infer<typeof hebrewSchema>;
export type Picture = z.infer<typeof pictureSchema>;
export type Explanation = z.infer<typeof explanationSchema>;
