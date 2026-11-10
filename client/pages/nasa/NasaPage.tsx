import type { ApodTag, Picture } from "@shared/schemas/apod";
import { Button, Card, Spinner } from "../../components";
import { useExplain, usePictures } from "../../features/apod/hooks";
import { LANG } from "../../lib/config";
import styles from "./NasaPage.module.css";

/**
 * Random pictures from NASA's Astronomy Picture of the Day, and a button on
 * each one to explain it in Hebrew. The server talks to NASA and Gemini; this
 * page only ever talks to our server.
 */
export default function NasaPage() {
  const picturesQuery = usePictures();

  return (
    <main className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1>Space pictures</h1>
          <p className={styles.intro}>
            Random pictures from NASA&apos;s Astronomy Picture of the Day.
          </p>
        </div>
        {/* isFetching, not isPending: also true while more are loading. */}
        <Button
          variant="secondary"
          loading={picturesQuery.isFetching}
          onClick={() => void picturesQuery.refetch()}
        >
          More pictures
        </Button>
      </div>

      <PictureList query={picturesQuery} />
    </main>
  );
}

/** The cards, in all four states: loading, error, empty and loaded. */
function PictureList({ query }: { query: ReturnType<typeof usePictures> }) {
  if (query.isPending) {
    return (
      <div className={styles.centered} aria-live="polite">
        <Spinner size="lg" />
        <p>Loading pictures from NASA…</p>
      </div>
    );
  }
  if (query.isError) {
    return (
      <Card padding="lg">
        {/* The server's message is written for people, so show it as is. */}
        <p role="alert">{query.error.message}</p>
        <Button variant="secondary" onClick={() => void query.refetch()}>
          Try again
        </Button>
      </Card>
    );
  }
  if (query.data.length === 0) {
    return (
      <Card padding="lg">
        <p className={styles.muted}>NASA sent no pictures. Try again.</p>
      </Card>
    );
  }
  return (
    <ul className={styles.grid}>
      {query.data.map((picture) => (
        <li key={picture.date}>
          <PictureCard picture={picture} />
        </li>
      ))}
    </ul>
  );
}

function PictureCard({ picture }: { picture: Picture }) {
  return (
    <Card padding="none" className={styles.card}>
      {picture.image_url ? (
        <img
          className={styles.image}
          src={picture.image_url}
          alt={picture.title}
          loading="lazy"
          decoding="async"
        />
      ) : (
        <div className={styles.noImage}>No image for this day</div>
      )}

      <div className={styles.body}>
        <h2 className={styles.title}>{picture.title}</h2>
        <time className={styles.date} dateTime={picture.date}>
          {formatDate(picture.date)}
        </time>
        <p className={styles.explanation}>{picture.explanation}</p>

        {picture.hebrew ? (
          <HebrewExplanation hebrew={picture.hebrew} />
        ) : (
          <ExplainButton date={picture.date} />
        )}
      </div>
    </Card>
  );
}

/** The button, then "thinking", then an error with Try again if it fails. */
function ExplainButton({ date }: { date: string }) {
  const explain = useExplain();

  return (
    <div className={styles.explain}>
      <Button loading={explain.isPending} onClick={() => explain.mutate(date)}>
        {explain.isError ? "Try again" : "Explain it in Hebrew"}
      </Button>
      <span aria-live="polite">
        {explain.isPending ? (
          <span className={styles.muted}>Gemini is thinking…</span>
        ) : null}
        {explain.isError ? (
          <span className={styles.error} role="alert">
            {explain.error.message}
          </span>
        ) : null}
      </span>
    </div>
  );
}

function HebrewExplanation({
  hebrew,
}: {
  hebrew: NonNullable<Picture["hebrew"]>;
}) {
  return (
    // The rest of the app is English and left-to-right; this part is Hebrew.
    <section className={styles.hebrew} dir="rtl" lang="he">
      <h3 className={styles.hebrewTitle}>{hebrew.title}</h3>
      <p>{hebrew.summary}</p>
      <ul className={styles.tags}>
        {hebrew.tags.map((tag) => (
          <li key={tag} className={styles.tag}>
            {TAG_NAMES[tag]}
          </li>
        ))}
      </ul>
    </section>
  );
}

/** How each tag is shown, in Hebrew. `Record` makes TypeScript check none is missing. */
const TAG_NAMES: Record<ApodTag, string> = {
  galaxy: "גלקסיה",
  nebula: "ערפילית",
  star: "כוכב",
  planet: "כוכב לכת",
  moon: "ירח",
  sun: "שמש",
  earth: "כדור הארץ",
  comet: "שביט",
  aurora: "זוהר קוטבי",
  eclipse: "ליקוי",
  spacecraft: "חללית",
  other: "אחר",
};

/** "2015-03-14" -> "March 14, 2015", in the app's language. */
function formatDate(date: string) {
  // Read as UTC and shown as UTC, so the day never moves with the time zone.
  return new Intl.DateTimeFormat(LANG, {
    dateStyle: "long",
    timeZone: "UTC",
  }).format(new Date(`${date}T00:00:00Z`));
}
