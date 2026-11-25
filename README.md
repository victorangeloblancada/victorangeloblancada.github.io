# victorangeloblancada.github.io
<<<<<<< HEAD

Personal portfolio, technical publication, and interactive research laboratory for **Victor Angelo Blancada**, migrated from Jekyll to **Astro** static site generation with **Pagefind** search, build-time **KaTeX**, **Shiki**, **D3.js** / **Canvas** experiments, and automated **GitHub Actions** deployment to GitHub Pages.

---

## Tech Stack

- **Static Site Generator:** Astro 7 (`output: 'static'`, `site: 'https://victorangeloblancada.github.io'`)
- **Content Architecture:** Typed Astro Content Collections (`src/content.config.ts`) for `blog`, `projects`, `lab`, `notes`, and `pages`
- **Math & Code:** Build-time `remark-math` (`singleDollarTextMath: false`) + `rehype-katex` + Shiki dual light/dark themes + custom Jekyll compatibility plugin (`src/plugins/remark-jekyll-compat.ts`)
- **Search:** Pagefind static full-text search (`Cmd/Ctrl + K` modal + `/search/` page)
- **Syndication & Discovery:** `@astrojs/rss` (`/feed.xml`), `@astrojs/sitemap` (`/sitemap-index.xml` + `/sitemap.xml`), `public/robots.txt`, year/category/normalized-tag archives
- **Interactive Modules:** Isolated, lazy-loaded Vanilla TypeScript + D3.js / Canvas 2D visualizations (`ClusteringExplorer`, `GenerativeNetwork`) with `prefers-reduced-motion` and static `<noscript>` fallbacks

---

## Local Development

### Prerequisites
- Node.js **22 LTS** or newer (CI pins Node `22`)
- `npm`

### Commands

```bash
# Install dependencies
npm ci

# Start local Astro dev server (http://localhost:4321)
npm run dev

# Run TypeScript and Astro diagnostics
npm run check

# Build static production output (dist/) and generate Pagefind search index
npm run build

# Preview the production build locally (required to test Pagefind search)
npm run preview
```

> **Note on Search in Dev Mode:** Pagefind generates its index in `dist/pagefind/` during `npm run build`. Run `npm run build && npm run preview` to test search locally against the production output.

---

## Content Authoring

All structured content lives under `src/content/`:

| Collection | Location | Purpose |
| --- | --- | --- |
| `blog` | `src/content/blog/` | Historical (2017–2026) and new technical articles (`.md` / `.mdx`) |
| `projects` | `src/content/projects/` | Case studies with organization, role, impact metrics, stack, and status |
| `lab` | `src/content/lab/` | Interactive browser experiments paired with a `componentId` |
| `notes` | `src/content/notes/` | Shorter research and engineering observations |
| `pages` | `src/content/pages/` | Migrated `/pages/*.html` biography, role summaries, and résumé downloads |

### Authoring Notes & Conventions
- **Blog URLs:** Derived automatically from front-matter `date` (`/blog/YYYY/MM/DD/<slug>.html`). Use `draft: true` to keep unpublished articles out of public builds, feeds, search, and sitemaps.
- **Optional Desktop TOC:** Long-form articles automatically show the sticky desktop Table of Contents rail when 3+ `##`/`###` headings exist; set `toc: false` or `toc: true` in front matter to override per post.
- **Math Safety:** Use `$$...$$` for both inline and display KaTeX math so literal dollar currency amounts (e.g., `$400MM`, `$30,000`) in prose are never parsed as math.
- **Assets:** Static files under `public/` (images, `.woff` fonts, videos, CSV datasets, downloadable CVs under `public/assets/files/`) are served directly at `/assets/...`.

---

## Analytics Configuration (Gated Flag)

Google Tag Manager (`GTM-5S5WB7M`) and Google Analytics 4 (`G-ERJECQ081H`) are **disabled by default** and gated behind an explicit configuration flag in `src/config/site.ts`.

### Enabling Analytics
- **Local / `.env` (optional, never commit `.env`):**
  ```bash
  PUBLIC_ENABLE_ANALYTICS=true
  PUBLIC_GTM_ID=GTM-5S5WB7M
  PUBLIC_GA4_ID=G-ERJECQ081H
  ```
- **GitHub Actions Production Deployment:**
  1. Open your GitHub repository → **Settings → Secrets and variables → Actions → Variables**.
  2. Create repository variable `PUBLIC_ENABLE_ANALYTICS` and set its value to `true`.
  3. Optionally override `PUBLIC_GTM_ID` or `PUBLIC_GA4_ID` if IDs change.
  4. Re-run or trigger the **Deploy Astro Site to GitHub Pages** workflow.

When `PUBLIC_ENABLE_ANALYTICS` is unset or `false`, no GTM/GA4 scripts or `<noscript>` iframes are emitted into the static HTML.

---

## Deployment & Rollback (GitHub Pages)

The workflow in [`.github/workflows/deploy.yml`](./.github/workflows/deploy.yml) builds with **Node 22 LTS**, runs `npm run check`, builds `dist/` + Pagefind, and deploys via `actions/deploy-pages@v4` on pushes to `master` (or manual `workflow_dispatch`).

### First-Time Cutover Checklist
1. Verify `npm run check` and `npm run build` pass cleanly locally.
2. Verify all QA checks in [`QA_REPORT.md`](./QA_REPORT.md) and [`MIGRATION_INVENTORY.csv`](./MIGRATION_INVENTORY.csv).
3. Tag the final pre-migration Jekyll commit on `master` (e.g., `git tag jekyll-archive-final`).
4. In GitHub repository **Settings → Pages**, change **Build and deployment → Source** from *Deploy from a branch* to **GitHub Actions**.
5. Merge the migration branch into `master` (only after explicit approval) and confirm the GitHub Actions deploy job succeeds cleanly on `https://victorangeloblancada.github.io/`.

### Rollback Procedure
1. **Immediate rollback (< 2 min):** In GitHub **Settings → Pages**, switch **Source** back to *Deploy from a branch* (`master`) pointing to the tagged Jekyll state, **or**
2. **Git rollback:** `git revert <merge-commit-sha>` on `master` (or restore from tag `jekyll-archive-final`) so GitHub Pages serves the prior Jekyll snapshot cleanly.

---

## Migration & Architecture Documentation

- [`MIGRATION.md`](./MIGRATION.md) — Jekyll audit, risk register, Astro target architecture, and ADRs
- [`FEATURE_PARITY.md`](./FEATURE_PARITY.md) — Plugin, layout, include, and site-wide parity matrix
- [`MIGRATION_INVENTORY.csv`](./MIGRATION_INVENTORY.csv) — Verified URL inventory across all 46 posts, 5 pages, endpoints, and 107 tag routes
- [`DESIGN_BRIEF.md`](./DESIGN_BRIEF.md) — Editorial positioning and visual design directions
- [`QA_REPORT.md`](./QA_REPORT.md) — Automated build, route, link, math, feed, and preview verification results
- [`AGENTS.md`](./AGENTS.md) — Repository engineering rules and migration invariants
=======
This is the repository for my personal website. I have coded this site myself, using a template I created using my other GitHub account, naturalproblemsolver, and many code snippets from various Jekyll projects. 
>>>>>>> origin/master
