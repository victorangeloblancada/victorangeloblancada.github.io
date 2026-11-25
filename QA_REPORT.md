# Quality Assurance Report

**Date:** 2026-11-25  
**Branch:** `modernization/astro-migration`  
**Environment:** Windows local build (`Node v27.0.0-alpha.0.0.0`, `astro@7.4.13`, `pagefind@1.6.0`), Playwright Chromium (`chromium_headless_shell-1228`); CI targets `ubuntu-latest` with Node `22` LTS.  
**Scope:** Clean Editorial + Laboratory dual-identity refactor (`Newsreader` + `JetBrains Mono`), scroll-boundary shake fix, GDPR opt-in `CookieBanner`, GA4/GSC engagement & SEO enhancements, dev-only `/design-system` preview, and full end-to-end verification.

---

## 1. Automated Verification Summary (Post-Final Edit)

| Check | Command / Harness | Outcome | Measured Result |
| --- | --- | --- | --- |
| **Type & Astro Diagnostics** | `npm run check` (`astro check`) | **PASS** | `52 files` checked: **`0` errors**, **`0` warnings**, **`2` hints** (`ts 6385/6387` deprecation hints on fallback `document.execCommand('copy')` in `ArticleLayout.astro`). |
| **Production Build + Search Index** | `npm run build` (`PUBLIC_ENABLE_ANALYTICS` unset/`false`) | **PASS** | Built **`214` static routes** in `6.63s`; Pagefind `v1.6.0` scanned **`216` HTML files**, indexed **`57` pages**, **`7,840` words**, and **`3` filters** (`type`, `category`, `tag`) in `1.119s`. |
| **Static Build Audit (`dist/`)** | `verify_dist.py` across `dist/` | **PASS** | **`9,001`** internal links & asset paths checked with **`0` broken**; **`46`** legacy `/blog/YYYY/MM/DD/*.html` files (`44` published + `2` `legacyUnlisted` `noindex` drafts); new `2026-11-24` draft, `/design-system`, `/notes/`, and GTM/cookie banner excluded from default `dist/`; `feed.xml` valid Atom 1.0 (**`20`** entries); `sitemap-0.xml` **`184`** valid URLs. |
| **GDPR Consent E2E (`PUBLIC_ENABLE_ANALYTICS=true`)** | `e2e_verify.mjs gdpr` on `astro preview` | **PASS** | **`3 / 3` passed**: banner visible with `consentKey=null` & `0` `googletagmanager.com` requests pre-consent; **Decline** persists `'denied'` & `0` network hits; Footer `Cookie Preferences` reopens banner & **Accept** stores `'granted'` & loads GTM/GA scripts (`scriptsCount=2`). |
| **Dev Design System Preview** | `e2e_verify.mjs dev` (`astro dev`) | **PASS** | **`2 / 2` passed**: `/design-system` renders side-by-side Editorial (`rgb(243, 240, 231)`) & Laboratory (`rgb(241, 240, 233)`) panels with `0` console/page errors. |
| **Main Production Preview E2E** | `e2e_verify.mjs main` (`1440×900` & `375×812`) | **PASS** | **`11 / 11` passed** with **`0` console errors** and **`0` uncaught `pageerror`s**. |

---

## 2. Visual Identity, Contrast & Scroll Stability Measurements

- **Two-Font System:** Computed `getComputedStyle` verified `Newsreader` (`300` hero `h1`, `400` body, `500` `.nav-link`) and `JetBrains Mono` (`400`–`500` `.mono-meta` & code blocks); Google Fonts URL loads only `JetBrains Mono` and `Newsreader` (removed `Instrument Serif`, `Jost`, `Space Grotesk`).
- **Editorial <-> Laboratory ClientRouter & Theme Persistence:** Verified toggling `light -> dark` persists across ClientRouter navigation (`/` Editorial `#252622` -> `/lab/` Laboratory `#101d2b` -> Back `/` Editorial `#252622` with `<body data-identity>` + `astro:after-swap` sync).
- **Rendered WCAG AA Contrast (`>= 4.5:1` across all 4 identity/mode variants):**
  - *Editorial Light:* `h1` `12.54:1`, `body` `5.33:1`, `link` `5.14:1`, `muted` `5.12:1`.
  - *Editorial Dark:* `h1` `13.01:1`, `body` `8.44:1`, `link` `7.37:1`, `muted` `6.20:1`.
  - *Laboratory Light:* `h1` `11.36:1`, `body` `4.93:1`, `link` `4.99:1`, `muted` `4.98:1`.
  - *Laboratory Dark:* `h1` `14.71:1`, `body` `8.69:1`, `link` `5.74:1`, `muted` `6.79:1`.
- **Bottom-Scroll Stability & Sticky Desktop ToC:** Sampled 6 intervals at bottom scroll (`y=11348` / `sh=12248` on `power-bi-arch-not-macos.html` and `y=16320` / `sh=17220` on `lean-six-sigma-ai.html`): **`yDelta = 0`**, **`shDelta = 0`**, mid-article `.toc-sticky` pinned (`top=88`), bottom progress `100%` with final headings active (`viii`, `part-vi-what-endures`).
- **Interactive, Mobile & Asset Checks:** Search modal `Escape` & focus restore, `/search/` category filter, ML Scaling Law calculator (`72.5 B -> 95.6 B`) under `ClientRouter`, copy-code (`Copy -> Copied`), gallery lightbox, `ClusteringExplorer` (`iter=1`), `0` horizontal overflows at `375px` across `7` routes, and ordinary article JS payload limited to the Astro `ClientRouter` runtime chunk.

---

## 3. Scope Notes

- **Windows NTFS vs. Linux CI:** `/blog/tag/Bayes/` and `/blog/tag/bayes/` collide on Windows; `.github/workflows/deploy.yml` verifies both on `ubuntu-latest`.
- **Remote Checks:** GitHub Actions Ubuntu CI run and Lighthouse CLI telemetry await push/PR execution. No production deployment was run.
