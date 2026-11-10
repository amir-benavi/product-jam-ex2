import { Link } from "react-router";
import { useAuth } from "../../lib/auth";
import styles from "./HomePage.module.css";

/** One card on the home page: a part of the assignment and where it lives. */
type Part = {
  to: string;
  title: string;
  description: string;
  needsLogin: boolean;
};

const PARTS: Part[] = [
  {
    to: "/tic-tac-toe",
    title: "Tic-tac-toe: four",
    description:
      "Two players, one screen, a 4×4 board: four in a row wins. The server replays every game before it saves the result.",
    needsLogin: true,
  },
  {
    to: "/nasa",
    title: "Space pictures",
    description:
      "Random pictures from NASA's Astronomy Picture of the Day, explained in Hebrew by Gemini for a 10 year old.",
    needsLogin: true,
  },
  {
    to: "/design",
    title: "Design to code",
    description:
      "Wizzin, LinkedIn for wizards: my designer partner's mobile Figma design, with tablet and desktop layouts we decided together. They also made their first pull request to this app.",
    needsLogin: false,
  },
];

/**
 * The home page: what this app is, and a link to each part of ex2. The
 * pages that need a login send you to log in first, so the cards only say
 * so; they don't hide anything.
 */
export default function HomePage() {
  const { user } = useAuth();

  return (
    <main className={styles.page}>
      <h1>Product Jam, assignment 2</h1>
      <p className={styles.intro}>
        A web app with a real backend: a database I designed, an API that
        doesn&apos;t trust the browser, and a feature that uses an LLM. Built on
        the course starter kit, with React, Hono on Cloudflare Workers, and
        Supabase.
      </p>

      <ul className={styles.parts}>
        {PARTS.map((part) => (
          <li key={part.to}>
            <Link to={part.to} className={styles.card}>
              <h2 className={styles.cardTitle}>{part.title}</h2>
              <p>{part.description}</p>
              {part.needsLogin && !user ? (
                <span className={styles.note}>Needs a login</span>
              ) : null}
            </Link>
          </li>
        ))}
      </ul>

      <div className={styles.logos}>
        <img src="/huji.svg" alt="HUJI Logo" width="80" height="80" />
        <img src="/bezalel.svg" alt="Bezalel Logo" width="80" height="80" />
      </div>
    </main>
  );
}
