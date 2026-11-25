
# Repository Instructions

## Project
Personal portfolio and interactive technical publication.

## Architecture
- Astro static site generator.
- GitHub Pages hosting.
- Markdown and MDX content.
- Vanilla JavaScript by default.
- Modern CSS.
- D3.js for data visualization.
- GSAP and Three.js only when justified.
- Pagefind for search.

## Critical preservation requirements
- Preserve historical blog content.
- Preserve original article URLs.
- Preserve historical assets.
- Preserve existing interactive demonstrations.
- Preserve RSS functionality and its URL.
- Do not silently remove existing site functionality.

## Engineering principles
- Static rendering by default.
- Progressive enhancement.
- Accessible and responsive interfaces.
- Minimal JavaScript on ordinary articles.
- Avoid unnecessary dependencies.
- Prefer reusable components.
- Document architectural decisions.
- Use current official documentation.

## Deployment
- GitHub Pages.
- GitHub Actions.
- Never deploy production without explicit approval.

## Before completing a task
- Run type checks (`npm run check`).
- Run the production build (`npm run build` — executes `astro build && npx pagefind --site dist`).
- Test affected functionality via `npm run preview`.
- Report any remaining issues.

---

## Standard Commands
- `npm run dev` — Local Astro dev server (`http://localhost:4321`)
- `npm run check` — Astro & TypeScript diagnostics (`astro check`)
- `npm run build` — Production build (`dist/`) + Pagefind static search index (`dist/pagefind/`)
- `npm run preview` — Local preview of production `dist/` output
- Analytics (`GTM-5S5WB7M`, `G-ERJECQ081H`) are gated in `src/config/site.ts` via `PUBLIC_ENABLE_ANALYTICS=true` (disabled by default).

---

## Migration Reference Documents (Stages 1 & 2)
- `MIGRATION.md` — Complete Jekyll audit, risk register, Astro target architecture, ADRs, and open decisions.
- `FEATURE_PARITY.md` — Plugin, layout, include, and site-wide feature parity matrix.
- `MIGRATION_INVENTORY.csv` — Verified URL and metadata inventory for all 46 posts, 5 pages, 8 root/generated endpoints, and 107 tag routes.
- `DESIGN_BRIEF.md` — Editorial positioning, three visual design directions, and homepage blueprint.

## Critical Migration Invariants
1. **Front-matter `date` governs post URLs:** Four historical posts have mismatched filename vs. front-matter dates (`2019-10-15`, `2021-11-10`, `2024-03-02`, `2024-05-31`). Always derive `/blog/YYYY/MM/DD/<slug>.html` from front-matter `date`, strip trailing `-` on `nanogenmo-2020-.md`, and preserve `democritization-of-expertise`.
2. **KaTeX math delimiter safety:** Configure `remark-math` with `{ singleDollarTextMath: false }` so prose currency (`$400MM`, `$30,000`) is never parsed as math; strip legacy MathJax 2.7.5 `<script>` tags and support AsciiMath backtick formulas in `2022-03-20-finance-from-first-principles.md`.
3. **Jekyll Liquid compatibility:** Resolve `{% post_url %}`, `{% highlight %}`, `{% raw %}`, and Kramdown `{:width=...}` at build time rather than stripping or breaking historical code.
4. **Node runtime:** Target **Node 22 LTS** in GitHub Actions (`.github/workflows/deploy.yml`).
