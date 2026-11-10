import styles from "./DesignPage.module.css";

/**
 * The designer's Wizzin pitch, built from their mobile Figma frame (440px
 * wide). It is outside <RequireAuth> in client/App.tsx, so it works without
 * logging in - and without a .env file, which is how a designer can run it on
 * their own computer.
 *
 * The Hebrew parts explain the product, and are right-to-left. The English
 * parts are a sample of the app itself (a profile, specialties, mission
 * posts), so they stay left-to-right. The sample's buttons only show what the
 * app will look like: they are not <button>s, because they do nothing.
 *
 * Images and icons are in client/public/design/, exported from Figma.
 * Tablet and desktop layouts are a draft for the designer to review: see
 * .claude/assignment/design-questions.md.
 */

/** The 8 specialty cards. `icon` is a file in client/public/design/. */
const specialties = [
  { name: "Potion Specialist", icon: "icon-potion-specialist.svg" },
  { name: "Wand Maker", icon: "icon-wand-maker.svg" },
  { name: "Shape Shifter", icon: "icon-shape-shifter.svg" },
  { name: "Mineral Whisperer", icon: "icon-mineral-whisperer.svg" },
  // In Figma these two icons are a blue ellipse cut by a mask image, so they
  // are drawn by the CSS (see .curseBreakerIcon and .potionCriticIcon).
  { name: "Curse Breaker", maskClass: styles.curseBreakerIcon },
  { name: "Trick Player", icon: "icon-trick-player.svg" },
  { name: "Potion Critic", maskClass: styles.potionCriticIcon },
  { name: "Web Intaker", icon: "icon-web-intaker.svg" },
];

export default function DesignPage() {
  return (
    <main className={styles.page}>
      {/* The opening text and the logo: one under the other on phones, side
          by side on desktops (see .hero in the CSS). */}
      <div className={styles.hero}>
        <section className={styles.intro} dir="rtl" lang="he">
          <div className={styles.introBlock}>
            <h2 className={styles.introHeading}>המצב היום</h2>
            <ul className={styles.bullets}>
              <li>
                בעולם כרגע קוסמים מוצאים שותפים למשימות דרך היכרות אישית, המלצות
                מפה לאוזן ולוחות מודעות
              </li>
              <li>
                כשמקבלים המלצה על קוסם עם התמחות מסוימת אין דרך לדעת אם אפשר
                לסמוך עליו
              </li>
            </ul>
          </div>
          <div className={styles.introBlock}>
            <h2 className={styles.introHeading}>המטרות</h2>
            <ul className={styles.bullets}>
              <li>לרכז קוסמים ואת המידע המקצועי שלהם במקום אחד</li>
              <li>לאפשר קשרים מעבר למעגל המכרים</li>
              <li>לייצר הזדמנויות לחיבורים שלא יכלו להתקיים לפני כן</li>
            </ul>
          </div>
          <div className={styles.introBlock}>
            <h2 className={styles.productHeading}>מה המוצר?</h2>
            <p className={styles.introText}>
              פלטפורמה שבה כל קוסם מציג את התחום בו הוא מתמחה, הניסיון וההמלצות
              שלו, ומוצא שותפים שהיכולות שלהם משלימות אותו למשימות קסומות.
            </p>
          </div>
        </section>

        <h1 className={styles.logo}>
          <img src="/design/logo.svg" alt="Wizzin" width={389} height={106} />
        </h1>
      </div>

      {/* A sample profile in the app. */}
      <section className={styles.profile} lang="en" aria-label="Profile">
        <div className={styles.profileTop}>
          <div className={styles.profilePhotoColumn}>
            <div className={`${styles.photo} ${styles.profilePhoto}`}>
              <img src="/design/profile-photo.png" alt="Profile photo" />
            </div>
            <p className={styles.available}>Available</p>
          </div>
          {/* A <dl> needs the label (<dt>) before the number (<dd>); the CSS
              puts the number on top, as in the design. */}
          <dl className={styles.stats}>
            <div className={styles.stat}>
              <dt className={styles.statLabel}>Connections</dt>
              <dd className={styles.statCount}>12</dd>
            </div>
            <div className={styles.stat}>
              <dt className={styles.statLabel}>Followers</dt>
              <dd className={styles.statCount}>5</dd>
            </div>
          </dl>
        </div>

        <div className={styles.about}>
          <div className={styles.aboutCard}>
            <h2 className={styles.aboutName}>Wizzin</h2>
            <p className={styles.aboutTagline}>LinkedIn for Wizards</p>
            <p className={styles.aboutText}>
              An easier way to find Missions and Manage them too. For all those
              Wizards living among us.
            </p>
          </div>
          <span className={`${styles.fakeButton} ${styles.messageButton}`}>
            Message
          </span>
        </div>

        <div className={styles.details}>
          <h3 className={styles.detailsHeading}>Varified Skills</h3>
          <ul className={styles.skills}>
            <li className={styles.skill}>
              <img src="/design/icon-verified-skills.svg" alt="" />
              <div className={styles.rowText}>
                <p className={styles.rowTitle}>Varifies Skills and Degrees</p>
                <p className={styles.rowSubtitle}>You can always trust us</p>
              </div>
              <img src="/design/icon-check.svg" alt="" />
            </li>
            <li className={`${styles.skill} ${styles.skillTall}`}>
              <img src="/design/icon-discreet.svg" alt="" />
              <div className={styles.rowText}>
                <p className={styles.rowTitle}>Discreet</p>
                <p className={styles.rowSubtitle}>
                  The App will only appear when a wizrad recognized by the OWO
                </p>
              </div>
              <img src="/design/icon-check.svg" alt="" />
            </li>
          </ul>

          <h3 className={styles.detailsHeading}>Experience on Wizzin</h3>
          <div className={styles.experience}>
            <div className={styles.rowText}>
              <p className={styles.rowTitle}>Love Potion for Cupid</p>
              <p className={styles.rowSubtitle}>
                Art Rainforest, Atlanta, 2021
              </p>
            </div>
            <img src="/design/icon-arrow.svg" alt="" />
          </div>
        </div>
      </section>

      <section className={styles.band} dir="rtl" lang="he">
        <h2 className={styles.bandHeading}>למי שמחפש</h2>
        <p className={styles.bandText}>
          שותף מתאים למשימה, עם מידע אמין שאפשר לסמוך עליו.
        </p>
      </section>

      <ul className={styles.specialties} lang="en" aria-label="Specialties">
        {specialties.map((specialty) => (
          <li key={specialty.name} className={styles.specialty}>
            <p className={styles.specialtyName}>{specialty.name}</p>
            {specialty.icon ? (
              <img src={`/design/${specialty.icon}`} alt="" />
            ) : (
              <span className={specialty.maskClass} aria-hidden="true" />
            )}
          </li>
        ))}
      </ul>

      <section className={styles.band} dir="rtl" lang="he">
        <h2 className={styles.bandHeading}>למי שמחפשים אותו</h2>
        <p className={styles.bandText}>
          חשיפה מקצועית מעבר למעגל המכרים ועוד הזדמנויות לחיבורים.
        </p>
      </section>

      {/* Two sample mission posts. Figma spaces them a little differently,
          hence the sue/ray classes. */}
      <section className={styles.posts} lang="en" aria-label="Missions">
        <article className={`${styles.post} ${styles.postSue}`}>
          <header className={styles.postAuthor}>
            <div className={`${styles.photo} ${styles.suePhoto}`}>
              <img src="/design/profile-photo.png" alt="Sue Twill" />
            </div>
            <div className={styles.postAuthorText}>
              <h2 className={styles.postName}>Sue Twill</h2>
              <p className={styles.postRole}>
                Potion specialist
                <br />
                and Wand Des.
              </p>
            </div>
          </header>
          <p className={styles.postText}>
            Quicksand has been spreading all over Porkville City. High risk of
            CURSE! In serious need of a solution.
          </p>
          <div className={styles.lookingFor}>
            <h3 className={styles.lookingForHeading}>Looking for:</h3>
            <ul className={styles.lookingForList}>
              <li>
                <img src="/design/icon-looking-potion.svg" alt="" />
                Potion Specialist
              </li>
              <li>
                <img src="/design/icon-looking-curse.svg" alt="" />
                Curse Breaker
              </li>
            </ul>
          </div>
          <span className={`${styles.fakeButton} ${styles.applyButton}`}>
            Apply to Mission
          </span>
        </article>

        <article className={`${styles.post} ${styles.postRay}`}>
          <header className={styles.postAuthor}>
            <div className={`${styles.photo} ${styles.rayPhoto}`}>
              <img src="/design/ray-kahn.png" alt="Ray Kahn" />
            </div>
            <div className={styles.postAuthorText}>
              <h2 className={styles.postName}>Ray Kahn</h2>
              <p className={styles.postRole}>
                Head of magic devision,
                <br />
                NKY, Claftwerk
              </p>
            </div>
          </header>
          <p className={styles.postText}>
            Carnivorous plants have taken over the grove in the HaNechalim
            neighborhood. A sleep-inducing potion is needed to subdue them.
          </p>
          <div className={styles.lookingFor}>
            <h3 className={styles.lookingForHeading}>Looking for:</h3>
            <ul className={styles.lookingForList}>
              <li>
                <img src="/design/icon-looking-potion-2.svg" alt="" />
                Potion Specialist
              </li>
              <li>
                <img src="/design/icon-looking-curse.svg" alt="" />
                Curse Breaker
              </li>
            </ul>
          </div>
          <span className={`${styles.fakeButton} ${styles.applyButton}`}>
            Apply to Mission
          </span>
        </article>
      </section>

      <section className={styles.band} dir="rtl" lang="he">
        <h2 className={styles.bandHeading}>מה אנחנו בונים</h2>
        <ul className={styles.features}>
          <li>
            <strong>חיפוש וסינון</strong> - כרטיסי קוסמים לפי התמחות וזמינות
          </li>
          <li>
            <strong>פרופיל מקצועי</strong> - יכולות, ניסיון, משימות קודמות
            והמלצות
          </li>
          <li>
            <strong>הזמנה למשימה</strong> - תיאור קצר, שליחה ואישור שהפנייה
            נשלחה
          </li>
        </ul>
      </section>
    </main>
  );
}
