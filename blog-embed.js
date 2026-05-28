(function () {
  try {
    if (typeof document === "undefined" || typeof window === "undefined") return;
    const path = (window.location.pathname || "/").replace(/\/+$/, "") || "/";
    const isBlog = path === "/blog" || path.startsWith("/blog/");
    const isPost = path.startsWith("/post/");
    if (!isBlog && !isPost) return;
    if (document.getElementById("jq-blog-style")) return;

    // Override Wix:s hardkodade `width=320` viewport på mobil — annars
    // renderas /blog och /post/* som om viewport vore 320px breda,
    // oavsett device, vilket gör text gigantisk och layout broken.
    try {
      var vps = document.querySelectorAll('meta[name="viewport"]');
      vps.forEach(function (v) { v.parentNode && v.parentNode.removeChild(v); });
      var nv = document.createElement('meta');
      nv.name = 'viewport';
      nv.content = 'width=device-width, initial-scale=1, viewport-fit=cover';
      nv.setAttribute('data-jq-vp', '1');
      document.head.appendChild(nv);
    } catch (e) {}

    // Spectral + Inter fonts via Google Fonts (preload + display:swap)
    const fontLink = document.createElement("link");
    fontLink.rel = "stylesheet";
    fontLink.href = "https://fonts.googleapis.com/css2?family=Spectral:ital,wght@0,300;0,400;0,500;1,400&family=Inter:wght@400;500;600&display=swap";
    document.head.appendChild(fontLink);

    const css = document.createElement("style");
    css.id = "jq-blog-style";
    css.textContent = `
/* === JQ BLOG — PIXEL-MATCH Götadental (exakta tokens från jq-r1.css) ===
   Source-of-truth: gotadental.se/wp-content/themes/gota-dental/assets/css/jq-r1.css */
:root {
  --jqb-serif: "Spectral", Georgia, serif;
  --jqb-sans: "Inter", -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
  --jqb-bg:    #F0ECE2;  /* page bg — light beige */
  --jqb-bg-lt: #F6F3EC;  /* lighter bg */
  --jqb-lav:   #E2E6F0;  /* lavender */
  --jqb-ink:   #15171B;  /* coal — primary text */
  --jqb-deep:  #100F0D;  /* darker coal */
  --jqb-cream: #F4F1EA;  /* cream — alt bg */
  --jqb-line:  #D5D9E2;  /* borders */
  --jqb-stone: #6C7079;  /* secondary text */
  --jqb-text:  #2c2b25;  /* body text (warmer than ink) */
  --jqb-accent:#1E73BE;  /* blue link/accent */
  --jqb-ease:  cubic-bezier(.16, 1, .3, 1);
}

/* === DÖLJ WIX BLOG CHROME — editorial cleanup för pixel-match Götadental === */
/* Skäl: Wix Blog injicerar share-bar / "..."-menu / view-stats / recent-posts
   / tags / desktop-header. Allt bryter Götadentals lugna long-read-känsla.
   Vi behåller: post-title, time-ago, time-to-read, post-description,
   post-hero-image, post-content. Allt annat döljs på /post/*. */
${isPost ? `
[data-hook="blog-desktop-header-container"],
[data-hook="post-main-actions-desktop"],
[data-hook="post-main-actions__stats"],
[data-hook="post-stats"],
[data-hook="post-footer"],
[data-hook="recent-posts"],
[data-hook="more-button"],
[data-hook="share-button__facebook"],
[data-hook="share-button__link"],
[data-hook="share-button__linked-in"],
[data-hook="share-button__print"],
[data-hook="share-button__twitter"],
[data-hook="search-input"],
[data-hook="message"],
[data-hook="comments"],
[data-hook="post-tags"],
[data-hook="post-page-categories"],
[data-hook="categories-list"],
[data-hook="author-with-name-and-picture"],
[data-hook="post-page-author-info"],
[data-hook="related-posts"],
[data-hook="post-page-related-posts"],
.subscribe-form,
.subscription-widget,
[class*="subscribe"],
[class*="SubscribeButton"],
[class*="PrevNextLink"],
.blog-post-prev-next,
[data-hook="prev-link"],
[data-hook="next-link"] {
  display: none !important;
  visibility: hidden !important;
  height: 0 !important;
  margin: 0 !important;
  padding: 0 !important;
  overflow: hidden !important;
}
/* "..." mer-knapp wrapper kan ha sin egen container — fånga upp */
[id^="more-button-"] { display: none !important; }

/* Wix Mobile Blog Navigation — "Inlägg" + "All Posts"-dropdown ovanför post.
   Wix injicerar dessa bara på mobile. blog-header/blog-button är stabila globala klasser. */
html body .blog-header-background-color,
html body .blog-button-background-color,
html body [class*="blog-header-background"],
html body [class*="blog-button-background"] {
  display: none !important;
  visibility: hidden !important;
  height: 0 !important;
}
/* jq-welcome-popup + Tour-widget ska INTE visa på /post + /blog */
html body jq-welcome-popup,
html body [class*="welcome-popup"],
html body .jq-welcome-popup,
html body #jq-tb,
html body #jq-tg,
html body #jq-tt,
html body #jq-pop-backdrop {
  display: none !important;
  visibility: hidden !important;
}
` : ""}

/* === SCROLL-PROGRESS-BAR ============================================ */
#jq-blog-progress {
  position: fixed; top: 0; left: 0; right: 0;
  height: 1px; z-index: 99999; pointer-events: none;
  background: rgba(0,0,0,.06);
}
#jq-blog-progress > i {
  display: block; height: 100%;
  background: var(--jqb-ink);
  transform-origin: left center;
  transform: scaleX(0);
  transition: transform .12s linear;
}

/* === CHAPTER RAIL (desktop only, sticky vänster) ==================== */
#jq-blog-rail {
  position: fixed;
  top: 110px; left: max(24px, calc((100vw - 1200px) / 2 - 280px));
  width: 260px; max-height: calc(100vh - 140px);
  overflow-y: auto; z-index: 50;
  font-family: var(--jqb-sans);
  pointer-events: auto;
}
#jq-blog-rail .eb {
  font-size: 9.5px; letter-spacing: .26em;
  text-transform: uppercase; color: var(--jqb-stone);
  margin-bottom: 14px; padding-left: 14px;
}
#jq-blog-rail ol {
  list-style: none; margin: 0; padding: 0;
}
#jq-blog-rail li { margin: 0; }
#jq-blog-rail a {
  display: flex; align-items: baseline; gap: 10px;
  padding: 9px 14px; text-decoration: none;
  color: var(--jqb-stone);
  border-left: 1px solid var(--jqb-line);
  transition: color .25s var(--jqb-ease), border-color .25s var(--jqb-ease);
  font-size: 11.5px; line-height: 1.4;
}
#jq-blog-rail a:hover,
#jq-blog-rail li.is-active a {
  color: var(--jqb-ink);
  border-left-color: var(--jqb-ink);
}
#jq-blog-rail .n {
  font-feature-settings: "tnum" 1;
  font-size: 9.5px;
  letter-spacing: .14em;
  color: var(--jqb-line);
  flex: 0 0 18px;
}
#jq-blog-rail li.is-active .n { color: var(--jqb-ink); }
@media (max-width: 1180px) { #jq-blog-rail { display: none; } }

/* === BACK-LINK (Tillbaka till bloggen) — injectas ovanför post-title === */
.jq-blog-back-wrap {
  max-width: 720px; margin: 0 auto;
  padding: clamp(28px, 4vw, 56px) 20px clamp(8px, 1.5vw, 14px);
}
@media (min-width: 768px) { .jq-blog-back-wrap { padding-left: 32px; padding-right: 32px; } }
.jq-blog-back {
  display: inline-flex; align-items: center; gap: 8px;
  font-family: var(--jqb-sans); font-size: 11px;
  letter-spacing: .22em; text-transform: uppercase;
  color: var(--jqb-stone); text-decoration: none;
  border: none !important; padding: 0;
  transition: color .25s var(--jqb-ease);
}
.jq-blog-back:hover { color: var(--jqb-ink); }
.jq-blog-back span[aria-hidden] { font-size: 14px; letter-spacing: 0; }

/* === META-ROW · separators · kategori · datum · läs-tid === */
/* Wix bygger en <ul> med time-ago + time-to-read. Vi targetar listan så
   den ser ut som Götadentals "Filler · 2 jan 2026 · 4 min läsning". */
[data-hook="post-page-root"] .a5JqMF > ul,
[data-hook="post-page-root"] ul:has([data-hook="time-ago"]) {
  display: flex !important; flex-wrap: wrap; gap: 10px;
  margin: 0 0 24px !important; padding: 0 !important; list-style: none !important;
  font-family: var(--jqb-sans) !important;
  font-size: 11px !important; letter-spacing: .22em !important;
  text-transform: uppercase !important; color: var(--jqb-stone) !important;
}
[data-hook="post-page-root"] ul:has([data-hook="time-ago"]) > li {
  margin: 0 !important; padding: 0 !important; display: inline-flex; align-items: center;
}
[data-hook="post-page-root"] ul:has([data-hook="time-ago"]) > li + li::before {
  content: "·"; display: inline-block; margin: 0 12px 0 2px;
  color: var(--jqb-line); font-size: 13px; letter-spacing: 0;
}
[data-hook="time-ago"], [data-hook="time-to-read"] {
  font-family: var(--jqb-sans) !important;
  font-size: 11px !important; letter-spacing: .22em !important;
  text-transform: uppercase !important; color: var(--jqb-stone) !important;
  font-weight: 500 !important;
}

/* === FAKTAGRANSKAD-RAD med ✓ check === */
.jq-blog-fakta {
  display: flex; align-items: center; gap: 10px;
  font-family: var(--jqb-sans); font-size: 12px; letter-spacing: .04em;
  color: var(--jqb-stone); font-weight: 500;
  margin: 18px 0 0;
  padding-top: 18px; border-top: 1px solid var(--jqb-line);
  max-width: 720px;
}
.jq-blog-fakta svg {
  flex: 0 0 18px; width: 18px; height: 18px; color: var(--jqb-accent);
}

/* === FEATURED IMAGE — wide-wrap (full-width hero) === */
[data-hook="post-hero-image"] {
  max-width: 1100px !important; margin: clamp(20px, 3vw, 36px) auto clamp(32px, 5vw, 56px) !important;
  padding: 0 24px !important;
}
[data-hook="post-hero-image"] img {
  border-radius: 4px;
}

/* === POST CONTENT TYPOGRAFI ========================================= */
/* Wix Blog post-body container. Vi targetar SEMANTISKA klasser. */
.blog-post-title-font,
[data-hook="post-title"],
.post-page-content h1,
.post-page-content .title {
  font-family: var(--jqb-serif) !important;
  font-weight: 400 !important;
  font-size: clamp(2rem, 5vw, 4rem) !important;
  line-height: 1.05 !important;
  letter-spacing: -.025em !important;
  color: var(--jqb-ink) !important;
  margin-top: 0 !important;
  margin-bottom: 18px !important;
}

.blog-post-description-font,
[data-hook="post-description"],
.post-page-content p,
[data-hook="post-content"] p {
  font-family: var(--jqb-serif) !important;
  font-size: 17px !important;
  line-height: 1.78 !important;
  color: var(--jqb-text) !important;
  max-width: none !important;
}

/* H2 — Götadental .gd-content h2 exakt */
.post-page-content h2,
[data-hook="post-content"] h2 {
  font-family: var(--jqb-serif) !important;
  font-weight: 400 !important;
  font-size: clamp(1.6rem, 2.6vw, 2.2rem) !important;
  line-height: 1.18 !important;
  letter-spacing: -.018em !important;
  color: var(--jqb-ink) !important;
  margin: 2em 0 .55em !important;
  max-width: none !important;
}

/* H3 — Götadental .gd-content h3 exakt */
.post-page-content h3,
[data-hook="post-content"] h3 {
  font-family: var(--jqb-serif) !important;
  font-weight: 400 !important;
  font-size: 1.4rem !important;
  line-height: 1.25 !important;
  letter-spacing: -.012em !important;
  color: var(--jqb-ink) !important;
  margin: 1.7em 0 .45em !important;
}

/* Inline italic (våra meta-rows + faktagranskad-rad) */
.post-page-content p em,
.post-page-content em {
  font-style: italic; color: var(--jqb-stone);
}

/* Bold-paragrafer (vår lede + kategori i kort) */
.post-page-content p strong,
.post-page-content strong {
  font-weight: 500; color: var(--jqb-ink);
}

/* Bullet-rows (• som börjar paragraf) */
.post-page-content p:has(> :first-child:not(strong)):is([data-bullet], p) { }

/* Länkar i content */
.post-page-content a:not(.blog-post-cta-button),
[data-hook="post-content"] a {
  color: var(--jqb-ink) !important;
  text-decoration: none !important;
  border-bottom: 1px solid var(--jqb-line);
  transition: border-color .25s var(--jqb-ease);
}
.post-page-content a:hover {
  border-bottom-color: var(--jqb-ink);
}

/* CTA-länkar (👉 prefixade) får knapp-look via attribut-targeting */
.post-page-content p:has(strong > a) {
  margin-top: 28px;
}

/* === BLOG ARCHIVE (/blog) — DÖLJ WIX DEFAULT + STYLA EGEN ARCHIVE === */
${isBlog ? `
/* Dölj Wix default feed-page-widget (post-list, sök, kategori-dropdown, subscribe).
   Vi bygger en egen archive via injectArchive() — Wix default förstör pixel-match.
   HÖG SPECIFICITY via html-prefix + body-attribut + flera lager !important. */
html body [data-hook="post-list-pro-gallery-container"],
html body [data-hook="post-list-pro-gallery-container"] *,
html body [data-hook="post-list-item"],
html body [data-hook="feed-page-root"] [data-hook="post-list-pro-gallery-container"],
html body [data-hook="feed-page-root"] [data-hook="search-input"],
html body [data-hook="header-categories-mobile-button"],
html body [data-hook="header-back-button-container"],
html body [data-hook^="slot-placeholder-"],
html body [data-hook="pagination"],
html body [data-hook="load-more-button"],
html body div[data-hook*="post-list"],
html body section[data-hook*="post-list"],
html body .post-list-pro-gallery-pg-text-on-image-medium,
html body .post-list-pro-gallery-pg-text-on-image-small,
html body .post-list-pro-gallery,
html body [class*="post-list-pro-gallery"],
html body [class*="blog-categories"],
html body [class*="categories-dropdown"],
html body [data-hook*="subscribe"],
html body [data-hook*="rss-button"],
html body .blog-pagination {
  display: none !important;
  visibility: hidden !important;
  max-height: 0 !important;
  height: 0 !important;
  width: 0 !important;
  margin: 0 !important;
  padding: 0 !important;
  overflow: hidden !important;
  opacity: 0 !important;
  position: absolute !important;
  pointer-events: none !important;
  z-index: -1 !important;
}
/* Säkerställ att vår archive ALDRIG döljs av Wix-overrides */
html body #jq-archive,
html body #jq-archive * {
  visibility: visible !important;
  opacity: 1 !important;
  pointer-events: auto !important;
}
html body #jq-archive {
  display: block !important;
  position: relative !important;
  z-index: 10 !important;
}

/* === JQ-ARCHIVE — vår egen archive (injectad via JS) ============== */
#jq-archive {
  display: block;
  font-family: var(--jqb-sans);
  background: var(--jqb-cream);
  color: var(--jqb-ink);
  position: relative;
  z-index: 5;
}
#jq-archive .jq-sec { padding: clamp(40px, 5vw, 80px) 0; }
#jq-archive .jq-wrap {
  max-width: 1180px;
  margin: 0 auto;
  padding: 0 clamp(20px, 3vw, 40px);
}
#jq-archive .jq-eyebrow {
  display: block; font-family: var(--jqb-sans);
  font-size: 10.5px; letter-spacing: .26em; text-transform: uppercase;
  color: var(--jqb-stone); margin-bottom: 18px; font-weight: 500;
}

/* HERO */
#jq-archive .jq-blog-hero {
  padding: clamp(40px, 6vh, 80px) 0 clamp(32px, 4vw, 56px);
}
#jq-archive .jq-blog-hero-h {
  font-family: var(--jqb-serif); font-weight: 400;
  font-size: clamp(2.2rem, 5vw, 4.5rem);
  line-height: 1.02; letter-spacing: -.028em;
  color: var(--jqb-ink); margin: 14px 0 clamp(22px, 2.6vw, 36px);
  max-width: 16ch;
}
#jq-archive .jq-blog-hero-h em { font-style: italic; color: currentColor; }
#jq-archive .jq-blog-hero-lede {
  font-family: var(--jqb-serif);
  font-size: clamp(1rem, 1.2vw, 1.15rem); line-height: 1.55;
  color: var(--jqb-stone); max-width: 56ch;
  margin: 0 0 clamp(20px, 2.4vw, 30px);
}
#jq-archive .jq-blog-hero-meta {
  display: flex; gap: 14px; align-items: center;
  font-family: var(--jqb-sans); font-size: 10.5px;
  letter-spacing: .22em; text-transform: uppercase; color: var(--jqb-stone);
}
#jq-archive .jq-blog-hero-meta b { color: var(--jqb-ink); font-weight: 600; }
#jq-archive .jq-blog-hero-dot { color: var(--jqb-line); }

/* FILTER PILLS */
#jq-archive .jq-blog-filter-sec {
  padding: 0 0 clamp(36px, 5vw, 60px);
  border-bottom: 1px solid var(--jqb-line);
}
#jq-archive .jq-blog-filter { display: flex; flex-wrap: wrap; gap: 8px; }
#jq-archive .jq-blog-pill {
  background: transparent; border: 1px solid var(--jqb-line);
  color: var(--jqb-stone); padding: 10px 16px;
  font-family: var(--jqb-sans); font-size: 11px;
  letter-spacing: .18em; text-transform: uppercase;
  cursor: pointer;
  transition: background .25s var(--jqb-ease), color .25s var(--jqb-ease), border-color .25s var(--jqb-ease);
  display: inline-flex; align-items: center; gap: 8px; min-height: 40px;
}
#jq-archive .jq-blog-pill:hover { border-color: var(--jqb-ink); color: var(--jqb-ink); }
#jq-archive .jq-blog-pill.is-active {
  background: var(--jqb-ink); color: var(--jqb-cream); border-color: var(--jqb-ink);
}
#jq-archive .jq-blog-pill-n {
  font-feature-settings: "tnum" on, "lnum" on; font-size: 10px; opacity: .7;
}

/* FEATURED 3-CARDS */
#jq-archive .jq-blog-featured { padding: clamp(28px, 3vw, 44px) 0 clamp(28px, 3.5vw, 48px); border-top: 1px solid var(--jqb-line); }
#jq-archive .jq-blog-featured-grid {
  display: grid; grid-template-columns: 1fr 1fr;
  gap: clamp(24px, 3vw, 48px);
}
#jq-archive .jq-blog-fcard { margin: 0; }
#jq-archive .jq-blog-fcard--big { grid-column: 1 / -1; }
/* Big card: 2-column (image left, text right) only when image present */
#jq-archive .jq-blog-fcard--big .jq-blog-fcard-link:has(.jq-blog-fcard-img) { grid-template-columns: 1.4fr 1fr; }
#jq-archive .jq-blog-fcard-link {
  display: grid; grid-template-columns: 1fr;
  gap: clamp(20px, 2.5vw, 36px);
  text-decoration: none; color: var(--jqb-ink);
  padding-bottom: clamp(32px, 4vw, 56px);
  border-bottom: 1px solid var(--jqb-line);
  transition: opacity .35s var(--jqb-ease);
}
#jq-archive .jq-blog-fcard-link:hover { opacity: .85; }
#jq-archive .jq-blog-fcard-img {
  overflow: hidden; background: var(--jqb-sand); aspect-ratio: 16/10;
}
#jq-archive .jq-blog-fcard--big .jq-blog-fcard-img { aspect-ratio: 4/3; }
#jq-archive .jq-blog-fcard-img img {
  width: 100%; height: 100%; object-fit: cover; display: block;
  transition: transform 1.2s var(--jqb-ease);
}
#jq-archive .jq-blog-fcard-link:hover .jq-blog-fcard-img img { transform: scale(1.03); }
#jq-archive .jq-blog-fcard-body { display: flex; flex-direction: column; gap: 14px; padding-top: 8px; }
#jq-archive .jq-blog-fcard-meta {
  font-family: var(--jqb-sans); font-size: 10.5px;
  letter-spacing: .22em; text-transform: uppercase; color: var(--jqb-stone);
  display: flex; gap: 10px; align-items: center; flex-wrap: wrap;
}
#jq-archive .jq-blog-fcard-h {
  font-family: var(--jqb-serif); font-weight: 400;
  font-size: clamp(1.5rem, 2.6vw, 2.4rem);
  line-height: 1.08; letter-spacing: -.018em;
  color: var(--jqb-ink); margin: 0;
}
#jq-archive .jq-blog-fcard--big .jq-blog-fcard-h {
  font-size: clamp(1.9rem, 3.8vw, 3.4rem); letter-spacing: -.022em;
}
/* No-image big card: same size as regular big card, constrained width */
#jq-archive .jq-blog-fcard--big .jq-blog-fcard-link:not(:has(.jq-blog-fcard-img)) .jq-blog-fcard-h {
  font-size: clamp(1.9rem, 3.8vw, 3.4rem); max-width: 26ch;
}
#jq-archive .jq-blog-fcard-lead {
  font-family: var(--jqb-serif); font-size: 1rem; line-height: 1.55;
  color: var(--jqb-stone); margin: 0; max-width: 56ch;
}
#jq-archive .jq-blog-fcard-more {
  font-family: var(--jqb-sans); font-size: 11px;
  letter-spacing: .26em; text-transform: uppercase;
  color: var(--jqb-ink); margin-top: 6px;
}
#jq-archive .jq-blog-fcard-more span {
  display: inline-block; transition: transform .35s var(--jqb-ease);
}
#jq-archive .jq-blog-fcard-link:hover .jq-blog-fcard-more span { transform: translateX(6px); }

/* ARKIV-LISTA (text-tabell) */
#jq-archive .jq-blog-list-sec {
  padding: clamp(36px, 5vw, 72px) 0 clamp(48px, 6vw, 96px);
  border-top: 1px solid var(--jqb-line);
}
#jq-archive .jq-blog-list-head { margin-bottom: clamp(24px, 3vw, 40px); }
#jq-archive .jq-blog-list-h {
  font-family: var(--jqb-serif); font-weight: 400;
  font-size: clamp(1.5rem, 2.2vw, 2rem);
  letter-spacing: -.018em; color: var(--jqb-ink); margin: 8px 0 0;
}
#jq-archive .jq-blog-list { list-style: none; margin: 0; padding: 0; }
#jq-archive .jq-blog-row { border-top: 1px solid var(--jqb-line); }
#jq-archive .jq-blog-row:last-child { border-bottom: 1px solid var(--jqb-line); }
#jq-archive .jq-blog-row-link {
  display: grid;
  grid-template-columns: 96px minmax(0,1fr) auto;
  gap: clamp(20px, 2.5vw, 36px);
  padding: clamp(20px, 2.4vw, 28px) 0;
  text-decoration: none; color: var(--jqb-ink);
  align-items: baseline;
  transition: background .25s var(--jqb-ease);
}
#jq-archive .jq-blog-row-link:hover { background: rgba(217,210,196,.25); }
#jq-archive .jq-blog-row-link:hover .jq-blog-row-arrow { transform: translateX(6px); }
#jq-archive .jq-blog-row-date {
  display: flex; flex-direction: column;
  font-family: var(--jqb-sans); color: var(--jqb-stone);
  letter-spacing: .04em; line-height: 1.1;
}
#jq-archive .jq-blog-row-d {
  font-family: var(--jqb-serif); font-style: italic; font-size: 22px;
  color: var(--jqb-ink); font-feature-settings: "tnum" on, "lnum" on;
}
#jq-archive .jq-blog-row-m { font-size: 10px; letter-spacing: .26em; margin-top: 4px; }
#jq-archive .jq-blog-row-y { font-size: 10px; letter-spacing: .22em; color: var(--jqb-line); }
#jq-archive .jq-blog-row-main { display: flex; flex-direction: column; gap: 6px; min-width: 0; }
#jq-archive .jq-blog-row-cat {
  font-family: var(--jqb-sans); font-size: 10.5px;
  letter-spacing: .22em; text-transform: uppercase; color: var(--jqb-stone);
}
#jq-archive .jq-blog-row-h {
  font-family: var(--jqb-serif); font-weight: 400;
  font-size: clamp(1.15rem, 1.8vw, 1.55rem);
  line-height: 1.18; letter-spacing: -.014em;
  color: var(--jqb-ink); margin: 0;
}
#jq-archive .jq-blog-row-lead {
  font-family: var(--jqb-serif); font-size: 14.5px; line-height: 1.5;
  color: var(--jqb-stone); margin: 0; max-width: 64ch;
}
#jq-archive .jq-blog-row-meta {
  display: flex; gap: 18px; align-items: center;
  font-family: var(--jqb-sans); font-size: 10.5px;
  letter-spacing: .22em; text-transform: uppercase; color: var(--jqb-stone);
  white-space: nowrap;
}
#jq-archive .jq-blog-row-arrow {
  display: inline-block; transition: transform .35s var(--jqb-ease); color: var(--jqb-ink);
}
#jq-archive .jq-blog-empty {
  padding: 48px 0; text-align: center;
  color: var(--jqb-stone); font-family: var(--jqb-serif); font-style: italic;
}
@media (max-width: 880px) {
  #jq-archive .jq-blog-featured-grid { grid-template-columns: 1fr; }
  #jq-archive .jq-blog-fcard--big .jq-blog-fcard-link,
  #jq-archive .jq-blog-fcard-link { grid-template-columns: 1fr; }
  #jq-archive .jq-blog-row-link {
    grid-template-columns: 72px minmax(0,1fr); gap: 16px;
  }
  #jq-archive .jq-blog-row-meta { display: none; }
  #jq-archive .jq-blog-row-lead { display: none; }
}
@media (max-width: 540px) {
  #jq-archive .jq-blog-pill { font-size: 10px; padding: 8px 12px; }
  #jq-archive .jq-blog-row-d { font-size: 18px; }
}
` : ""}

/* === RESPONSIVE PADDING I POST-BODY ================================= */
.post-page-content,
[data-hook="post-page-content"] {
  max-width: 720px;
  margin: 0 auto;
  padding: 0 20px;
}
@media (min-width: 768px) {
  .post-page-content { padding: 0 32px; }
}

/* === MID-ARTIKEL CTA (injectas efter 2:a H2) ======================== */
.jq-mid-cta {
  border-top: 1px solid var(--jqb-line);
  border-bottom: 1px solid var(--jqb-line);
  padding: clamp(24px, 3.5vw, 36px) 0;
  margin: clamp(32px, 5vw, 52px) 0;
}
.jq-mid-cta-eyebrow {
  display: block; font-family: var(--jqb-sans); font-size: 10px;
  letter-spacing: .26em; text-transform: uppercase; color: var(--jqb-stone);
  margin-bottom: 12px;
}
.jq-mid-cta-t {
  font-family: var(--jqb-serif); font-weight: 400;
  font-size: clamp(1.2rem, 1.8vw, 1.55rem); line-height: 1.2;
  color: var(--jqb-ink); margin: 0 0 18px;
}
.jq-mid-cta-t em { font-style: italic; color: var(--jqb-stone); font-weight: 300; }
.jq-mid-cta-btns { display: flex; gap: 12px; flex-wrap: wrap; }
.jq-mid-cta-btn {
  display: inline-flex; align-items: center;
  padding: 11px 22px; border-radius: 999px;
  font-family: var(--jqb-sans); font-size: 11px; font-weight: 500;
  letter-spacing: .16em; text-transform: uppercase; text-decoration: none;
  transition: background .25s var(--jqb-ease), color .25s var(--jqb-ease), border-color .25s var(--jqb-ease);
}
.jq-mid-cta-btn--primary { background: var(--jqb-ink); color: var(--jqb-cream); }
.jq-mid-cta-btn--primary:hover { background: #000; }
.jq-mid-cta-btn--secondary { background: transparent; color: var(--jqb-ink); border: 1px solid var(--jqb-line); }
.jq-mid-cta-btn--secondary:hover { border-color: var(--jqb-ink); }

/* === INTERNA KEYWORD-LÄNKAR (auto-inject vid första förekomst) ======= */
.jq-kw-link {
  color: var(--jqb-ink) !important;
  text-decoration: none !important;
  border-bottom: 1px solid var(--jqb-line) !important;
  transition: border-color .2s;
}
.jq-kw-link:hover { border-bottom-color: var(--jqb-ink) !important; }

/* === JQ-EXTRA SEKTIONER — pixel-match Götadental (Varför / CTA / Relaterade) === */
#jq-blog-extra { display: block; font-family: var(--jqb-sans); margin-top: clamp(48px, 8vw, 96px); }
#jq-blog-extra .jq-sec { padding: clamp(56px, 9vw, 110px) 0; }
#jq-blog-extra .jq-wrap { max-width: 1100px; margin: 0 auto; padding: 0 24px; }
#jq-blog-extra .jq-eyebrow {
  display: block; font-family: var(--jqb-sans);
  font-size: 10.5px; letter-spacing: .26em; text-transform: uppercase;
  color: var(--jqb-stone); margin-bottom: 18px; font-weight: 500;
}

#jq-blog-extra .jq-blog-why { background: var(--jqb-cream); border-top: 1px solid var(--jqb-line); }
#jq-blog-extra .jq-blog-why-head { max-width: 720px; margin-bottom: clamp(40px, 5vw, 64px); }
#jq-blog-extra .jq-blog-why-h {
  font-family: var(--jqb-serif); font-weight: 400;
  font-size: clamp(2rem, 4.2vw, 3.2rem); line-height: 1.08;
  letter-spacing: -.022em; color: var(--jqb-ink); margin: 0 0 18px;
}
#jq-blog-extra .jq-blog-why-h em { font-style: italic; color: var(--jqb-stone); font-weight: 300; }
#jq-blog-extra .jq-blog-why-lede {
  font-family: var(--jqb-serif); font-size: 1.1rem; line-height: 1.6;
  color: var(--jqb-ink-2); margin: 0; max-width: 60ch;
}
#jq-blog-extra .jq-blog-why-grid {
  display: grid; grid-template-columns: repeat(3, 1fr); gap: 1px;
  background: var(--jqb-line); border: 1px solid var(--jqb-line);
  list-style: none; padding: 0; margin: 0;
}
@media (max-width: 880px) { #jq-blog-extra .jq-blog-why-grid { grid-template-columns: 1fr; } }
#jq-blog-extra .jq-blog-why-card {
  background: var(--jqb-cream); padding: clamp(28px, 3.6vw, 44px);
  display: flex; flex-direction: column; gap: 12px;
}
#jq-blog-extra .jq-blog-why-n {
  font-family: var(--jqb-sans); font-size: 11px; letter-spacing: .22em;
  color: var(--jqb-stone); font-feature-settings: "tnum" 1;
}
#jq-blog-extra .jq-blog-why-cat {
  font-family: var(--jqb-sans); font-size: 10.5px; letter-spacing: .22em;
  text-transform: uppercase; color: var(--jqb-stone);
}
#jq-blog-extra .jq-blog-why-t {
  font-family: var(--jqb-serif); font-weight: 400;
  font-size: clamp(1.25rem, 1.8vw, 1.55rem); line-height: 1.18;
  letter-spacing: -.012em; color: var(--jqb-ink); margin: 4px 0;
}
#jq-blog-extra .jq-blog-why-t em { font-style: italic; color: var(--jqb-stone); font-weight: 300; }
#jq-blog-extra .jq-blog-why-p {
  font-family: var(--jqb-serif); font-size: .98rem; line-height: 1.6;
  color: var(--jqb-ink-2); margin: 0;
}

#jq-blog-extra .jq-blog-cta-sec { background: var(--jqb-ink); color: var(--jqb-cream); }
#jq-blog-extra .jq-blog-cta { max-width: 820px; margin: 0; text-align: left; }
#jq-blog-extra .jq-blog-cta .jq-eyebrow { color: rgba(244,241,234,.55); }
#jq-blog-extra .jq-blog-cta-h {
  font-family: var(--jqb-serif); font-weight: 400;
  font-size: clamp(1.8rem, 3.6vw, 2.6rem); line-height: 1.12;
  letter-spacing: -.02em; color: var(--jqb-cream); margin: 0 0 18px;
}
#jq-blog-extra .jq-blog-cta-h em { font-style: italic; color: rgba(244,241,234,.7); font-weight: 300; }
#jq-blog-extra .jq-blog-cta-lede {
  font-family: var(--jqb-serif); font-size: 1.05rem; line-height: 1.65;
  color: rgba(244,241,234,.78); max-width: 56ch; margin: 0 0 32px;
}
#jq-blog-extra .jq-blog-cta-btns { display: flex; gap: 14px; justify-content: flex-start; flex-wrap: wrap; }
#jq-blog-extra .jq-btn {
  display: inline-flex; align-items: center; gap: 10px;
  padding: 14px 24px; border-radius: 999px;
  font-family: var(--jqb-sans); font-size: 11.5px; font-weight: 500;
  letter-spacing: .18em; text-transform: uppercase;
  text-decoration: none; border: 1px solid transparent;
  transition: background-color .25s var(--jqb-ease), color .25s var(--jqb-ease), border-color .25s var(--jqb-ease);
}
#jq-blog-extra .jq-btn--solid { background: var(--jqb-cream); color: var(--jqb-ink); }
#jq-blog-extra .jq-btn--solid:hover { background: #fff; }
#jq-blog-extra .jq-btn--ghost {
  background: transparent; color: var(--jqb-cream); border-color: rgba(244,241,234,.3);
}
#jq-blog-extra .jq-btn--ghost:hover { border-color: var(--jqb-cream); }
#jq-blog-extra .jq-btn span { font-size: 14px; letter-spacing: 0; }

#jq-blog-extra .jq-blog-related-sec { background: var(--jqb-cream); }
#jq-blog-extra .jq-blog-related-head { margin-bottom: clamp(32px, 4vw, 56px); }
#jq-blog-extra .jq-blog-related-h {
  font-family: var(--jqb-serif); font-weight: 400;
  font-size: clamp(1.6rem, 3vw, 2.2rem); line-height: 1.12;
  letter-spacing: -.018em; color: var(--jqb-ink); margin: 0;
}
#jq-blog-extra .jq-blog-related-h em { font-style: italic; color: var(--jqb-stone); font-weight: 300; }
#jq-blog-extra .jq-blog-related-grid {
  display: grid; grid-template-columns: repeat(3, 1fr); gap: 28px;
}
@media (max-width: 880px) { #jq-blog-extra .jq-blog-related-grid { grid-template-columns: 1fr; } }
#jq-blog-extra .jq-blog-related-link {
  display: flex; flex-direction: column; gap: 14px;
  text-decoration: none; color: var(--jqb-ink);
}
#jq-blog-extra .jq-blog-related-img {
  aspect-ratio: 4/3; overflow: hidden; border-radius: 4px; background: var(--jqb-sand);
}
#jq-blog-extra .jq-blog-related-img img {
  width: 100%; height: 100%; object-fit: cover;
  transition: transform .6s var(--jqb-ease);
}
#jq-blog-extra .jq-blog-related-link:hover .jq-blog-related-img img { transform: scale(1.04); }
#jq-blog-extra .jq-blog-related-cat {
  font-family: var(--jqb-sans); font-size: 10.5px; letter-spacing: .22em;
  text-transform: uppercase; color: var(--jqb-stone);
}
#jq-blog-extra .jq-blog-related-t {
  font-family: var(--jqb-serif); font-weight: 400;
  font-size: 1.18rem; line-height: 1.2;
  letter-spacing: -.012em; color: var(--jqb-ink); margin: 0;
}

/* === FORCE FULL-WIDTH LEFT-ALIGNED POST CONTENT ===================== */
/* Övertrumfar Wix defaults + tidigare max-width:65ch/22ch som gjorde
   texten smal+centrerad. Container = 720px (läsbar long-form), allt
   inom är vänsterställt och tar full bredd. */
${isPost ? `
html body [data-hook="post-page-root"] {
  max-width: 1200px !important;
  margin: 0 auto !important;
  padding: 0 !important;
}
/* PAGE BG — Götadental cream-beige (#F0ECE2). Förrut vit Wix-default. */
html body,
html body [data-hook="post-page-root"] {
  background-color: var(--jqb-bg) !important;
}

html body [data-hook="post-content"],
html body .post-page-content,
html body article[class*="post-content"] {
  max-width: 920px !important;
  width: 100% !important;
  margin: 0 auto !important;
  padding: clamp(48px, 7vw, 96px) 5vw !important;
  text-align: left !important;
  box-sizing: border-box !important;
  background-color: transparent !important;
}
html body [data-hook="post-content"] > *,
html body .post-page-content > *,
html body [data-hook="post-content"] p,
html body [data-hook="post-content"] h1,
html body [data-hook="post-content"] h2,
html body [data-hook="post-content"] h3,
html body [data-hook="post-content"] h4,
html body [data-hook="post-content"] ul,
html body [data-hook="post-content"] ol,
html body [data-hook="post-content"] li,
html body [data-hook="post-content"] blockquote,
html body [data-hook="post-content"] figure,
html body .post-page-content p,
html body .post-page-content h2,
html body .post-page-content h3 {
  max-width: 100% !important;
  width: 100% !important;
  text-align: left !important;
  margin-left: 0 !important;
  margin-right: 0 !important;
  box-sizing: border-box !important;
}
/* Götadental-stil eyebrow ovanför varje H2 i content
   (injected via JS — injectEyebrows()) */
html body [data-hook="post-content"] .jq-eyebrow,
html body .post-page-content .jq-eyebrow {
  display: block !important;
  font-family: var(--jqb-sans) !important;
  font-size: 11px !important;
  font-weight: 500 !important;
  letter-spacing: 0.18em !important;
  text-transform: uppercase !important;
  color: var(--jqb-stone, #7c6f5a) !important;
  margin: clamp(40px, 5vw, 64px) 0 6px 0 !important;
  padding: 0 !important;
  line-height: 1 !important;
}
/* H2 efter eyebrow: ta bort top-margin så de blir visuellt grupperade */
html body [data-hook="post-content"] .jq-eyebrow + h2,
html body .post-page-content .jq-eyebrow + h2 {
  margin-top: 8px !important;
}
/* Post title + meta också vänsterställt + 720px */
html body [data-hook="post-title"],
html body [data-hook="post-description"],
html body [data-hook="post-page-root"] ul:has([data-hook="time-ago"]) {
  max-width: 920px !important;
  margin-left: auto !important;
  margin-right: auto !important;
  padding-left: 24px !important;
  padding-right: 24px !important;
  text-align: left !important;
}
/* Hero image — 16/9 aspect inom content-bredd (920px) */
html body [data-hook="post-hero-image"] {
  max-width: 920px !important;
  margin: clamp(20px, 3vw, 36px) auto clamp(32px, 5vw, 56px) !important;
  padding: 0 5vw !important;
}
html body [data-hook="post-hero-image"] img {
  width: 100% !important;
  aspect-ratio: 16 / 9 !important;
  object-fit: cover !important;
  height: auto !important;
  border-radius: 0 !important;
}
/* Inline IMAGE-nodes i body (mid-article) — center + full text-width */
html body [data-hook="post-content"] figure,
html body [data-hook="post-content"] [data-hook="imageViewer"],
html body [data-hook="post-content"] [data-hook="image-data-wrapper"],
html body [data-hook="post-content"] .image-viewer-image-component,
html body [data-hook="post-content"] img {
  max-width: 100% !important;
  width: 100% !important;
  height: auto !important;
  margin: clamp(24px, 3vw, 40px) 0 !important;
  border-radius: 0 !important;
  display: block !important;
}

/* === Pill-button — Götadental-exakt för /boka-länkar === */
html body [data-hook="post-content"] p a[href="/boka"] {
  display: inline-block !important;
  background: var(--jqb-accent) !important;
  color: #fff !important;
  border-radius: 100px !important;
  padding: 16px 32px !important;
  font-family: var(--jqb-sans) !important;
  font-size: 11px !important;
  font-weight: 500 !important;
  letter-spacing: .2em !important;
  text-transform: uppercase !important;
  text-decoration: none !important;
  background-image: none !important;
  margin: 4px 0 !important;
  transition: background .25s var(--jqb-ease) !important;
}
html body [data-hook="post-content"] p a[href="/boka"]:hover {
  background: #185c97 !important;
  color: #fff !important;
}
/* Container-paragrafen för /boka-CTA: bättre breathing */
html body [data-hook="post-content"] p:has(> a[href="/boka"]) {
  margin: clamp(28px, 3.4vw, 40px) 0 !important;
}
/* Blockquote — Götadental-stil: subtilt, lugnt, ingen tung accent-kant */
html body [data-hook="post-content"] blockquote {
  border: 0 !important;
  border-left: 2px solid var(--jqb-line) !important;
  background: transparent !important;
  padding: 4px 0 4px 28px !important;
  margin: clamp(28px, 3.4vw, 40px) 0 !important;
  font-style: italic !important;
  font-size: 19px !important;
  line-height: 1.6 !important;
  color: var(--jqb-stone) !important;
}
html body [data-hook="post-content"] blockquote p {
  font-style: italic !important;
  color: var(--jqb-stone) !important;
  font-size: 19px !important;
  line-height: 1.6 !important;
  margin: 0 !important;
}
/* Bulleted/Ordered lists — synliga prickar/siffror */
html body [data-hook="post-content"] ul {
  list-style: disc outside !important;
  padding-left: clamp(20px, 2vw, 28px) !important;
  margin: clamp(16px, 2vw, 24px) 0 !important;
}
html body [data-hook="post-content"] ol {
  list-style: decimal outside !important;
  padding-left: clamp(20px, 2vw, 28px) !important;
  margin: clamp(16px, 2vw, 24px) 0 !important;
}
html body [data-hook="post-content"] li {
  margin: clamp(4px, .6vw, 8px) 0 !important;
}
/* In-content CTA-block (PARAGRAPH med [data-jq-cta] attribut eller
   klassnamn jq-inline-cta) — full-width mörk box med knapp */
html body [data-hook="post-content"] [data-jq-cta],
html body [data-hook="post-content"] .jq-inline-cta {
  background: var(--jqb-ink) !important;
  color: var(--jqb-cream) !important;
  padding: clamp(24px, 3vw, 36px) clamp(24px, 3vw, 36px) !important;
  margin: clamp(32px, 4vw, 48px) 0 !important;
  border-radius: 4px !important;
  text-align: left !important;
}
html body [data-hook="post-content"] [data-jq-cta] a,
html body [data-hook="post-content"] .jq-inline-cta a {
  color: var(--jqb-cream) !important;
  text-decoration: underline !important;
  text-underline-offset: 4px !important;
  border-bottom: none !important;
  font-weight: 500 !important;
}

/* === Götadental-exakt: hr-divider === */
html body [data-hook="post-content"] hr,
html body .post-page-content hr {
  border: 0 !important;
  border-top: 1px solid var(--jqb-line) !important;
  margin: 36px 0 !important;
  background: none !important;
}

/* === Götadental-exakt: link underline diagonal wipe (premium) === */
html body [data-hook="post-content"] a:not([data-jq-cta] a):not(.jq-inline-cta a),
html body .post-page-content a {
  position: relative !important;
  color: var(--jqb-ink) !important;
  text-decoration: none !important;
  background-image: linear-gradient(currentColor, currentColor) !important;
  background-size: 100% 1px !important;
  background-repeat: no-repeat !important;
  background-position: 0 100% !important;
  border-bottom: none !important;
  transition: background-size .4s var(--jqb-ease), color .2s ease !important;
}
html body [data-hook="post-content"] a:hover {
  color: var(--jqb-accent) !important;
}

/* === Götadental-exakt: post-title större + tight tracking === */
html body [data-hook="post-title"] {
  font-family: var(--jqb-serif) !important;
  font-weight: 400 !important;
  font-size: clamp(2.2rem, 5.4vw, 3.8rem) !important;
  line-height: 1.05 !important;
  letter-spacing: -.028em !important;
  color: var(--jqb-ink) !important;
  margin-top: clamp(40px, 5vw, 64px) !important;
  margin-bottom: 24px !important;
  word-break: normal !important;
  overflow-wrap: break-word !important;
  hyphens: none !important;
}

/* === Hero CTAs — injected via injectHeroCTAs() === */
.jq-post-hero-ctas {
  display: flex !important;
  flex-wrap: wrap !important;
  gap: 12px !important;
  margin: clamp(28px, 3.5vw, 44px) 0 clamp(40px, 5vw, 60px) 0 !important;
  max-width: 720px !important;
  position: relative !important;
  z-index: 50 !important;
  visibility: visible !important;
  opacity: 1 !important;
}
/* Floating fallback — om DOM-injection misslyckats, visa fixerat */
.jq-post-hero-ctas--floating {
  position: fixed !important;
  bottom: 24px !important;
  left: 50% !important;
  transform: translateX(-50%) !important;
  z-index: 9999 !important;
  background: rgba(244,241,234,0.95) !important;
  padding: 12px 16px !important;
  border-radius: 999px !important;
  box-shadow: 0 12px 32px -8px rgba(0,0,0,0.25) !important;
  backdrop-filter: blur(8px) !important;
  margin: 0 !important;
}
.jq-post-hero-ctas .jq-btn {
  display: inline-flex !important;
  align-items: center !important;
  gap: 10px !important;
  padding: 16px 28px !important;
  border-radius: 999px !important;
  font-family: var(--jqb-sans) !important;
  font-size: 13px !important;
  font-weight: 600 !important;
  letter-spacing: 0.04em !important;
  text-transform: uppercase !important;
  text-decoration: none !important;
  border: 1px solid transparent !important;
  transition: transform .3s var(--jqb-ease, cubic-bezier(.2,.9,.2,1)), background .3s ease, color .3s ease, border-color .3s ease !important;
  cursor: pointer !important;
}
.jq-post-hero-ctas .jq-btn--solid {
  background: var(--jqb-ink, #1a1815) !important;
  color: var(--jqb-cream, #f4f1ea) !important;
}
.jq-post-hero-ctas .jq-btn--solid:hover {
  background: #000 !important;
  transform: translateY(-2px) !important;
}
.jq-post-hero-ctas .jq-btn--solid span {
  transition: transform .3s var(--jqb-ease, cubic-bezier(.2,.9,.2,1)) !important;
}
.jq-post-hero-ctas .jq-btn--solid:hover span { transform: translateX(4px) !important; }
.jq-post-hero-ctas .jq-btn--ghost-dark {
  background: transparent !important;
  color: var(--jqb-ink, #1a1815) !important;
  border: 1px solid rgba(26,24,21,0.3) !important;
}
.jq-post-hero-ctas .jq-btn--ghost-dark:hover {
  border-color: var(--jqb-ink, #1a1815) !important;
  background: rgba(26,24,21,0.04) !important;
}
@media (max-width: 720px) {
  .jq-post-hero-ctas { flex-direction: column !important; align-items: stretch !important; }
  .jq-post-hero-ctas .jq-btn { justify-content: center !important; padding: 14px 20px !important; }
}

/* === Text-brytning + overflow-säkerhet på allt body-content === */
html body [data-hook="post-content"] p,
html body [data-hook="post-content"] h2,
html body [data-hook="post-content"] h3,
html body [data-hook="post-content"] li,
html body [data-hook="post-content"] blockquote {
  word-break: normal !important;
  overflow-wrap: break-word !important;
  hyphens: none !important;
}
html body [data-hook="post-content"] a {
  word-break: normal !important;
  overflow-wrap: anywhere !important;
}

/* === Eyebrow meta — exakt Götadental (10px tracking 0.22em) === */
html body [data-hook="post-page-root"] [data-hook="time-ago"],
html body [data-hook="post-page-root"] [data-hook="time-to-read"] {
  font-family: var(--jqb-sans) !important;
  font-size: 10px !important;
  letter-spacing: .22em !important;
  text-transform: uppercase !important;
  color: var(--jqb-stone) !important;
  font-weight: 500 !important;
}

/* === MOBILE — Wix tvingar 320px viewport på blog. Force full-width === */
@media (max-width: 720px) {
  /* HTML/body till hela viewport */
  html, body, html body {
    width: 100vw !important;
    max-width: 100vw !important;
    min-width: 0 !important;
    overflow-x: hidden !important;
    margin-left: 0 !important;
    margin-right: 0 !important;
  }
  /* Wix top-level containers (SITE_ROOT, SITE_CONTAINER, masterPage, ...)
     — alla har hardkodad 320px på mobile. Force till 100vw. */
  html body #SITE_ROOT,
  html body #SITE_CONTAINER,
  html body #site-root,
  html body #masterPage,
  html body #PAGES_CONTAINER,
  html body #SITE_PAGES,
  html body #SITE_HEADER,
  html body #SITE_FOOTER,
  html body #BACKGROUND_GROUP,
  html body [id^="SITE_PAGES"],
  html body [id^="PAGES_CONTAINER"],
  html body [data-mesh-id*="centeredContent"],
  html body [data-mesh-id*="PAGES_CONTAINER"],
  html body [data-mesh-id*="SITE_PAGES"] {
    width: 100vw !important;
    max-width: 100vw !important;
    min-width: 0 !important;
    margin-left: 0 !important;
    margin-right: 0 !important;
    left: 0 !important;
    right: 0 !important;
    box-sizing: border-box !important;
  }
  html body [data-hook="post-page-root"],
  html body [data-hook="post-page"],
  html body [data-hook="post-page-root"] [data-hook="bgLayers"] {
    width: 100% !important;
    max-width: 100vw !important;
    margin-left: 0 !important;
    margin-right: 0 !important;
    left: 0 !important;
    right: 0 !important;
    box-sizing: border-box !important;
  }
  /* Wix injicerar en category-dropdown ovanför post på mobile — dölj */
  html body [data-hook="category-dropdown"],
  html body [data-hook="header-categories-mobile-button"],
  html body [data-hook="categories-list"] {
    display: none !important;
  }
  html body [data-hook="post-content"],
  html body .post-page-content,
  html body article[class*="post-content"],
  html body [data-hook="post-title"],
  html body [data-hook="post-description"],
  html body [data-hook="post-page-root"] ul:has([data-hook="time-ago"]) {
    padding-left: 5vw !important;
    padding-right: 5vw !important;
  }
  /* Mobile title — komprimerad (var 5-6 rader, nu 3-4) */
  html body [data-hook="post-title"] {
    font-size: clamp(1.45rem, 5.6vw, 1.85rem) !important;
    line-height: 1.14 !important;
    letter-spacing: -.022em !important;
    margin-top: 0 !important;
    margin-bottom: 12px !important;
  }
  /* Mobile: komprimera top-whitespace dramatiskt */
  html body [data-hook="post-page-root"] header {
    padding-top: 16px !important;
    padding-bottom: 8px !important;
    margin-top: 0 !important;
    margin-bottom: 0 !important;
  }
  html body [data-hook="post-page-root"] ul:has([data-hook="time-ago"]) {
    margin-top: 8px !important;
    margin-bottom: 12px !important;
    padding-top: 0 !important;
    padding-bottom: 0 !important;
  }
  html body [data-hook="post-hero-image"] {
    margin-top: 8px !important;
    margin-bottom: 16px !important;
    padding: 0 !important;
  }
  /* Mobile content padding ner */
  html body [data-hook="post-content"] {
    padding-top: 16px !important;
    padding-bottom: 32px !important;
  }
  /* Mobile meta — säkerställ läsbarhet, ingen avklippning */
  html body [data-hook="post-page-root"] ul,
  html body [data-hook="post-page-root"] ul:has([data-hook="time-ago"]) {
    flex-wrap: wrap !important;
    overflow: visible !important;
  }
  html body [data-hook="time-ago"],
  html body [data-hook="time-to-read"],
  html body [data-hook="post-page-root"] ul:has([data-hook="time-ago"]) li,
  html body [data-hook="post-page-root"] ul:has([data-hook="time-ago"]) li > * {
    white-space: nowrap !important;
    text-overflow: clip !important;
    overflow: visible !important;
    width: auto !important;
    max-width: none !important;
    min-width: 0 !important;
  }
  /* Content bullets MÅSTE wrappa, INTE nowrap. Plus mindre padding-left. */
  html body [data-hook="post-content"] ul,
  html body [data-hook="post-content"] ol {
    padding-left: 22px !important;
  }
  html body [data-hook="post-content"] ul li,
  html body [data-hook="post-content"] ol li,
  html body [data-hook="post-content"] li p {
    white-space: normal !important;
    overflow: visible !important;
    width: auto !important;
    max-width: 100% !important;
    word-wrap: break-word !important;
    overflow-wrap: break-word !important;
  }
  /* Komprimera vertikal-spacing mellan header → title */
  html body [data-hook="post-page-root"] header {
    padding-top: 24px !important;
    padding-bottom: 12px !important;
  }
  html body [data-hook="post-title"] {
    margin-top: 12px !important;
    margin-bottom: 16px !important;
  }
  html body [data-hook="post-content"] p,
  html body .post-page-content p {
    font-size: 1.05rem !important;
    line-height: 1.65 !important;
  }
  html body [data-hook="post-content"] h2 {
    font-size: 1.5rem !important;
    margin-top: 36px !important;
  }
  html body [data-hook="post-content"] h3 {
    font-size: 1.2rem !important;
    margin-top: 28px !important;
  }
  html body [data-hook="post-hero-image"] {
    padding: 0 !important;
    margin: 16px 0 28px !important;
    border-radius: 0 !important;
  }
  html body [data-hook="post-hero-image"] img {
    border-radius: 0 !important;
  }
  html body [data-hook="post-content"] blockquote {
    padding: 18px 16px !important;
    margin: 24px -2px !important;
    font-size: 1rem !important;
  }
  html body [data-hook="post-content"] ul,
  html body [data-hook="post-content"] ol {
    padding-left: 22px !important;
  }
  html body [data-hook="post-content"] [data-jq-cta],
  html body [data-hook="post-content"] .jq-inline-cta {
    margin: 28px -4px !important;
    padding: 22px 18px !important;
  }
}
` : ""}

    `;
    document.head.appendChild(css);

    // === Scroll progress + chapter rail JS ========================== //
    // === ROBUST CONTENT ROOT FINDER ============================== //
    // Wix Blog renderar inte alltid [data-hook="post-content"]. Nyare posts
    // har rcv-block1..N data-hooks inom en wrapping <article>. Detta söker
    // genom flera fallbacks tills content-root hittas.
    function findContentRoot() {
      return (
        document.querySelector("[data-hook='post-content']") ||
        document.querySelector(".post-page-content") ||
        // Hitta parent av rcv-block1 (första content-block)
        (function () {
          var rcv = document.querySelector("[data-hook^='rcv-block']");
          return rcv ? rcv.parentElement : null;
        })() ||
        // Inre article inom post-page-root (Wix new template)
        document.querySelector("[data-hook='post-page-root'] article article") ||
        document.querySelector("article article") ||
        document.querySelector("[data-hook='post-page']") ||
        document.querySelector("[data-hook='post']") ||
        document.querySelector("[data-hook='post-page-root']")
      );
    }

    function init() {
      // Mobile: Wix sätter `width: 320px` inline på sina container-divs
      // som CSS !important INTE alltid kan övertrumfra. Force-width allt
      // under [data-hook="post-page-root"] till 100% via JS-inline styles
      // (highest specificity). Re-kör periodiskt om Wix re-renderar.
      function forceFullWidth() {
        if (window.innerWidth >= 720) return;
        var INLINE_TAGS = { LI: 1, SPAN: 1, A: 1, I: 1, B: 1, EM: 1, STRONG: 1, BUTTON: 1, SVG: 1, PATH: 1, IMG: 1, BR: 1 };
        // 1. Force html/body till viewport-width
        [document.documentElement, document.body].forEach(function (el) {
          if (!el) return;
          el.style.setProperty('width', '100vw', 'important');
          el.style.setProperty('max-width', '100vw', 'important');
          el.style.setProperty('overflow-x', 'hidden', 'important');
          el.style.setProperty('margin-left', '0', 'important');
          el.style.setProperty('margin-right', '0', 'important');
        });
        // 2. Wix top-level kontainrar — hardkodade 320px width-killers
        var topLevel = document.querySelectorAll(
          '#SITE_ROOT, #SITE_CONTAINER, #site-root, #masterPage, #PAGES_CONTAINER, #SITE_PAGES, #BACKGROUND_GROUP, #SITE_FOOTER, [id^="PAGES_CONTAINER"], [data-mesh-id*="centeredContent"], [data-mesh-id*="PAGES_CONTAINER"]'
        );
        topLevel.forEach(function (el) {
          el.style.setProperty('width', '100vw', 'important');
          el.style.setProperty('max-width', '100vw', 'important');
          el.style.setProperty('min-width', '0', 'important');
          el.style.setProperty('margin-left', '0', 'important');
          el.style.setProperty('margin-right', '0', 'important');
          el.style.setProperty('left', '0', 'important');
          el.style.setProperty('right', '0', 'important');
        });
        function walk(el) {
          if (!el || el.nodeType !== 1) return;
          if (el.tagName === 'IFRAME' || INLINE_TAGS[el.tagName]) return;
          if (el.className && typeof el.className === 'string') {
            if (el.className.indexOf('jq-blog-') === 0 || el.className.indexOf(' jq-blog-') !== -1) return;
            if (el.classList.contains('jq-startsida-popup')) return;
          }
          var disp = el.style.display || '';
          if (disp.indexOf('inline-flex') !== -1 || disp.indexOf('inline-block') !== -1) return;
          el.style.setProperty('width', '100%', 'important');
          el.style.setProperty('max-width', '100%', 'important');
          el.style.setProperty('min-width', '0', 'important');
          el.style.setProperty('margin-left', '0', 'important');
          el.style.setProperty('margin-right', '0', 'important');
          el.style.setProperty('left', '0', 'important');
          if (el.tagName === 'HEADER') {
            el.style.setProperty('padding-left', '5vw', 'important');
            el.style.setProperty('padding-right', '5vw', 'important');
          }
          for (var i = 0; i < el.children.length; i++) walk(el.children[i]);
        }
        // 3. Walk from body recursively (broadest coverage)
        if (document.body) {
          for (var j = 0; j < document.body.children.length; j++) walk(document.body.children[j]);
        }
      }

      // Tour-widget (#jq-tb "Hemsidan är nyrenoverad → VISA RUNDTUR") visas
      // på alla sidor via Custom Embed. Stäng av på blog/post permanent via
      // localStorage flag + DOM remove.
      if (isPost || isBlog) {
        try {
          localStorage.setItem('jq-tour-v4-2026', 'dismissed');
          sessionStorage.setItem('jq-tour-v4-2026', 'dismissed');
        } catch (e) {}
        function removeTour() {
          ['jq-tb', 'jq-tg', 'jq-tt'].forEach(function (id) {
            var el = document.getElementById(id);
            if (el) { try { el.remove(); } catch (_) { el.style.display = 'none'; } }
          });
        }
        removeTour();
        setTimeout(removeTour, 500);
        setTimeout(removeTour, 1500);
        setTimeout(removeTour, 4000);
        setTimeout(removeTour, 6000);
      }

      // Stäng av jq-header welcome-popup ("VISA RUNDTUR") på blog/post-sidor.
      // Popup ligger i <jq-header>'s shadow DOM, så extern CSS når inte den.
      function hideWelcomePopup() {
        // 1) Light DOM — om popup råkar vara på top-level
        document.querySelectorAll('[class*="welcome"], [class*="rundtur"], [class*="banner-popup"], [data-jq-welcome]').forEach(function(p){
          p.style.setProperty('display', 'none', 'important');
        });
        // 2) Shadow DOM inom jq-header
        var hosts = document.querySelectorAll('jq-header, jq-footer, jq-startsida');
        hosts.forEach(function(host){
          if (!host.shadowRoot) return;
          // Direct selectors
          host.shadowRoot.querySelectorAll('[class*="welcome"], [class*="rundtur"], [class*="banner-popup"], [data-jq-welcome]').forEach(function(p){
            p.style.setProperty('display', 'none', 'important');
          });
          // By text — hitta nearest positioned ancestor och dölj
          var all = host.shadowRoot.querySelectorAll('div, section, aside, span');
          for (var i = 0; i < all.length; i++) {
            var el = all[i];
            var txt = (el.textContent || '').trim();
            if (txt && txt.length < 80 && (txt.indexOf('VISA RUNDTUR') !== -1 || txt.indexOf('nyrenoverad') !== -1)) {
              var w = el;
              for (var k = 0; k < 8 && w; k++) {
                try {
                  var cs = host.shadowRoot.ownerDocument.defaultView.getComputedStyle(w);
                  if (cs && (cs.position === 'fixed' || cs.position === 'absolute')) {
                    w.style.setProperty('display', 'none', 'important');
                    break;
                  }
                } catch (e) {}
                w = w.parentElement || w.parentNode;
                if (!w || w.nodeType !== 1) break;
              }
              // Fallback: ta bort element direkt
              try { el.style.setProperty('display', 'none', 'important'); } catch (e) {}
              try {
                var p = el.parentElement;
                if (p && p.tagName !== 'BODY') p.style.setProperty('display', 'none', 'important');
              } catch (e) {}
              break;
            }
          }
        });
      }
      if (isPost || isBlog) {
        hideWelcomePopup();
        setTimeout(hideWelcomePopup, 800);
        setTimeout(hideWelcomePopup, 2000);
        setTimeout(hideWelcomePopup, 4000);
      }
      if (isPost || isBlog) {
        forceFullWidth();
        setTimeout(forceFullWidth, 1000);
        setTimeout(forceFullWidth, 2500);
        setTimeout(forceFullWidth, 5000);
        // Observer för dynamiskt tillagt content
        try {
          var mo = new MutationObserver(function () {
            if (window.innerWidth < 720) forceFullWidth();
          });
          mo.observe(document.body, { childList: true, subtree: true });
          setTimeout(function () { mo.disconnect(); }, 12000);
        } catch (e) {}
      }

      // Progress bar
      let bar = document.getElementById("jq-blog-progress");
      if (!bar) {
        bar = document.createElement("div");
        bar.id = "jq-blog-progress";
        bar.innerHTML = "<i></i>";
        document.body.appendChild(bar);
      }
      const fill = bar.querySelector("i");

      function tick() {
        const doc = document.documentElement;
        const total = doc.scrollHeight - doc.clientHeight;
        const pct = total > 0 ? Math.min(1, Math.max(0, window.scrollY / total)) : 0;
        if (fill) fill.style.transform = "scaleX(" + pct + ")";
      }
      window.addEventListener("scroll", tick, { passive: true });
      tick();

      // Injicera Götadental-sektioner (Varför + CTA + Relaterade) — både /post och /blog
      injectExtras();

      // ── /blog-archive injects (hero + filter + featured + lista) ──
      if (isBlog) {
        injectArchive();
      }

      // ── /post-specifika injects (back-link, faktagranskad, mid-CTA, keyword-links) ──
      if (isPost) {
        injectBackLink();
        injectFaktagranskad();
        // Mid-artikel CTA + keyword-links kräver att Wix Blog har renderat content.
        // Kör med fördröjning + retry tills content finns.
        var postRetry = 0;
        var postRetryTimer = setInterval(function () {
          postRetry++;
          var contentEl = findContentRoot();
          if (contentEl && contentEl.querySelectorAll("h2").length > 0) {
            clearInterval(postRetryTimer);
            try { watchAndInjectHeroCTAs(); } catch(e) {}
            try { injectEyebrows(); } catch(e) {}
            try { injectMidArticleCta(); } catch(e) {}
            try { injectKeywordLinks(); } catch(e) {}
          }
          if (postRetry >= 15) clearInterval(postRetryTimer);
        }, 600);
      }

      // Chapter rail — bara på post-page
      if (!isPost) return;

      // Hitta H2:s i post-content. Wix använder olika wrappers — vi söker brett.
      const contentRoot =
        findContentRoot();
      const h2s = Array.from(contentRoot.querySelectorAll("h2"));
      if (h2s.length < 3) return; // för få — skippa rail

      // Bygg rail
      let rail = document.getElementById("jq-blog-rail");
      if (rail) rail.remove();
      rail = document.createElement("aside");
      rail.id = "jq-blog-rail";
      rail.setAttribute("aria-label", "I den här artikeln");
      let inner = '<div class="eb">I artikeln</div><ol>';
      const items = [];
      h2s.forEach((h, i) => {
        if (!h.id) {
          const slug = (h.textContent || "").toLowerCase()
            .replace(/[åä]/g, "a").replace(/ö/g, "o")
            .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40);
          h.id = "sec-" + i + "-" + slug;
        }
        inner += '<li><a href="#' + h.id + '"><span class="n">'
          + String(i + 1).padStart(2, "0")
          + '</span><span class="t">' + (h.textContent || "") + '</span></a></li>';
      });
      inner += "</ol>";
      rail.innerHTML = inner;
      document.body.appendChild(rail);

      // Cache liElements + offsets
      const liNodes = rail.querySelectorAll("li");
      h2s.forEach((h, i) => items.push({ h, li: liNodes[i] }));

      // getBoundingClientRect ger document-relativ position oavsett positioned
      // ancestors (offsetTop fastnade på sista item när Wix wraps content i
      // position:relative-containers).
      function highlight() {
        let active = null;
        items.forEach((it) => {
          const top = it.h.getBoundingClientRect().top;
          if (top <= 140) active = it;
        });
        items.forEach((it) => it.li.classList.toggle("is-active", it === active));
      }
      window.addEventListener("scroll", highlight, { passive: true });
      highlight();
    }

    // === Götadental-matching extra-sektioner ========================== //
    function injectExtras() {
      if (document.getElementById("jq-blog-extra")) return;
      const whyHtml = '<section class="jq-sec jq-blog-why"><div class="jq-wrap">'
        + '<div class="jq-blog-why-head">'
        + '<span class="jq-eyebrow">Varför specialist</span>'
        + '<h2 class="jq-blog-why-h">En annan <em>standard</em> av estetisk medicin.</h2>'
        + '<p class="jq-blog-why-lede">Det är skillnad på en injektion och en specialistbedömning. Här är varför patienter väljer JQ.Klinik.</p>'
        + '</div>'
        + '<ol class="jq-blog-why-grid">'
        + '<li class="jq-blog-why-card"><span class="jq-blog-why-n">01</span><span class="jq-blog-why-cat">Specialist · alltid</span><h3 class="jq-blog-why-t">Aldrig <em>generisk injektör.</em></h3><p class="jq-blog-why-p">All behandling utförs av leg. specialisttandläkare med expertis i ansiktets anatomi — inte en allmän injektör.</p></li>'
        + '<li class="jq-blog-why-card"><span class="jq-blog-why-n">02</span><span class="jq-blog-why-cat">Fast pris</span><h3 class="jq-blog-why-t">Inga dolda <em>avgifter.</em></h3><p class="jq-blog-why-p">Behandlingsplan och slutpris vid konsultationen. Räntefri delbetalning från 300&nbsp;kr/mån via Resursbanken.</p></li>'
        + '<li class="jq-blog-why-card"><span class="jq-blog-why-n">03</span><span class="jq-blog-why-cat">Erfarenhet</span><h3 class="jq-blog-why-t">2&nbsp;000+ <em>behandlingar.</em></h3><p class="jq-blog-why-p">Specialistklinik mitt i Göteborg. Anatomi-driven approach, naturliga resultat och patientsäkerhet i första rummet.</p></li>'
        + '</ol></div></section>';
      const ctaHtml = '<section class="jq-sec jq-blog-cta-sec"><div class="jq-wrap"><div class="jq-blog-cta">'
        + '<span class="jq-eyebrow">Nästa steg</span>'
        + '<h3 class="jq-blog-cta-h">Frågor om <em>din situation?</em></h3>'
        + '<p class="jq-blog-cta-lede">Boka en konsultation hos leg. specialisttandläkare med estetik-inriktning. Ingen förskottsbetalning.</p>'
        + '<div class="jq-blog-cta-btns">'
        + '<a class="jq-btn jq-btn--solid" href="/boka">Boka konsultation</a>'
        + '<a class="jq-btn jq-btn--ghost" href="tel:+46317135784">031-713 57 84</a>'
        + '</div></div></div></section>';
      const relatedShell = isPost ? '<section class="jq-sec jq-blog-related-sec" id="jq-blog-related-shell"></section>' : '';

      const extra = document.createElement("aside");
      extra.id = "jq-blog-extra";
      extra.setAttribute("aria-label", "JQ.Klinik värdeproposition och vidare läsning");
      extra.innerHTML = whyHtml + ctaHtml + relatedShell;
      document.body.appendChild(extra);
      if (isPost) fetchRelatedPosts();
    }

    function fetchRelatedPosts() {
      try {
        fetch("/blog-feed.xml", { credentials: "same-origin" })
        .then(function (r) { return r.ok ? r.text() : null; })
        .then(function (xml) {
          const shell = document.getElementById("jq-blog-related-shell");
          if (!shell || !xml) return;
          var doc = new DOMParser().parseFromString(xml, "text/xml");
          var items = Array.from(doc.querySelectorAll("item"));
          var seen = new Set();
          var posts = [];
          items.forEach(function (item) {
            var title = (item.querySelector("title") || {}).textContent || "";
            var key = title.trim().toLowerCase();
            if (seen.has(key)) return;
            seen.add(key);
            var link = (item.querySelector("link") || {}).textContent || "";
            var slug = link.replace(/^.*\/post\//, "").replace(/\?.*$/, "");
            var enc = item.querySelector("enclosure");
            var img = enc ? (enc.getAttribute("url") || "") : "";
            posts.push({ title: title, slug: slug, media: img ? { embedMedia: { thumbnail: { url: img } } } : null });
          });
          const currentSlug = (window.location.pathname.split("/").pop() || "").toLowerCase();
          const filtered = posts.filter(function (p) {
            return (p.slug || "").toLowerCase() !== currentSlug;
          }).slice(0, 3);
          if (filtered.length === 0) { shell.remove(); return; }
          const cards = filtered.map(function (p) {
            const url = p.url ? p.url.path : "/post/" + (p.slug || "");
            const cat = "Artikel";
            const img = getCoverUrl(p);
            const title = (p.title || "").replace(/"/g, "&quot;");
            const imgHtml = img ? '<div class="jq-blog-related-img"><img src="' + img + '" alt="' + title + '" loading="lazy"></div>' : "";
            return '<article class="jq-blog-related-card"><a class="jq-blog-related-link" href="' + url + '">'
              + imgHtml
              + '<span class="jq-blog-related-cat">' + cat + '</span>'
              + '<h4 class="jq-blog-related-t">' + (p.title || "") + '</h4>'
              + '</a></article>';
          }).join("");
          shell.innerHTML = '<div class="jq-wrap">'
            + '<div class="jq-blog-related-head"><span class="jq-eyebrow">Fortsätt läsa</span><h3 class="jq-blog-related-h">Relaterade <em>artiklar</em></h3></div>'
            + '<div class="jq-blog-related-grid">' + cards + '</div>'
            + '</div>';
        }).catch(function () {
          const shell = document.getElementById("jq-blog-related-shell");
          if (shell) shell.remove();
        });
      } catch (e) { console.error("[JQ.blog] fetchRelatedPosts:", e); }
    }

    // === MID-ARTIKEL CTA (injectas efter 2:a H2) ======================== //
    function injectMidArticleCta() {
      if (document.querySelector(".jq-mid-cta")) return;
      var contentRoot = findContentRoot();
      var h2s = Array.from(contentRoot.querySelectorAll("h2"));
      if (h2s.length < 2) return;
      // Sätt CTA efter 2:a H2 (index 1), eller sista om färre
      var anchor = h2s[Math.min(1, h2s.length - 1)];
      var insertAfter = anchor;
      var sib = anchor.nextElementSibling;
      if (sib && !["H1","H2","H3"].includes(sib.tagName)) insertAfter = sib;
      var cta = document.createElement("div");
      cta.className = "jq-mid-cta";
      cta.innerHTML =
        '<span class="jq-mid-cta-eyebrow">Nästa steg</span>'
        + '<p class="jq-mid-cta-t">Frågor om <em>din</em> situation?</p>'
        + '<div class="jq-mid-cta-btns">'
        + '<a class="jq-mid-cta-btn jq-mid-cta-btn--primary" href="/boka">Boka konsultation</a>'
        + '<a class="jq-mid-cta-btn jq-mid-cta-btn--secondary" href="tel:+46317135784">031‑713 57 84</a>'
        + '</div>';
      try { insertAfter.parentNode.insertBefore(cta, insertAfter.nextSibling); }
      catch(e) { console.error("[JQ.blog] injectMidArticleCta:", e); }
    }

    // === HERO CTA — synliga CTA-knappar direkt under post-title ========= //
    // Götadental har CTA-knappar i hero. Wix visar inte detta — vi injicerar.
    // Robust: använd flera fallback-selektorer, MutationObserver att re-trigger,
    // lägg DIRECT i body som final fallback så CTAs ALLTID syns.
    function injectHeroCTAs() {
      if (document.querySelector(".jq-post-hero-ctas")) return true;
      var ctaHtml =
        '<a class="jq-btn jq-btn--solid" href="/boka">Boka konsultation <span aria-hidden="true">→</span></a>' +
        '<a class="jq-btn jq-btn--ghost-dark" href="tel:+46317135784">031-713 57 84</a>';
      var ctaBlock = document.createElement("div");
      ctaBlock.className = "jq-post-hero-ctas";
      ctaBlock.innerHTML = ctaHtml;

      // Försök 1: efter post-description
      var desc = document.querySelector("[data-hook='post-description']");
      if (desc && desc.parentNode) {
        try { desc.parentNode.insertBefore(ctaBlock, desc.nextSibling); return true; } catch(_) {}
      }
      // Försök 2: efter post-title
      var title = document.querySelector("[data-hook='post-title']");
      if (title && title.parentNode) {
        try { title.parentNode.insertBefore(ctaBlock, title.nextSibling); return true; } catch(_) {}
      }
      // Försök 3: före post-content
      var content = findContentRoot();
      if (content && content.parentNode) {
        try { content.parentNode.insertBefore(ctaBlock, content); return true; } catch(_) {}
      }
      // Försök 4: fixed-position i body (alltid synligt)
      ctaBlock.classList.add("jq-post-hero-ctas--floating");
      try { document.body.appendChild(ctaBlock); return true; } catch(_) {}
      return false;
    }

    // Robust trigger — MutationObserver + retry tills CTAs är på plats
    function watchAndInjectHeroCTAs() {
      if (!isPost) return;
      // Försök direkt
      if (injectHeroCTAs()) return;
      // Retry-poll var 400ms upp till 20s
      var attempts = 0;
      var t = setInterval(function() {
        attempts++;
        if (injectHeroCTAs() || attempts >= 50) clearInterval(t);
      }, 400);
      // Plus MutationObserver: re-inject om Wix re-renderar och tar bort vår CTA
      try {
        var mo = new MutationObserver(function() {
          if (!document.querySelector(".jq-post-hero-ctas")) injectHeroCTAs();
        });
        mo.observe(document.body, { childList: true, subtree: true });
        setTimeout(function() { try { mo.disconnect(); } catch(_) {} }, 30000);
      } catch(_) {}
    }

    // === EYEBROW OVANFÖR VARJE H2 i CONTENT (Götadental-stil) ========= //
    // Götadental's posts har <span class="jq-eyebrow">[label]</span><h2>
    // ovanför varje sektion. Vi auto-injicerar numbered eyebrows.
    function injectEyebrows() {
      var contentRoot = findContentRoot();
      if (!contentRoot) return;
      var h2s = Array.from(contentRoot.querySelectorAll("h2"));
      h2s.forEach(function(h2, i) {
        // Hoppa över H2 som redan har eyebrow precis ovanför
        var prev = h2.previousElementSibling;
        if (prev && prev.classList && prev.classList.contains("jq-eyebrow")) return;
        // Hoppa över om H2 är inom en injectExtras-sektion (jq-blog-extra)
        if (h2.closest && h2.closest("#jq-blog-extra")) return;
        // Hoppa över FAQ-rubrik (text contains "Vanliga frågor")
        var labelText;
        var h2Text = (h2.textContent || "").trim().toLowerCase();
        if (/vanliga frågor|faq/.test(h2Text)) {
          labelText = "Vanliga frågor";
        } else {
          var n = String(i + 1).padStart(2, "0");
          labelText = n + " · Avsnitt";
        }
        var eb = document.createElement("span");
        eb.className = "jq-eyebrow";
        eb.textContent = labelText;
        try { h2.parentNode.insertBefore(eb, h2); }
        catch(e) { console.error("[JQ.blog] injectEyebrows:", e); }
      });
    }

    // === KEYWORD AUTO-LINK (första förekomst per behandling) ============ //
    function injectKeywordLinks() {
      var contentRoot = findContentRoot();
      if (!contentRoot) return;
      var treatments = [
        { re: /\b(botox)\b/i, url: "/botox" },
        { re: /\b(fillers?)\b/i, url: "/fillers" },
        { re: /\b(tr[åa]dlyft(?:et)?)\b/i, url: "/tradlyft" },
        { re: /\b(kemisk peeling)\b/i, url: "/behandling/kemisk-peeling" },
        { re: /\b(profhilo)\b/i, url: "/behandling/profhilo" },
        { re: /\b(sunekos)\b/i, url: "/behandling/sunekos" },
        { re: /\b(microneedling)\b/i, url: "/behandlingar/hudkvalitet" }
      ];
      var linked = {};
      treatments.forEach(function(t) { linked[t.url] = false; });
      // Samla textnoder i innehållet, hoppa över rubriker och redan-länkade
      var walker = document.createTreeWalker(contentRoot, NodeFilter.SHOW_TEXT, {
        acceptNode: function(node) {
          var p = node.parentElement;
          if (!p) return NodeFilter.FILTER_REJECT;
          var tag = p.tagName.toUpperCase();
          if (["H1","H2","H3","H4","H5","H6","A","SCRIPT","STYLE"].includes(tag)) return NodeFilter.FILTER_REJECT;
          return NodeFilter.FILTER_ACCEPT;
        }
      });
      var nodes = [];
      var n;
      while ((n = walker.nextNode())) nodes.push(n);
      treatments.forEach(function(t) {
        if (linked[t.url]) return;
        for (var i = 0; i < nodes.length; i++) {
          var text = nodes[i].nodeValue || "";
          var m = t.re.exec(text);
          if (!m) continue;
          var before = text.slice(0, m.index);
          var word = m[0];
          var after = text.slice(m.index + word.length);
          var a = document.createElement("a");
          a.href = t.url;
          a.className = "jq-kw-link";
          a.textContent = word;
          var frag = document.createDocumentFragment();
          if (before) frag.appendChild(document.createTextNode(before));
          frag.appendChild(a);
          if (after) frag.appendChild(document.createTextNode(after));
          nodes[i].parentNode.replaceChild(frag, nodes[i]);
          linked[t.url] = true;
          break;
        }
      });
    }

    // === /BLOG ARCHIVE — bygg Götadental-style hero/filter/featured/lista === //
    function escHtml(s) {
      return String(s == null ? "" : s)
        .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
    }
    function escAttr(s) { return escHtml(s); }
    function slugify(s) {
      return String(s || "").toLowerCase()
        .replace(/[åä]/g, "a").replace(/ö/g, "o")
        .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "okat";
    }
    function fmtDateParts(d) {
      try {
        const dt = new Date(d);
        if (isNaN(dt)) return { d: "", m: "", y: "", iso: "" };
        const months = ["JAN","FEB","MAR","APR","MAJ","JUN","JUL","AUG","SEP","OKT","NOV","DEC"];
        return { d: String(dt.getDate()), m: months[dt.getMonth()], y: String(dt.getFullYear()), iso: dt.toISOString() };
      } catch (e) { return { d: "", m: "", y: "", iso: "" }; }
    }
    function getCoverUrl(p) {
      try {
        // New blog-frontend-adapter-public format
        if (p.media && p.media.embedMedia && p.media.embedMedia.thumbnail && p.media.embedMedia.thumbnail.url) {
          return p.media.embedMedia.thumbnail.url;
        }
        if (p.coverImage) {
          if (typeof p.coverImage === "string") return p.coverImage;
          if (p.coverImage.src && p.coverImage.src.url) return p.coverImage.src.url;
          if (p.coverImage.url) return p.coverImage.url;
        }
        if (p.media) {
          if (p.media.wixMedia && p.media.wixMedia.image) {
            const im = p.media.wixMedia.image;
            if (typeof im === "string") return im;
            if (im.url) return im.url;
            if (im.src) return im.src;
          }
          if (p.media.url) return p.media.url;
        }
        if (p.heroImage && p.heroImage.src && p.heroImage.src.url) return p.heroImage.src.url;
      } catch (e) {}
      return "";
    }
    function getCategory(p) {
      try {
        if (p.categories && p.categories[0]) {
          const c = p.categories[0];
          return { label: c.label || c.title || c.name || "Artikel", slug: c.slug || slugify(c.label || c.name) };
        }
      } catch (e) {}
      return { label: "Artikel", slug: "artikel" };
    }
    function getLead(p, max) {
      const t = (p.excerpt || p.description || "").replace(/<[^>]+>/g, "").trim();
      if (!t) return "";
      if (t.length <= max) return t;
      return t.slice(0, max - 1).replace(/\s+\S*$/, "") + "…";
    }

    function renderArchive(posts) {
      const mount = document.getElementById("jq-archive");
      if (!mount) return;
      if (!posts.length) {
        mount.innerHTML = '<section class="jq-sec jq-blog-hero"><div class="jq-wrap">'
          + '<span class="jq-eyebrow">Journal</span>'
          + '<h1 class="jq-blog-hero-h">Insikter från<br><em>specialistkliniken.</em></h1>'
          + '<p class="jq-blog-hero-lede">Snart publicerar vi forskningsbaserade artiklar om estetisk medicin här.</p>'
          + '</div></section>';
        return;
      }
      const featured = posts.slice(0, 3);
      const rest = posts.slice(3);

      // Bygg unika kategorier (auto-pillar)
      const catMap = new Map();
      posts.forEach(function (p) {
        const c = getCategory(p);
        if (!catMap.has(c.slug)) catMap.set(c.slug, { label: c.label, slug: c.slug, count: 0 });
        catMap.get(c.slug).count++;
      });
      const cats = Array.from(catMap.values()).filter(function (c) { return c.slug !== "artikel" || c.count !== posts.length; });

      // HERO
      var html = '<section class="jq-sec jq-blog-hero"><div class="jq-wrap">'
        + '<span class="jq-eyebrow">Journal</span>'
        + '<h1 class="jq-blog-hero-h">Insikter från<br><em>specialistkliniken.</em></h1>'
        + '<p class="jq-blog-hero-lede">Forskningsbaserade artiklar om botox, fillers, regenerativ hudvård och trådlyft — skrivna av leg. specialisttandläkare med expertis i ansiktets anatomi.</p>'
        + '<div class="jq-blog-hero-meta">'
        + '<span><b>' + posts.length + '</b> artiklar</span>'
        + '<span class="jq-blog-hero-dot" aria-hidden="true">·</span>'
        + '<span>Uppdateras veckovis</span>'
        + '</div></div></section>';

      // FILTER PILLS (om mer än 1 kategori)
      if (cats.length > 1) {
        html += '<section class="jq-sec jq-blog-filter-sec"><div class="jq-wrap">'
          + '<div class="jq-blog-filter" role="tablist" aria-label="Filtrera artiklar">'
          + '<button type="button" class="jq-blog-pill is-active" data-cat="all" role="tab" aria-selected="true">'
          + 'Alla <span class="jq-blog-pill-n">' + posts.length + '</span></button>';
        cats.forEach(function (c) {
          html += '<button type="button" class="jq-blog-pill" data-cat="' + escAttr(c.slug) + '" role="tab" aria-selected="false">'
            + escHtml(c.label) + ' <span class="jq-blog-pill-n">' + c.count + '</span></button>';
        });
        html += '</div></div></section>';
      }

      // FEATURED 3-grid
      html += '<section class="jq-sec jq-blog-featured"><div class="jq-wrap"><div class="jq-blog-featured-grid">';
      featured.forEach(function (p, i) {
        const c = getCategory(p);
        const dp = fmtDateParts(p.firstPublishedDate || p.lastPublishedDate);
        const img = getCoverUrl(p);
        const url = "/post/" + (p.slug || "");
        const lead = getLead(p, i === 0 ? 200 : 110);
        const read = (p.minutesToRead || 4) + " min";
        const big = i === 0 ? " jq-blog-fcard--big" : "";
        html += '<article class="jq-blog-fcard' + big + '" data-cat="' + escAttr(c.slug) + '">'
          + '<a class="jq-blog-fcard-link" href="' + escAttr(url) + '" aria-label="' + escAttr(p.title || "") + '">'
          + (img ? ('<div class="jq-blog-fcard-img"><img src="' + escAttr(img) + '" alt="' + escAttr(p.title || "") + '" loading="' + (i === 0 ? "eager" : "lazy") + '" decoding="async"></div>') : '')
          + '<div class="jq-blog-fcard-body">'
          + '<div class="jq-blog-fcard-meta">'
          + '<time datetime="' + escAttr(dp.iso) + '">' + escHtml(dp.d + " " + (dp.m ? dp.m.charAt(0) + dp.m.slice(1).toLowerCase() : "") + " " + dp.y) + '</time>'
          + '<span aria-hidden="true">·</span><span>' + escHtml(c.label) + '</span>'
          + '<span aria-hidden="true">·</span><span>' + escHtml(read) + '</span>'
          + '</div>'
          + '<h2 class="jq-blog-fcard-h">' + escHtml(p.title || "") + '</h2>'
          + (lead ? '<p class="jq-blog-fcard-lead">' + escHtml(lead) + '</p>' : '')
          + '<span class="jq-blog-fcard-more">Läs artikeln <span aria-hidden="true">→</span></span>'
          + '</div></a></article>';
      });
      html += '</div></div></section>';

      // ARKIV-LISTA (text-tabell)
      if (rest.length) {
        html += '<section class="jq-sec jq-blog-list-sec"><div class="jq-wrap">'
          + '<div class="jq-blog-list-head"><span class="jq-eyebrow">Alla artiklar</span><h3 class="jq-blog-list-h">Arkiv</h3></div>'
          + '<ol class="jq-blog-list" id="jq-archive-list">';
        rest.forEach(function (p) {
          const c = getCategory(p);
          const dp = fmtDateParts(p.firstPublishedDate || p.lastPublishedDate);
          const url = "/post/" + (p.slug || "");
          const lead = getLead(p, 130);
          const read = (p.minutesToRead || 4) + " min";
          html += '<li class="jq-blog-row" data-cat="' + escAttr(c.slug) + '">'
            + '<a class="jq-blog-row-link" href="' + escAttr(url) + '">'
            + '<time class="jq-blog-row-date" datetime="' + escAttr(dp.iso) + '">'
            + '<span class="jq-blog-row-d">' + escHtml(dp.d) + '</span>'
            + '<span class="jq-blog-row-m">' + escHtml(dp.m) + '</span>'
            + '<span class="jq-blog-row-y">' + escHtml(dp.y) + '</span>'
            + '</time>'
            + '<div class="jq-blog-row-main">'
            + '<span class="jq-blog-row-cat">' + escHtml(c.label) + '</span>'
            + '<h4 class="jq-blog-row-h">' + escHtml(p.title || "") + '</h4>'
            + (lead ? '<p class="jq-blog-row-lead">' + escHtml(lead) + '</p>' : '')
            + '</div>'
            + '<div class="jq-blog-row-meta">'
            + '<span class="jq-blog-row-read">' + escHtml(read) + '</span>'
            + '<span class="jq-blog-row-arrow" aria-hidden="true">→</span>'
            + '</div></a></li>';
        });
        html += '</ol><div class="jq-blog-empty" id="jq-archive-empty" hidden><p>Inga artiklar i denna kategori.</p></div></div></section>';
      }

      mount.innerHTML = html;

      // Klient-side filter
      const pills = mount.querySelectorAll(".jq-blog-pill");
      const fcards = mount.querySelectorAll(".jq-blog-fcard");
      const rows = mount.querySelectorAll(".jq-blog-row");
      const empty = mount.querySelector("#jq-archive-empty");
      pills.forEach(function (p) {
        p.addEventListener("click", function () {
          const cat = p.getAttribute("data-cat");
          pills.forEach(function (x) {
            const on = x === p;
            x.classList.toggle("is-active", on);
            x.setAttribute("aria-selected", on ? "true" : "false");
          });
          var visible = 0;
          fcards.forEach(function (c) {
            const show = cat === "all" || c.getAttribute("data-cat") === cat;
            c.style.display = show ? "" : "none";
            if (show) visible++;
          });
          rows.forEach(function (r) {
            const show = cat === "all" || r.getAttribute("data-cat") === cat;
            r.style.display = show ? "" : "none";
            if (show) visible++;
          });
          if (empty) empty.hidden = visible > 0;
        });
      });
    }

    function injectArchive() {
      if (document.getElementById("jq-archive")) {
        console.log("[JQ.blog] injectArchive: already mounted, skipping");
        return;
      }
      console.log("[JQ.blog] injectArchive: mounting #jq-archive");
      // Bygg mount-container ÖVERST i body så ingen Wix-wrapper kan dölja den.
      // CSS dölger Wix-feed nedan så vår archive tar dess plats visuellt.
      const mount = document.createElement("section");
      mount.id = "jq-archive";
      mount.setAttribute("aria-label", "Bloggarkiv — alla artiklar");
      mount.style.cssText = "display:block !important;visibility:visible !important;opacity:1 !important;position:relative !important;z-index:10 !important;";

      // Försök hitta Wix-feed-roten — lägg vår OVANFÖR den så den syns där bloggen ska vara.
      const feedRoot =
        document.querySelector('[data-hook="feed-page-root"]') ||
        document.querySelector('[data-hook="post-list-pro-gallery-container"]') ||
        document.querySelector('main');
      try {
        if (feedRoot && feedRoot.parentNode) {
          feedRoot.parentNode.insertBefore(mount, feedRoot);
          console.log("[JQ.blog] mounted before feed-root");
        } else {
          // Sista utväg: först i body
          document.body.insertBefore(mount, document.body.firstChild);
          console.log("[JQ.blog] mounted as body.firstChild fallback");
        }
      } catch (insertErr) {
        console.error("[JQ.blog] insertBefore failed:", insertErr);
        document.body.appendChild(mount);
      }

      // Visa direkt en hero-skeleton så Ali ser SOMETHING även om fetch dröjer
      mount.innerHTML = '<section class="jq-sec jq-blog-hero"><div class="jq-wrap">'
        + '<span class="jq-eyebrow">Journal</span>'
        + '<h1 class="jq-blog-hero-h">Insikter från<br><em>specialistkliniken.</em></h1>'
        + '<p class="jq-blog-hero-lede">Laddar artiklar…</p>'
        + '</div></section>';

      // Fetch posts via Wix RSS feed — publik, ingen auth behövs.
      console.log("[JQ.blog] fetching RSS /blog-feed.xml");
      try {
        fetch("/blog-feed.xml", { credentials: "same-origin" })
          .then(function (r) {
            if (!r.ok) throw new Error("RSS HTTP " + r.status);
            return r.text();
          })
          .then(function (xml) {
            var parser = new DOMParser();
            var doc = parser.parseFromString(xml, "text/xml");
            var items = Array.from(doc.querySelectorAll("item"));
            var seen = new Set();
            var posts = [];
            items.forEach(function (item) {
              var title = (item.querySelector("title") || {}).textContent || "";
              var titleKey = title.trim().toLowerCase();
              if (seen.has(titleKey)) return; // dedup
              seen.add(titleKey);
              var link = (item.querySelector("link") || {}).textContent || "";
              var slug = link.replace(/^.*\/post\//, "").replace(/\?.*$/, "");
              var desc = (item.querySelector("description") || {}).textContent || "";
              var pubDate = (item.querySelector("pubDate") || {}).textContent || "";
              var enc = item.querySelector("enclosure");
              var img = enc ? (enc.getAttribute("url") || "") : "";
              posts.push({
                title: title, slug: slug, excerpt: desc,
                firstPublishedDate: pubDate ? new Date(pubDate).toISOString() : "",
                media: img ? { embedMedia: { thumbnail: { url: img } } } : null
              });
            });
            console.log("[JQ.blog] RSS: ", posts.length, "posts");
            renderArchive(posts);
          })
          .catch(function (err) {
            console.error("[JQ.blog] RSS failed:", err);
            renderArchive([]);
          });
      } catch (e) {
        console.error("[JQ.blog] injectArchive try/catch:", e);
        renderArchive([]);
      }
    }

    // === BACK-LINK "← Tillbaka till bloggen" ovanför post-title ====== //
    function injectBackLink() {
      if (document.querySelector(".jq-blog-back-wrap")) return;
      // post-title kan ligga i ett wrapper-div ELLER vara h1 direkt — hitta båda
      const titleEl = document.querySelector('[data-hook="post-title"]');
      if (!titleEl) return;
      // Gå upp till närmsta wrapper-section innan titel (PKQ95p eller liknande)
      // för att placera back-link OVANFÖR hela header-grupperingen
      const headerWrap = titleEl.closest("header") || titleEl.parentElement;
      const target = headerWrap || titleEl;
      const wrap = document.createElement("div");
      wrap.className = "jq-blog-back-wrap";
      wrap.innerHTML = '<a class="jq-blog-back" href="/blog"><span aria-hidden="true">←</span> Tillbaka till bloggen</a>';
      try {
        target.parentNode.insertBefore(wrap, target);
      } catch (e) { console.error("[JQ.blog] injectBackLink insertBefore:", e); }
    }

    // === FAKTAGRANSKAD-rad med ✓ check under post-description ======== //
    function injectFaktagranskad() {
      if (document.querySelector(".jq-blog-fakta")) return;
      const lede = document.querySelector('[data-hook="post-description"]');
      // Fallback — om ingen description, sätt under titel
      const anchor = lede || document.querySelector('[data-hook="post-title"]');
      if (!anchor) return;
      const el = document.createElement("div");
      el.className = "jq-blog-fakta";
      el.innerHTML =
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'
        + '<path d="M20 6 9 17l-5-5"/></svg>'
        + '<span>Faktagranskad av leg. specialisttandläkare i estetiska injektioner</span>';
      try {
        anchor.parentNode.insertBefore(el, anchor.nextSibling);
      } catch (e) { console.error("[JQ.blog] injectFaktagranskad insertBefore:", e); }
    }

    console.log("[JQ.blog] booting on", path, "isBlog=", isBlog, "isPost=", isPost);

    // Säker init-wrapper med loggning
    function safeInit() {
      try { init(); } catch (e) { console.error("[JQ.blog] init() failed:", e); }
    }

    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", safeInit);
    } else {
      safeInit();
    }

    // MutationObserver — Wix Blog SSR/hydrerar asynkront. Vi observerar body
    // tills Wix-feed-roten dyker upp ELLER ett blog-link finns i DOM, sen kör
    // injectArchive() igen ifall första försöket gick innan Wix var klar.
    if (isBlog) {
      let archiveAttempts = 0;
      const tryInjectArchive = function (reason) {
        archiveAttempts++;
        console.log("[JQ.blog] tryInjectArchive attempt", archiveAttempts, "reason:", reason);
        if (!document.getElementById("jq-archive")) {
          try { injectArchive(); } catch (e) { console.error("[JQ.blog] tryInjectArchive failed:", e); }
        }
      };

      // Kör direkt om body finns
      if (document.body) tryInjectArchive("immediate");

      // Observera body för Wix-render
      try {
        const mo = new MutationObserver(function (mutations) {
          if (document.getElementById("jq-archive")) {
            // Redan mountad, men kolla om Wix-feed dök upp efter — säkerställ att vår är OVANFÖR
            const feedRoot = document.querySelector('[data-hook="feed-page-root"]') ||
                             document.querySelector('[data-hook="post-list-pro-gallery-container"]');
            const ours = document.getElementById("jq-archive");
            if (feedRoot && ours && feedRoot.compareDocumentPosition(ours) & Node.DOCUMENT_POSITION_FOLLOWING) {
              // Vår är EFTER Wix-feed → flytta upp
              try {
                feedRoot.parentNode.insertBefore(ours, feedRoot);
                console.log("[JQ.blog] re-positioned archive above feed-root");
              } catch (e) { console.error("[JQ.blog] reposition failed:", e); }
            }
            return;
          }
          // Inte mountad än — försök om Wix-roten dykt upp eller blog-link finns
          const hasFeed = document.querySelector('[data-hook="feed-page-root"]') ||
                          document.querySelector('[data-hook="post-list-pro-gallery-container"]') ||
                          document.querySelector('main');
          if (hasFeed) tryInjectArchive("mutation-feed-detected");
        });
        const startObserve = function () {
          if (!document.body) return false;
          mo.observe(document.body, { childList: true, subtree: true });
          console.log("[JQ.blog] MutationObserver attached");
          return true;
        };
        if (!startObserve()) {
          // body inte redo — vänta
          document.addEventListener("DOMContentLoaded", startObserve);
        }
        // Avsluta efter 10s — vi har då redan mountad eller gav upp
        setTimeout(function () { try { mo.disconnect(); console.log("[JQ.blog] MutationObserver disconnected after 10s"); } catch (e) {} }, 10000);
      } catch (e) {
        console.error("[JQ.blog] MutationObserver setup failed:", e);
      }

      // Backup-polling — om MO missar något, kör 5 gånger under 4s
      let pollAttempts = 0;
      const archivePoll = setInterval(function () {
        pollAttempts++;
        if (!document.getElementById("jq-archive")) {
          tryInjectArchive("poll-" + pollAttempts);
        }
        if (pollAttempts >= 10) clearInterval(archivePoll); // 10 × 500ms = 5s
      }, 500);
    }

    // Wix Blog hydrerar asynkront — post-title finns ofta INTE vid första init().
    // Re-run inject-funktionerna ett par gånger under första 3s tills DOM är fylld.
    if (isPost) {
      let attempts = 0;
      const retry = setInterval(function () {
        attempts++;
        if (document.querySelector('[data-hook="post-title"]')) {
          try { injectBackLink(); } catch (e) { console.error("[JQ.blog] injectBackLink retry:", e); }
          try { injectFaktagranskad(); } catch (e) { console.error("[JQ.blog] injectFaktagranskad retry:", e); }
        }
        if (attempts >= 8) clearInterval(retry); // 8 × 400ms = 3.2s
      }, 400);
    }
    // Re-init vid Wix client-side route changes (SPA)
    let lastPath = path;
    setInterval(function () {
      const cur = window.location.pathname || "/";
      if (cur !== lastPath) {
        lastPath = cur;
        if (cur.startsWith("/post/") || cur.startsWith("/blog")) {
          // Riv gamla extras innan re-init så Relaterade-listan uppdateras för ny post
          const stale = document.getElementById("jq-blog-extra");
          if (stale) stale.remove();
          // Riv gamla back-link/fakta så de re-injectas på ny post
          const staleBack = document.querySelector(".jq-blog-back-wrap");
          if (staleBack) staleBack.remove();
          const staleFakta = document.querySelector(".jq-blog-fakta");
          if (staleFakta) staleFakta.remove();
          // Riv ev gammal archive så injectArchive() bygger ny på nästa /blog-besök
          const staleArchive = document.getElementById("jq-archive");
          if (staleArchive) staleArchive.remove();
          setTimeout(init, 800);
        }
      }
    }, 1000);
  } catch (e) {
    try { console.error("[JQ.blog] OUTER blog-IIFE failed:", e); } catch (_) {}
  }
})();
