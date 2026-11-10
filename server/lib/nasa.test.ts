import { describe, expect, it } from "vitest";
import { cleanHtml, imageUrl } from "./nasa";

/*
 * The examples are cut from real answers of apod-basic (2026-11-10 and
 * 2015-03-14).
 */

describe("cleanHtml", () => {
  it("removes the Explanation: label", () => {
    expect(
      cleanHtml("<strong>Explanation:</strong> Sometimes Saturn disappears."),
    ).toBe("Sometimes Saturn disappears.");
  });

  it("removes links but keeps their text, without adding spaces", () => {
    expect(cleanHtml('A <a href="https://x">Saturn</a>ian eclipse')).toBe(
      "A Saturnian eclipse",
    );
  });

  it("removes Tomorrow's picture at the end", () => {
    const html =
      "will be in 2031. <br><br><strong>Tomorrow's picture: </strong>small but mighty";
    expect(cleanHtml(html)).toBe("will be in 2031.");
  });

  it("turns non-breaking spaces and line breaks into single spaces", () => {
    expect(cleanHtml("one <a>two</a> three<br>four")).toBe(
      "one two three four",
    );
  });

  it("decodes entities, once", () => {
    expect(cleanHtml("Sun &amp; Moon &#8211; it&#039;s &amp;lt;")).toBe(
      "Sun & Moon – it's &lt;",
    );
  });

  it("leaves plain text alone", () => {
    expect(cleanHtml("Return at Sunrise")).toBe("Return at Sunrise");
  });
});

describe("imageUrl", () => {
  const real =
    "https://assets.science.nasa.gov/dynamicimage/assets/science/cds/apod/apod/2026/november/Moonsaturn6_Ortu_2124.jpg?w=2124";
  const placeholder =
    "https://assets.science.nasa.gov/dynamicimage/assets/science/astro/programs/cosmic-origins/images/misc/news-thumbnail.png?w=594&h=516";
  const gif =
    "https://assets.science.nasa.gov/content/dam/science/cds/apod/apod/1995/june/jupiter1_vgr.gif";

  it("uses hdurl when it is a real image", () => {
    expect(imageUrl(real, `<IMG SRC="${gif}">`)).toBe(real);
  });

  it("takes the article's image when hdurl is the placeholder", () => {
    const html = `<a href="https://science.nasa.gov/apod/archive/">x</a><IMG SRC="${gif}" alt="">`;
    expect(imageUrl(placeholder, html)).toBe(gif);
  });

  it("answers null for a video day, which has no image", () => {
    const html = '<iframe src="//www.youtube.com/embed/x-wX-wClfig"></iframe>';
    expect(imageUrl(placeholder, html)).toBeNull();
  });

  it("drops an hdurl on another server, or that isn't https", () => {
    expect(imageUrl("https://evil.example/x.png", undefined)).toBeNull();
    expect(
      imageUrl("https://assets.science.nasa.gov.evil.example/x.png", undefined),
    ).toBeNull();
    expect(
      imageUrl("http://assets.science.nasa.gov/x.png", undefined),
    ).toBeNull();
    expect(imageUrl("javascript:alert(1)", undefined)).toBeNull();
  });

  it("decodes &amp; in the article's image link", () => {
    const html = `<img src="${gif}?a=1&amp;b=2">`;
    expect(imageUrl(placeholder, html)).toBe(`${gif}?a=1&b=2`);
  });

  it("never takes an image from another server", () => {
    expect(imageUrl(null, '<img src="https://evil.example/x.png">')).toBeNull();
  });
});
