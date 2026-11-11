# /design on wider screens: proposal for the designer

The phone version (360-440px) stays exactly as approved. Everything below is a
draft for tablets (from 768px) and desktops (from 1280px), to decide together.
Fonts and spacing grow smoothly with the screen width (`clamp()`), never below
their phone size.

**From your desktop frame:** the desktop background, the logo on the left and
the opening text in a narrow column on the right (both at the top), the logo at
440px wide, and about 1440px of content between the margins. **Our proposal (not
in the frame yet):** everything below the logo.

## Whole page

- **Max content width:** 1440px, from the frame's margins (153px and 129px on a
  1728px frame). Above 1440px the content stays 1440px wide in the middle, the
  light bands still run edge to edge, and fonts stop growing at about 1600px.
- **Why:** lines and cards don't stretch across a very wide screen.
- **Rejected:** letting the content fill any width. At 1920px the text lines get
  too long, and the cards get very wide.

Designer's notes:

## Background

- **Phone:** the phone image, as now. **From 441px:** your desktop image (1728 ×
  1117px). The phone image is 439px wide, so from 441px it would have to be
  stretched, and that's where it switches.
- The desktop image fills the screen, not the whole page, and the page scrolls
  over it. Covering the whole ~3000px-tall page would blow it up about three
  times and make it blurry.
- **Above 1728px** (the image's real width) it isn't stretched: it stays 1728px
  wide in the middle, with black on the sides. **We need a wider image (at least
  1920px, ideally 2560px) if you want it to reach the edges.**
- **Rejected:** repeating the image down the page (the edges would show seams),
  or stretching it to 1920px (blurry).

Designer's notes:

## Opening text and logo

- **768:** "המצב היום" and "המטרות" side by side, "מה המוצר?" across both under
  them (lines capped at about 600px). The logo is under them, centred, at its
  phone size.
- **1280:** as in your frame: the logo on the left (440px), the text in a 512px
  column on the right, both at the top.
- **Why:** the frame decided 1280. At 768 a 512px column would leave a large
  empty space beside it, so the two lists fill the width instead.
- **Rejected at 768:** the logo and the text side by side, as at 1280. At 768px
  each half is only ~350px wide, which is too narrow for the big logo.

Designer's notes:

## Colour palette (added after the review)

- [x] **The six colour squares are on the page**, as you asked after the review
      (they were left out at first as a style guide). **Phone:** under the logo,
      edge to edge, two in a row, square at 440px (up to 220px tall on wider
      phones). **768:** three in a row, 660px wide, under the logo, as in the
      desktop frame. **1280:** under the logo in the left column, next to the
      opening text, as in the desktop frame. The rest of the page is unchanged.

## Profile (photo, stats, about card, skills)

- **768:** photo and stats on the left, the about card on the right; under them,
  "Verified Skills" with the two skills side by side, then "Experience".
- **1280:** like a profile page: photo, stats and the about card in a narrower
  column on the left (5/12), skills and experience on the right (7/12).
- **Why:** the about card and the stats are about the person, the skills are
  details, so they sit apart.
- **Rejected:** keeping the phone's single column, only wider. The skill rows
  would be ~1400px wide with a lot of empty space in them.

Designer's notes (desktop, 1280px and up):

- [x] **Stats (12 Connections, 5 Followers) are cramped.** More room between
      each number and its label, and inside the box, growing with the screen
      width up to a maximum (`clamp()`).
- [x] **"For all those Wizards living among us." on a new line.** Each sentence
      is its own `<span>`, shown as a block on desktop. The phone layout is
      unchanged.
- [x] **"Message" button on the left.** Aligned to the start side.
- [x] **"Verified Skills" and "Experience on Wizzin" side by side**, in two
      columns.

## The light bands ("למי שמחפש", "למי שמחפשים אותו", "מה אנחנו בונים")

- **768 and 1280:** still edge to edge, with their text lined up with the
  content's edges, a little more padding, and bigger fonts. In "מה אנחנו בונים"
  the three features sit in three columns.
- **Why:** the full-width bands are what separates the sections; boxing them in
  would lose that.
- **Rejected:** bands as boxes 1440px wide, like the cards.

Designer's notes:

- [x] **"הזמנה למשימה" text** changed to "תיאור קצר, עם שליחה ואישור" (at every
      width, phone included). "הזמנה למשימה" stays bold.

## Specialties (8 cards)

- **768:** 4 columns × 2 rows (2 columns on a phone). **1280:** still 4 columns,
  with more space inside and between the cards.
- **Why:** 8 in one row doesn't fit at 1280: the names ("Specialist",
  "Whisperer") don't fit in ~140px cards.
- **Rejected:** 8 columns from 1440px. The names would have to break or shrink.

Designer's notes:

## Mission posts (Sue and Ray)

- **768:** still one under the other, as wide as the content.
- **1280:** side by side. Ray's post has a bit more room at its top and bottom
  in the phone frame; side by side that made it look shifted down, so on desktop
  both posts start the same way.
- **Why:** at 768 each post would be ~350px wide, and the big names would break
  onto two lines.
- **Rejected:** two columns from 768.

Designer's notes (desktop, 1280px and up):

- [x] **The two posts the same height.** In Sue's post, "In serious need of a
      solution." starts on a new line. Whenever the posts sit side by side, both
      cards are as tall as the taller one, with "Apply to Mission" at the bottom
      of each.

## Not changed (yet)

- **Icons** stay at their phone sizes (they are drawn at that size in Figma).
  Should they grow on desktop?
- **The kit's header and footer** are the same as on the rest of the site.

Designer's notes:
