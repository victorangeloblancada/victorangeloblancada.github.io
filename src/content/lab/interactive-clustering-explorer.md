---
title: "Interactive K-Means Clustering Explorer"
description: "Browser-based two-dimensional K-Means laboratory comparing random and K-Means++ initialization, step-by-step centroid convergence, and within-cluster sum of squares (WCSS)."
date: 2026-11-22
tags:
  - clustering
  - kmeans
  - machine-learning
  - data-science
technologies:
  - TypeScript
  - D3.js
  - SVG
  - Canvas
status: interactive
componentId: clustering-explorer
featured: true
order: 1
---

## How the Explorer Works

K-Means partitions $$n$$ observations in $$\mathbb{R}^2$$ into $$k$$ clusters by alternating between two steps until assignments stabilize:

1. **Assignment Step:** Each point $$x_i$$ joins the nearest centroid $$\mu_j$$ under Euclidean distance $$\lVert x_i - \mu_j \rVert_2^2$$.
2. **Update Step:** Each centroid $$\mu_j$$ moves to the arithmetic mean of all points currently assigned to cluster $$j$$.

### Why Initialization Matters

Standard **Random** initialization places initial centroids uniformly across existing data points and can become trapped in poor local optima (especially when multiple centroids start inside the same dense cluster). **K-Means++** selects initial centroids sequentially with probability proportional to $$D(x)^2$$—the squared distance to the closest already-chosen centroid—dramatically improving convergence stability and lowering final within-cluster sum of squares (WCSS).

### Experiments to Try

- Switch between **Gaussian Blobs** and **Two Moons** to observe where Euclidean centroid geometry succeeds versus where non-convex manifolds break linear Voronoi boundaries.
- Compare **Random** vs. **K-Means++** on the **Anisotropic** preset at $$k = 4$$.
- Tap or click directly on the plot canvas to inject custom outlier points and step through centroid drift.
