import { z } from "zod";

/*
 * Talking to NASA's Astronomy Picture of the Day. See docs/design.md, Part 2,
 * and its "What changed and why" for why this is science.nasa.gov's
 * apod-basic and not api.nasa.gov.
 *
 * NASA is another server: it can fail, answer slowly, or answer something
 * unexpected. None of that reaches the browser as is. Every function here
 * answers `{ ok: true, ... }` or `{ ok: false, reason }`, the same way
 * replay() in shared/game/four.ts does, and the route turns `reason` into
 * our own error.
 */

const NASA_URL = "https://science.nasa.gov/wp-json/wp/v2/apod-basic";

/** How many pictures GET /api/apod shows. NASA allows up to 25 a page. */
export const PAGE_SIZE = 20;

/**
 * How many full pages of PAGE_SIZE there are. X-WP-Total was 11,463 on
 * 2026-11-10: 573 full pages and one part-full one. Pictures are only ever
 * added, so every page up to this one always exists and is full, and we
 * don't spend a request asking for the total. See the trade-off in
 * docs/design.md.
 */
const RANDOM_PAGES = 573;

/** How long we wait for NASA before we tell the user it isn't answering. */
const TIMEOUT_MS = 10_000;

/** A picture after cleaning, ready to send to the browser or to Gemini. */
export type NasaPicture = {
  date: string;
  title: string;
  explanation: string;
  image_url: string | null;
};

export type NasaResult<T> =
  { ok: true; data: T } | { ok: false; reason: "not_found" | "unavailable" };

/**
 * One picture as NASA sends it. Only the fields we use; Zod drops the rest.
 * `hdurl` is checked by imageUrl() below, so anything that isn't a string
 * is treated as missing.
 */
const nasaItemSchema = z.object({
  date: z.iso.date(),
  title: z.string(),
  explanation: z.string(),
  hdurl: z.string().nullish().catch(null),
  /** The whole article as a web page. Only read by imageUrl() below. */
  basic_html: z.string().optional(),
});

/**
 * The only server we let the browser load pictures from. Every picture we
 * have seen is there; anything else, even if NASA sends it, is dropped, so a
 * wrong answer from NASA can't make every user's browser load a stranger's
 * image (and leak their IP address to it).
 */
const NASA_IMAGE_HOST = "assets.science.nasa.gov";

/**
 * For some days (most of 1995, some of 1998, many videos) NASA's `hdurl` is
 * a placeholder with NASA's logo, the same file for all of them.
 */
const PLACEHOLDER_IMAGE = "/misc/news-thumbnail.png";

/**
 * The first <img> in the article that is on NASA's image server. On a
 * placeholder day this is the real picture; a video day has none (only a
 * YouTube player).
 */
const ARTICLE_IMAGE =
  /<img[^>]+src="(https:\/\/assets\.science\.nasa\.gov\/[^"]+)"/i;

/** The picture's image: `hdurl`, or the one in the article, or none. */
export function imageUrl(
  hdurl: string | null | undefined,
  basicHtml: string | undefined,
): string | null {
  const url =
    hdurl && !hdurl.includes(PLACEHOLDER_IMAGE)
      ? hdurl
      : // An attribute in HTML writes "&" as "&amp;", so decode it.
        decodeEntities(basicHtml?.match(ARTICLE_IMAGE)?.[1] ?? "");
  return isNasaImage(url) ? url : null;
}

/** An https link on NASA_IMAGE_HOST. `new URL` throws on a broken link. */
function isNasaImage(url: string) {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "https:" && parsed.hostname === NASA_IMAGE_HOST;
  } catch {
    return false;
  }
}

/** Up to 20 pictures from one random page. */
export async function fetchRandomPage(): Promise<NasaResult<NasaPicture[]>> {
  const page = 1 + Math.floor(Math.random() * RANDOM_PAGES);
  const result = await getJson(
    `${NASA_URL}?page=${page}&per_page=${PAGE_SIZE}`,
  );
  if (!result.ok) return result;

  const parsed = z.array(nasaItemSchema).safeParse(result.data);
  if (!parsed.success) {
    console.error("NASA sent an unexpected list:", parsed.error.issues[0]);
    return { ok: false, reason: "unavailable" };
  }
  return { ok: true, data: parsed.data.map(toPicture) };
}

/** The picture of one date (YYYY-MM-DD). `not_found` if there is none. */
export async function fetchPicture(
  date: string,
): Promise<NasaResult<NasaPicture>> {
  // NASA wants the date as YYMMDD: 2015-03-14 -> 150314.
  const yymmdd = date.slice(2, 4) + date.slice(5, 7) + date.slice(8, 10);
  const result = await getJson(`${NASA_URL}/${yymmdd}`);
  if (!result.ok) return result;

  const parsed = nasaItemSchema.safeParse(result.data);
  // YYMMDD can't tell 1995 from 2095, so check NASA answered the date we
  // asked for, not just a picture.
  if (!parsed.success || parsed.data.date !== date) {
    console.error("NASA sent an unexpected picture for", date);
    return { ok: false, reason: "unavailable" };
  }
  return { ok: true, data: toPicture(parsed.data) };
}

function toPicture(item: z.infer<typeof nasaItemSchema>): NasaPicture {
  return {
    date: item.date,
    title: cleanHtml(item.title),
    explanation: cleanHtml(item.explanation),
    image_url: imageUrl(item.hdurl, item.basic_html),
  };
}

/** GET a URL from NASA and read its JSON, never throwing. */
async function getJson(url: string): Promise<NasaResult<unknown>> {
  try {
    const response = await fetch(url, {
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (response.status === 404) return { ok: false, reason: "not_found" };
    if (!response.ok) {
      console.error(`NASA answered ${response.status} for ${url}`);
      return { ok: false, reason: "unavailable" };
    }
    return { ok: true, data: await response.json() };
  } catch (err) {
    // No answer in time, no connection, or an answer that isn't JSON.
    console.error(`NASA failed for ${url}:`, err);
    return { ok: false, reason: "unavailable" };
  }
}

/**
 * Turns NASA's HTML into plain text:
 *
 *   "<strong>Explanation:</strong> A <a href=…>Saturn</a>ian eclipse &amp; …
 *    <br><br><strong>Tomorrow's picture: </strong>small but mighty"
 *   -> "A Saturnian eclipse & …"
 *
 * Tags are removed without a space, so "<a>Saturn</a>ian" stays one word.
 * The page shows the result as text (React escapes it), so this is for
 * reading, not for safety.
 */
export function cleanHtml(html: string): string {
  const text = html.replace(/<br\s*\/?>/gi, " ").replace(/<[^>]*>/g, "");
  return decodeEntities(text)
    .replace(/^\s*Explanation:\s*/i, "")
    .replace(/\s*Tomorrow['’]s picture:[\s\S]*$/i, "")
    .replace(/\s+/g, " ") // also turns NASA's non-breaking spaces into spaces
    .trim();
}

const NAMED_ENTITIES: Record<string, string> = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  nbsp: " ",
};

/**
 * "&amp;" -> "&", "&#8217;" -> "’", "&#x27;" -> "'". One pass, so "&amp;lt;"
 * becomes "&lt;" (what the author wrote), not "<".
 */
function decodeEntities(text: string): string {
  return text.replace(
    /&(#\d+|#x[0-9a-f]+|[a-z]+);/gi,
    (entity: string, name: string) => {
      if (name.startsWith("#")) {
        const code =
          name[1]?.toLowerCase() === "x"
            ? parseInt(name.slice(2), 16)
            : Number(name.slice(1));
        return code <= 0x10ffff ? String.fromCodePoint(code) : entity;
      }
      return NAMED_ENTITIES[name.toLowerCase()] ?? entity;
    },
  );
}
