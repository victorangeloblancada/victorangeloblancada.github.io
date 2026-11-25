# Design Brief & Visual Identity Directions

**Subject:** Personal Portfolio, Technical Publication & Interactive Research Laboratory for **Victor Angelo Blancada**  
**Source Facts:** Grounded strictly in `_pages/about.md`, `_pages/ai-developer.md`, `_pages/data-scientist.md`, `_pages/strategy-consultant.md`, `index.html`, `_posts/`, and `_sass/main.scss`.

---

## 1. Editorial Positioning & Identity

Victor Angelo Blancada works at the intersection of **software engineering, data science, artificial intelligence, operations research, and strategy consulting** — currently serving as **Global Head of Supply Chain Analytics at Maersk Contract Logistics** (and previously in analytics leadership at LF Logistics, Publicis Worldwide, IPG Mediabrands, and strategy consulting at Mitchell Madison Group; BS Industrial Engineering *summa cum laude*, UP Diliman; MIT CTL Executive Training).

**Core Positioning Statement (draft):**  
> *"Building at the intersection of code, data, and intelligence."*

**Four Integrated Site Experiences:**
1. **Personal Developer Portfolio:** Substantial case studies of production systems (Mimir GenAI RFP Agent, Groveport 1.2M sq ft Digital Twin & Warehouse AI, 125+ site GHG Emissions Reporting Platform, SCA Toolbox, $400MM Telecom Network Expansion, APAC Media Portfolio Optimization).
2. **Editorial Technical Publication:** 44+ long-form essays and tutorials spanning interpretability (Jacobian Lens), LLM systems (Gemma 4 prompt ABI, Roofline communication bottlenecks, Test-Time Training, AutoResearch, Scaling Laws), Operations Research, Python engineering, and creative NLP (NaNoGenMo).
3. **Interactive Data Visualization Laboratory:** Browser-based algorithmic explorations, starting with an Interactive Clustering Explorer and a Generative Network Visualization, alongside migrated tools (Lifecycle Compute Optimizer, Percentage Calculator).
4. **Creative Technology Showcase:** AI art/neural style transfer gallery, creative coding experiments, and data storytelling.

**Design Guardrails:**
- **Prefer:** Strong editorial typography, generous negative space, crisp 1px rules/grids, one distinctive high-contrast accent color per theme, careful monospace metadata, restrained purposeful motion, subtle theme-aware surfaces.
- **Avoid:** Generic SaaS gradients, floating decorative blobs, heavy glassmorphism, fake terminal windows, scroll hijacking, gratuitous parallax, and filler illustrations.

---

## 2. Three Visual Design Directions

### Direction A — Editorial Monograph (*"The Quantitative Quarterly"*)
*Inspired by* The Pudding, Stripe Press, *and classic mathematical monographs — evolving the site's original Merriweather + Oswald + `#084887` / `#F58A07` roots into mature editorial rigor.*

- **Typography Pairing:**
  - Display / Headings: **Newsreader** or **Instrument Serif** (editorial gravitas, crisp italics)
  - Body Prose: **Source Serif 4** or preserved **Merriweather** (high x-height, comfortable long-form reading)
  - UI & Metadata: **Inter** / **IBM Plex Sans** + **IBM Plex Mono** (tabular numerals for dates, reading time, equations)
- **Color Palette:**
  - *Light:* Paper `#FAF8F5`, Surface `#F2EFE9`, Ink `#191716`, Muted `#5E5852`, Border `#E2DDD5`, Primary Accent **Prussian Cobalt `#1D4ED8`** (echoing legacy `#084887`), Secondary Signal `#C2410C`
  - *Dark:* Obsidian Ink `#111110`, Elevated `#1A1918`, Ink `#ECE9E4`, Muted `#A09A92`, Border `#2C2A27`, Accent **Sky Cobalt `#60A5FA`**
- **Layout & Motion Character:**
  - Asymmetric 12-column editorial grid; sticky left margin metadata / right-rail TOC on desktop articles; generous `70ch` prose column.
  - Motion feels like typeset ink settling: subtle rule-line draws, gentle opacity fades (`200ms–320ms`), calm generative constellation behind the hero headline.
- **Trade-offs:**
  - *Pros:* Elevates long-form essays (4,500+ word Lean Six Sigma & Scaling Laws essays feel like journal publications); feels timeless and honors the original 2017–2020 serif aesthetic.
  - *Cons:* Slightly more literary than engineering-tool-centric; interactive lab widgets need careful container framing so they don't feel detached from the paper aesthetic.

---

### Direction B — Precision Instrument (*"Linear / Laboratory"*) *(Recommended for Software + AI Lab Balance)*
*Inspired by* Linear's restraint *and* Observable's computational notebooks — *clean, architectural, high-signal, with effortless transitions between reading prose and manipulating live models.*

- **Typography Pairing:**
  - Display / Headings: **Space Grotesk** or **Plus Jakarta Sans** (tight tracking `-0.03em`, geometric clarity)
  - Body Prose: **Inter** (clean UI/technical clarity) or **Newsreader** selectively in long-form essay mode
  - Code / Data / Telemetry: **JetBrains Mono** or **Fira Code** (ligatures off for prose clarity, tabular numbers on everywhere)
- **Color Palette:**
  - *Light:* Alabaster `#FAFAFA`, Surface `#F4F4F5`, Ink `#09090B`, Muted `#52525B`, Hairline `#E4E4E7`, Accent **Signal Amber `#D97706`** (modernizing the site's original `#F58A07` orange without glare)
  - *Dark:* Carbon `#09090B`, Panel `#121215`, Ink `#F4F4F5`, Muted `#A1A1AA`, Hairline `#27272A`, Accent **Electric Amber `#F59E0B`**
- **Layout & Motion Character:**
  - Structural `1px` hairline grid cells framing Selected Work, Lab Experiments, and Archive index rows; crisp tabular project index with hover previews.
  - Motion is mechanical and snappy (`150ms–240ms cubic-bezier(0.2, 0, 0, 1)`), cursor-responsive network graph in the hero, smooth View Transitions between index and article.
- **Trade-offs:**
  - *Pros:* Seamless unity between portfolio case studies, code, interactive K-Means/Network labs, and `Cmd+K` Pagefind command palette; maximizes signal-to-noise ratio.
  - *Cons:* Sans-serif long-form body requires careful line-height (`1.72`) and width (`66ch`) tuning to stay warm and readable over 3,000+ words (solvable by using a refined serif or humanist sans for `.prose`).

---

### Direction C — Cartographic Studio (*"Systems & Networks"*)
*Inspired by* Stripe's technical diagrams *and* Operations Research network graphs — *structured around spatial coordinates, routing topologies, and supply-chain geometry.*

- **Typography Pairing:**
  - Display / Headings: **Sora** or **Archivo** (architectural, wide proportions)
  - Body Prose: **Source Serif 4** or **Literata** (warm editorial counterweight)
  - Metadata / Labels: **IBM Plex Mono** (coordinate ticks, figure captions `FIG. 01`, status tags)
- **Color Palette:**
  - *Light:* Blueprint Ivory `#F8FAFC`, Surface `#EFF4F8`, Ink `#0F172A`, Muted `#475569`, Grid Rule `#CBD5E1`, Accent **Analytical Teal `#0F766E`**
  - *Dark:* Deep Maritime `#070D14`, Surface `#0E1724`, Ink `#E2E8F0`, Muted `#94A3B8`, Grid Rule `#1E293B`, Accent **Phosphor Cyan-Teal `#2DD4BF`**
- **Layout & Motion Character:**
  - Subtle coordinate-tick dividers and numbered section markers (`01 // SELECTED WORK`, `02 // WRITING`, `03 // LABORATORY`); graph-edge hover states on project rows.
  - Motion evokes routing & optimization: node-link path highlights, GSAP/CSS-driven diagram reveals, smooth transitions.
- **Trade-offs:**
  - *Pros:* Directly reflects Victor's deep operations research, supply chain network design, and graph optimization domain expertise.
  - *Cons:* Risk of looking overly "dashboard-like" if grid annotations aren't restrained; requires strict visual discipline to remain editorial rather than technical-docs-heavy.

---

## 3. Homepage Structure & Section Blueprint

1. **Top Bar & Command Navigation:** Minimal brand mark (`V. A. Blancada`), 4–5 clear routes (`Work`, `Writing`, `Lab`, `About`), `Search (Cmd+K)` pill button, and Light/Dark theme toggle. Mobile uses an accessible bottom/compact drawer bar preserving ergonomic thumb reach from the original site.
2. **Hero:** Strong editorial H1 positioning statement (*"Building at the intersection of code, data, and intelligence."*), concise 2-line bio anchor, primary links (`Explore Work`, `Read Archive`, `Download CV`), paired with **Demonstration B (Generative Network Visualization)** running quietly alongside/behind with `prefers-reduced-motion` & static SVG fallback.
3. **Selected Work (Case Studies):** Curated 4–6 flagship projects (Mimir GenAI Agent, Groveport Digital Twin & Warehouse AI, Global GHG Emissions Platform, SCA Toolbox, Telecom $400MM Network Expansion, APAC Media Portfolio Optimization) in an interactive index + editorial case study view with concrete metrics and technologies.
4. **Featured Writing:** Highlights the 3 existing `featured` posts (`democritization-of-expertise`, `what-even-is-an-agent`, `roofline-analysis-communication-bottleneck`) plus recent 2026 essays, alongside a direct browse link into the full 2017–2026 archive (`/blog/`, `/blog.html`, year/tag filters).
5. **Laboratory:** Showcases **Demonstration A (Interactive K-Means Clustering Explorer)** and **Demonstration B (Generative Network Topology)** plus migrated interactive tools (`Lifecycle Compute Optimizer`, `Percentage Calculator`).
6. **About & Credentials Summary:** Concise narrative linking 2010s hand-coded web craftsmanship → strategy consulting (Mitchell Madison Group) → marketing analytics/ML (IPG Mediabrands, Publicis) → global supply chain analytics & GenAI leadership (LF Logistics, Maersk; UP Diliman *summa cum laude*, MIT CTL), plus Abakcus recognition and SCMP publication.
7. **Contact & Footer:** Clean links to LinkedIn (`geloblancada`), GitHub (`victorangeloblancada`), Email (`naturalproblemsolver@gmail.com`), Résumé downloads (`/pages/resume-downloads.html`), and RSS (`/feed.xml`).

---

## 4. Accessibility, Responsiveness & Performance Standards

- **Breakpoints:** Mobile (`<640px`), Tablet (`640px–1024px`), Desktop (`>1024px`) — purpose-built layouts (single-column stacked drawer/cards on mobile; sticky TOC rail & 2-column lab controls on desktop).
- **Contrast & Keyboard:** WCAG AA minimum (`>=4.5:1` text, `>=3:1` UI/graphics), visible `:focus-visible` outlines, full Tab/Enter/Esc control on search modal, theme switch, clustering sliders, and image lightbox.
- **Reduced Motion:** `@media (prefers-reduced-motion: reduce)` disables View Transitions, GSAP timelines, and network particle animation (rendering static equilibrium snapshot).
- **Performance Budget:** Zero client-side JS frameworks; ordinary blog posts ship minimal JS (theme + copy-code + search trigger); D3/Three/GSAP split into per-demo dynamic chunks only loaded on pages that mount them.

---

## 5. Finalized Design System (Editorial + Laboratory Dual Identity)

The visual system pairs two core font families with two harmonised theme identities, each supporting both light and dark modes via semantic tokens in `src/styles/tokens.css`:

- **Typography (`BaseHead.astro`, `tokens.css`):** Two Google Fonts families only (`display=swap`):
  - **`Newsreader`** (weights `300`–`600` + italic): primary Editorial typeface for Hero `300`, page/article headings `400`, body prose `400` (`line-height: 1.72`), navigation `500`, and strong emphasis `600`.
  - **`JetBrains Mono`** (weights `400`, `500`): code blocks, inline code, dates, tags, metadata, and technical labels.
- **Two Harmonised Identities (`data-identity="editorial" | "laboratory"`):**
  - **Editorial — Warm Swiss / Monocle (default site theme):** Light background `#F3F0E7` / surface `#E7E4D9` with charcoal-ink hierarchy and restrained grey-green links / terracotta accents; Dark `#252622` / `#33352F` (`#F0EDE4` heading, `#C3C1B7` body, `#A6B9AD` links, `#D48A6C` / `#D2B77B` accents).
  - **Laboratory — R4 / Japanese Digital Culture (`/lab/` & interactive components):** Deep blue-grey dark surfaces `#101D2B` / `#1B3040` (`#80B9D0` links, `#E47758` / `#D8B56F` accents) and warm off-white light surfaces `#F1F0E9` / `#E3E7E3`. Light-mode muted/link/accent tokens are hue-preserved with `>= 4.55:1` WCAG AA contrast verification.
- **Data-Driven Engagement Updates (GA4 + GSC 2026-08-24 to 2026-11-24):** Above-the-fold homepage credential summary and direct profile routes (targeting `/` `0.77s` avg engagement vs `/pages/about.html` `15.0s`), search-intent `description` frontmatter for top GSC impression articles (`thefuzz`, MS Teams crop, command-line GIFs, Hugging Face intrusion), collapsible mobile ToC, and article-footer Author Bridge card.
- **Dev Preview & Privacy:** Development-only `/design-system` comparison page (`src/pages/[...devDesignSystem].astro`, omitted in production builds) and strictly opt-in GDPR `CookieBanner.astro` when `PUBLIC_ENABLE_ANALYTICS=true`.
