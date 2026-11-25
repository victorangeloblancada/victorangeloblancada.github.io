---
layout: post
title: "Migrating a Decade-Old Jekyll Publication to Astro"
description: "Engineering notes on preserving historical date-based permalinks, protecting currency dollar signs under KaTeX, and replacing Jekyll plugins with build-time static tooling."
category: blog
tags:
  - engineering
  - web-development
  - math
  - katex
date: 2026-11-24
draft: true
---

Migrating nearly a decade of technical essays, mathematical writing, and embedded browser experiments from a custom Jekyll site to Astro requires preserving historical URLs and math rendering behavior without rewriting the archive.

## Preserving Historical Permalinks Across Static Generators

In Jekyll's default `date` permalink convention (`/:categories/:year/:month/:day/:title:output_ext`), the rendered URL derives from front-matter `date`, even if a file was named with a different draft date prefix on disk. Across this archive, four historical posts carry mismatched filename versus front-matter dates (`2019-10-15`, `2021-11-10`, `2024-03-02`, and `2024-05-31`), and `2020-11-30-nanogenmo-2020-.md` strips a trailing hyphen during Jekyll slugification.

By extracting route parameters directly from front-matter `date` and preserved slug overrides in `src/pages/blog/[year]/[month]/[day]/[slug].astro`, alongside a post-build file mapper for legacy `.html` paths, every existing link remains intact without client-side redirects or link rot.

## Why Financial Prose Breaks Naive Single-Dollar Math Parsers

When migrating technical and business writing from client-side MathJax 2.7.5 to static build-time KaTeX (`remark-math` + `rehype-katex`), a subtle parser hazard surfaces whenever a single article contains two dollar signs—for example, *"GPU sticker prices topping `$30,000` to `$40,000`"* or *"`$400MM` network expansion"*.

With default single-dollar inline math enabled, Markdown parsers treat everything between two currency symbols as LaTeX math mode, stripping spaces and italicizing prose.

Configuring `remark-math` with `{ singleDollarTextMath: false }` enforces `$$...$$` as the explicit math delimiter, leaving prose currency untouched while supporting both inline and display KaTeX rendering—paired with a build-time AsciiMath translator for the 79 backtick-delimited formulas in `2022-03-20-finance-from-first-principles.md`.
