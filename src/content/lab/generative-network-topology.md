---
title: "Generative Network Topology Visualizer"
description: "Restrained node-link particle simulation exploring proximity graphs, pointer field coupling, and performance-bounded Canvas rendering with reduced-motion fallback."
date: 2026-11-22
tags:
  - network
  - creative-coding
  - visualization
  - optimization
technologies:
  - TypeScript
  - Canvas 2D
  - ResizeObserver
status: interactive
componentId: generative-network
featured: true
order: 2
---

## Design & Architecture Notes

The same spatial proximity graph appears across the homepage hero in ambient mode and here in full interactive parameter mode.

- **Bounded Complexity:** Node counts are capped sensibly for device viewport size, using squared-distance comparisons ($d^2 < r^2$) to avoid square-root overhead in inner edge loops.
- **Theme-Aware Canvas:** Edge and vertex colors are sampled dynamically from CSS custom properties (`--accent`, `--ink-muted`, `--border-strong`) when rendering, updating cleanly whenever the light/dark theme toggles.
- **Progressive Enhancement:** Under `prefers-reduced-motion: reduce`, the engine renders a crisp static equilibrium topology frame; when JavaScript is unavailable, a lightweight inline SVG graph renders in its place.
