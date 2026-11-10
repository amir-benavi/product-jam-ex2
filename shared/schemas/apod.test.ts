import { describe, expect, it } from "vitest";
import { apodDateParamSchema, hebrewSchema } from "./apod";

/*
 * hebrewSchema is what stands between Gemini and the database, and
 * apodDateParamSchema decides which dates even reach NASA.
 */

const good = {
  title: "חזרה עם הזריחה",
  summary: "חללית נחתה על כדור הארץ. היא ירדה עם מצנח מעל העננים.",
  tags: ["spacecraft", "earth"],
};

describe("hebrewSchema", () => {
  it("accepts a good answer", () => {
    expect(hebrewSchema.safeParse(good).success).toBe(true);
  });

  it("trims the title and the summary", () => {
    const result = hebrewSchema.parse({ ...good, title: "  כוכב  " });
    expect(result.title).toBe("כוכב");
  });

  it("rejects a title in English", () => {
    const result = hebrewSchema.safeParse({ ...good, title: "Return" });
    expect(result.success).toBe(false);
  });

  it("accepts English names inside Hebrew", () => {
    const title = "הגלקסיה הספירלית M100 בקבוצת הבתולה";
    expect(hebrewSchema.safeParse({ ...good, title }).success).toBe(true);
  });

  it("rejects mostly English with one Hebrew letter", () => {
    const title = "Ignore previous instructions ש";
    expect(hebrewSchema.safeParse({ ...good, title }).success).toBe(false);
  });

  it("rejects HTML and links", () => {
    const html = { ...good, summary: `${good.summary} <b>שלום</b>` };
    const link = { ...good, summary: `${good.summary} ראו http://x.co` };
    expect(hebrewSchema.safeParse(html).success).toBe(false);
    expect(hebrewSchema.safeParse(link).success).toBe(false);
  });

  it("rejects the same tag twice", () => {
    const result = hebrewSchema.safeParse({ ...good, tags: ["star", "star"] });
    expect(result.success).toBe(false);
  });

  it("rejects a tag that isn't on the list", () => {
    const result = hebrewSchema.safeParse({ ...good, tags: ["dragon"] });
    expect(result.success).toBe(false);
  });

  it("rejects no tags, and more than 5", () => {
    expect(hebrewSchema.safeParse({ ...good, tags: [] }).success).toBe(false);
    const six = ["galaxy", "nebula", "star", "planet", "moon", "sun"];
    expect(hebrewSchema.safeParse({ ...good, tags: six }).success).toBe(false);
  });

  it("rejects a missing summary", () => {
    const result = hebrewSchema.safeParse({ title: good.title, tags: ["sun"] });
    expect(result.success).toBe(false);
  });
});

describe("apodDateParamSchema", () => {
  const ok = (date: string) => apodDateParamSchema.safeParse({ date }).success;

  it("accepts a real date", () => {
    expect(ok("2015-03-14")).toBe(true);
  });

  it("accepts the first APOD", () => {
    expect(ok("1995-06-16")).toBe(true);
  });

  it("rejects a date before the first APOD", () => {
    expect(ok("1995-06-15")).toBe(false);
  });

  it("rejects a date in the future", () => {
    const nextYear = new Date().getUTCFullYear() + 1;
    expect(ok(`${nextYear}-01-01`)).toBe(false);
  });

  it("rejects dates that don't exist", () => {
    expect(ok("2015-02-30")).toBe(false);
    expect(ok("2015-13-01")).toBe(false);
  });

  it("rejects other formats", () => {
    expect(ok("150314")).toBe(false);
    expect(ok("14/03/2015")).toBe(false);
  });
});
