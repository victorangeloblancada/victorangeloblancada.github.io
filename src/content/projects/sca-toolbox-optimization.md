---
title: "SCA Toolbox — Self-Service Network Optimization Suite"
description: "Containerized self-service Python web application providing geocoding, Center of Gravity analysis, Traveling Salesman routing, and automated mapping to global solution design teams."
date: 2023-09-01
period: "Apr 2019 – Present"
role: "Analytics Platform Architect"
organization: "Maersk Contract Logistics & LF Logistics"
categories:
  - Operations Research
  - Web Platforms
tags:
  - python
  - optimization
  - logistics
  - dash
technologies:
  - Python
  - Plotly Dash
  - K-Means & CoG
  - TSP Optimization
  - Akamai / Containers
featuredImage: /assets/images/truck.jpg
status: production
impactMetric: "2 months → 2 weeks ML delivery cycle"
featured: true
order: 4
---

## Overview

Supply chain engineers in regional offices routinely run facility location, network design, and route optimization studies for customer pitches and contract renewals—work that previously required bespoke scripts and slow analyst handoffs.

I built the **Supply Chain Analytics (SCA) Portal** and **SCA Toolbox**, a containerized self-service Python web platform hosted on Akamai that places quantitative optimization tools directly into the hands of country-level solution design teams.

## Capabilities & MLOps Impact

- **Core Optimization Modules:** Geocoding, weighted Center-of-Gravity facility location (see the [K-Means Center of Gravity post](/blog/2020/09/07/center-of-gravity-analysis.html)), Traveling Salesman route optimization, and automated geospatial cartography.
- **Global SCND Delivery:** Supported **20+ global supply chain network design** studies for brands including Mars, IKEA, Nike, Crocs, ON Running, Levi's, Lululemon, Carter's, PUMA, and PASCAL.
- **75% Faster Delivery Cycles:** Standardized modular statistical libraries, automated retraining pipelines, and Dash GUIs, compressing ML application build cycles from **two months to two weeks**.
