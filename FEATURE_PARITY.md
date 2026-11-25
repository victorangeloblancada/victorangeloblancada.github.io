# Feature Parity Matrix

This matrix accounts for every existing Jekyll plugin, layout, include, and site-wide capability observed in the source repository, alongside newly introduced Astro platform capabilities.

---

## 1. Jekyll Plugins Parity

| Legacy Jekyll Plugin | Purpose in Current Site | Astro Replacement | Status / Notes |
| --- | --- | --- | --- |
| `jekyll-octicons` | Renders inline Octicons (`search`, `home`, `person`, `book`, `file`, `sun`, `moon`, `arrow-down`) | Inline static SVG icon helper component (`Icon.astro` using `@primer/octicons` or crisp inline SVGs) | Zero runtime overhead; full `aria-hidden` / `aria-label` accessibility |
| `jekyll-seo-tag` | Title tags, `<meta name="description">`, canonical URLs, Open Graph, Twitter cards, JSON-LD | Dedicated `BaseHead.astro` component | Explicit Open Graph image, canonical URL, `Person` & `Article` JSON-LD |
| `jekyll-sitemap` | Generates `/sitemap.xml` and `/robots.txt` | `@astrojs/sitemap` + `public/robots.txt` + `/sitemap.xml` compatibility index | Excludes `draft: true` posts (both legacy unlisted drafts and new drafts); single `Sitemap` reference (`sitemap-index.xml`) in `robots.txt` |
| `jekyll-feed` | Generates Atom feed at `/feed.xml` (excludes drafts) | Atom 1.0 generator at `src/pages/feed.xml.ts` | Preserves exact `/feed.xml` URL, legacy entry `<id>` format (without `.html`), full rendered HTML `<content>`, limited to 20 newest published posts |
| `_plugins/tag_gen.rb` | Generates `/blog/tag/<tag>/index.html` for 107 tags (excluding drafts) | `src/pages/blog/tag/[tag]/index.astro` | Normalized lowercase slug directories + static redirects for legacy space/case tag URLs (verified in Linux CI for `Bayes` vs `bayes`) |
| `jekyll-toc` *(commented out)* | Intended table of contents | Build-time heading extraction (`headings` from Astro `render()`) + `TableOfContents.astro` | Fully implemented with active-heading highlight |

---

## 2. Layouts & Includes Parity

| Legacy File | Purpose | Astro Replacement | Notes |
| --- | --- | --- | --- |
| `_layouts/default-full.html` | Root HTML chrome, GTM, SEO, styles, nav, footer | `BaseLayout.astro` | Semantic `<header>`, `<main>`, `<footer>`, skip-to-content link |
| `_layouts/default.html` | Centered `.content` container wrapper | `BaseLayout.astro` (`narrow` prop) / `PageLayout.astro` | Responsive fluid measure (`65ch`–`72ch`) |
| `_layouts/post.html` | `100vh` hero image, scroll indicator, dropcap, share buttons, tag pills | `ArticleLayout.astro` | Adds TOC, reading time, prev/next post, related posts, copy-code, image lightbox |
| `_layouts/post-alt.html` | Split mobile/desktop hero layout (unused in current posts) | Supported as variant in `ArticleLayout.astro` | Optional front-matter `layout: 'post-alt'` support |
| `_layouts/gallery.html` | Renders all 9 images in `assets/images/ai-paintings/` (`2019-10-15-ai-art-gallery.md`) | `GalleryLayout.astro` / `GalleryGrid.astro` | Preserves 9 images with responsive grid + accessible lightbox |
| `_layouts/profile.html` | Bio layout with portrait (`Victor_5.jpg`) used by `_pages/about.md` | `ProfileLayout.astro` | Clean editorial layout for `/pages/about.html` & `/about/` |
| `_layouts/tag_index.html` | Tag listing page | `TagArchiveLayout.astro` | Adds post dates, excerpts, reading time, and count |
| `_includes/navigation.html` | Fixed top/bottom icon bar + inline search + theme toggle | `HeaderNav.astro` + `SearchModal.astro` + `ThemeToggle.astro` | Keyboard navigable (`Cmd/Ctrl+K`, `Escape`), fixes unclosed `</div>`, adds mobile drawer/bar parity |
| `_includes/styles.html` | Anti-FOUC theme script, `Jost.css`, `styles.css`, `syntax.css`, favicons | `BaseHead.astro` + `tokens.css` | Self-hosted fonts, zero render-blocking theme flash |
| `_includes/reading-time.html` | 180 WPM estimate (commented out in `post.html`) | `src/utils/readingTime.ts` | Enabled cleanly in article metadata header |
| `_includes/scroll-indicator.html` | Top reading progress bar via `window.onscroll` | `ReadingProgress.astro` | Uses CSS `animation-timeline: scroll()` where supported with lightweight passive scroll fallback |
| `_includes/share-buttons.html` | LinkedIn, Twitter, Facebook, Email share links | `ShareLinks.astro` | Accessible `<a>` links with `rel="noopener noreferrer"` (replaces `window.open` `<div>`s) + Copy Link button |
| `_includes/gtm_head.html` & `gtm_body.html` | `GTM-5S5WB7M` and `G-ERJECQ081H` snippets | Config-gated + GDPR opt-in `CookieBanner.astro` in `BaseHead.astro` / `BaseLayout.astro` | Disabled by default (`PUBLIC_ENABLE_ANALYTICS=false`); when `true`, analytics scripts load only after explicit user consent via banner and can be changed anytime via footer `Cookie Preferences` |

---

## 3. Site-Wide Functionality & Interactive Features

| Feature | Legacy State | Astro Target State | Parity / Upgrade |
| --- | --- | --- | --- |
| **Site Search** | `SimpleJekyllSearch` via `/search.json`; `/search.html` broken (`search-script.js` missing) | **Pagefind** (`Cmd/Ctrl+K` modal + `/search/` page), indexed on `<main data-pagefind-body>`, excludes chrome/nav/footer | Major upgrade: full-text snippets, match highlights, type/category/tag filters, dates |
| **Theme Switching** | `html.dark-theme` / `html.light-theme` + `localStorage` + `prefers-color-scheme` | Enhanced CSS token theme system (`data-theme="light|dark"`) + system preference + persisted `localStorage` | 100% parity + zero FOUC + themed Shiki code blocks |
| **Math Typesetting** | MathJax 2.7.5 CDN (`TeX-MML-AM_CHTML`) on 14 posts; 1 post uses AsciiMath backticks | Build-time **KaTeX** via `remark-math` (`singleDollarTextMath: false`) + `rehype-katex` + build-time AsciiMath conversion for `2022-03-20` | Faster load, zero layout shift, no external MathJax runtime, currency `$` safe |
| **Code Highlighting** | Rouge (`assets/css/syntax.css` + `{% highlight %}` + triple backticks) | **Shiki** dual light/dark themes + copy-code button + language label | Parity + interactive copy feedback & accessible focus states |
| **Interactive: Percentage Calc** | Inline `<script>` + `<form>` in `2021-01-31-percentage-calculator.md` | Preserved / upgraded to accessible `PercentageCalc.astro` component | Keyboard-friendly `input` events, division-by-zero & NaN safety |
| **Interactive: Scaling Laws Explorer** | Inline `<script>` + 2 range sliders in `2026-07-28-the-most-expensive-question-in-ml.md` | `ScalingLawExplorer.astro` matching light/dark theme tokens | Preserves exact Kaplan/Chinchilla/Amortized Inference equations |
| **Video Embed (`2021-06-22`)** | Responsive YouTube `<iframe>` | Accessible responsive `<iframe>` wrapper (`title`, `loading="lazy"`) | Improved accessibility & aspect-ratio stability |
| **Content Collections** | Flat `_posts/` + `_pages/` only | Typed `blog`, `projects`, `lab`, `pages` collections (`notes` consolidated into a draft blog essay) | Historical `legacyUnlisted: true` drafts remain resolvable at original URLs with `noindex`; new `draft: true` posts are omitted from build |
| **Discovery & Navigation** | Flat `blog.html` + raw `/blog/tag/<tag>/` | Year archives, category pages, tag pages, pagination, featured/recent posts, prev/next nav, related posts (shared tags) | Canonical `/blog.html` + sticky scroll-tracking desktop ToC |
| **Reading Experience** | Plain prose + optional `.dropcap` | Fluid measure, responsive `<picture>`/images, image lightbox/zoom, callouts, TOC, reading progress, back-to-top, `@media print` | Editorial reading polish |
| **404 Page** | Basic 2-line `404.html` | Helpful `404.astro` with search trigger & popular links | Retains GitHub Pages `404.html` contract |
| **Speech Input** | `speech-input.js` mic button on search bar | Optional progressive enhancement on search modal if `SpeechRecognition` is supported | Preserved gracefully where supported |
| **New Lab Demo A** | None | **Interactive K-Means Clustering Explorer** (2D datasets, $k$ slider, init method, step/play iterations, mobile touch, explanatory notes) | Real client-side algorithm via lazy D3/Canvas |
| **New Lab Demo B** | None | **Generative Network Topology Visualizer** (interactive nodes/edges, hover/pointer physics, FPS cap, `prefers-reduced-motion`, static SVG fallback) | Replaces decorative hero image with purposeful visual identity |

---

## 4. Intentional Legacy Endpoint Drops & Upstream Content Quirks

- **Intentional drops vs. Jekyll `_site/`:**
  - `/search.json` — replaced by static Pagefind full-text index (`/pagefind/`) with `type`, `category`, and `tag` facets.
  - `/assets/css/styles.css` — replaced by hashed Astro CSS bundles implementing Palette C tokens and prose styles.
  - `/assets/drafts/2020-09-07-center-of-gravity-analysis.html` — removed duplicate copy; canonical published version lives at `/blog/2020/09/07/center-of-gravity-analysis.html`.
  - `/README.md` — repository documentation is no longer copied into the published web root.
- **Analytics activation (`PUBLIC_ENABLE_ANALYTICS`):** Set repository variable `PUBLIC_ENABLE_ANALYTICS=true` (and optionally override `PUBLIC_GTM_ID` / `PUBLIC_GA4_ID`) in GitHub Settings → Variables → Actions, or pass them in local environment builds. Default remains `false` so local builds and forks emit zero analytics beacons.
- **Historical markdown quirks:** In `src/content/blog/2026-07-28-the-most-expensive-question-in-ml.md`, three blank lines inside the inline calculator HTML block were removed so CommonMark parses controls cleanly instead of escaping `<pre>`. Upstream `_posts/` files remain untouched. In `2022-03-20-finance-from-first-principles.md`, the upstream blank `######` heading marker after `Option payoff...` is left faithful to the historical source.
