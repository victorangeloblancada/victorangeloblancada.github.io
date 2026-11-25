import { line as d3Line, scaleLinear } from 'd3';
import { emitLabEvent } from '../components/interactive/eventBus';

export type DatasetPreset = 'blobs' | 'moons' | 'anisotropic' | 'uniform';
export type InitMethod = 'kmeans++' | 'random';

interface Point {
  x: number;
  y: number;
  cluster: number;
}

interface Centroid {
  x: number;
  y: number;
  trail: Array<{ x: number; y: number }>;
}

const FALLBACK_COLORS = [
  '#d97706',
  '#0284c7',
  '#059669',
  '#7c3aed',
  '#e11d48',
  '#0d9488',
  '#4f46e5',
  '#ca8a04',
];

function gaussianPair(): [number, number] {
  const u = Math.max(1e-7, Math.random());
  const v = Math.random();
  const r = Math.sqrt(-2 * Math.log(u));
  const theta = 2 * Math.PI * v;
  return [r * Math.cos(theta), r * Math.sin(theta)];
}

function clamp01(val: number): number {
  return Math.max(0.04, Math.min(0.96, val));
}

function generateDataset(preset: DatasetPreset, count = 180): Point[] {
  const pts: Point[] = [];
  if (preset === 'blobs') {
    const centers = [
      [0.24, 0.28],
      [0.75, 0.26],
      [0.32, 0.75],
      [0.76, 0.72],
    ];
    for (let i = 0; i < count; i++) {
      const [cx, cy] = centers[i % centers.length];
      const [gx, gy] = gaussianPair();
      pts.push({
        x: clamp01(cx + gx * 0.075),
        y: clamp01(cy + gy * 0.075),
        cluster: -1,
      });
    }
  } else if (preset === 'moons') {
    const half = Math.floor(count / 2);
    for (let i = 0; i < count; i++) {
      const isSecond = i >= half;
      const t = (isSecond ? (i - half) / Math.max(1, count - half) : i / Math.max(1, half)) * Math.PI;
      const [nx, ny] = gaussianPair();
      if (!isSecond) {
        pts.push({
          x: clamp01(0.36 + Math.cos(t) * 0.24 + nx * 0.028),
          y: clamp01(0.58 - Math.sin(t) * 0.28 + ny * 0.028),
          cluster: -1,
        });
      } else {
        pts.push({
          x: clamp01(0.62 - Math.cos(t) * 0.24 + nx * 0.028),
          y: clamp01(0.42 + Math.sin(t) * 0.28 + ny * 0.028),
          cluster: -1,
        });
      }
    }
  } else if (preset === 'anisotropic') {
    const centers = [
      [0.28, 0.3],
      [0.52, 0.5],
      [0.74, 0.7],
    ];
    for (let i = 0; i < count; i++) {
      const [cx, cy] = centers[i % centers.length];
      const [gx, gy] = gaussianPair();
      // Sheared diagonal elongation
      const sx = gx * 0.12 - gy * 0.022;
      const sy = gx * 0.08 + gy * 0.026;
      pts.push({
        x: clamp01(cx + sx),
        y: clamp01(cy + sy),
        cluster: -1,
      });
    }
  } else {
    for (let i = 0; i < count; i++) {
      pts.push({
        x: 0.06 + Math.random() * 0.88,
        y: 0.06 + Math.random() * 0.88,
        cluster: -1,
      });
    }
  }
  return pts;
}

function sqDist(a: { x: number; y: number }, b: { x: number; y: number }): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return dx * dx + dy * dy;
}

function initCentroids(points: Point[], k: number, method: InitMethod): Centroid[] {
  if (points.length === 0) return [];
  const chosen: Point[] = [];
  const used = new Set<number>();

  if (method === 'random') {
    while (chosen.length < Math.min(k, points.length)) {
      const idx = Math.floor(Math.random() * points.length);
      if (!used.has(idx)) {
        used.add(idx);
        chosen.push(points[idx]);
      }
    }
  } else {
    // K-Means++ probabilistic farthest-first initialization
    const firstIdx = Math.floor(Math.random() * points.length);
    used.add(firstIdx);
    chosen.push(points[firstIdx]);

    while (chosen.length < Math.min(k, points.length)) {
      const dists = points.map((p, idx) => {
        if (used.has(idx)) return 0;
        let minD = Infinity;
        for (const c of chosen) {
          const d = sqDist(p, c);
          if (d < minD) minD = d;
        }
        return minD;
      });
      const total = dists.reduce((a, b) => a + b, 0);
      if (total <= 0) {
        const fallback = points.findIndex((_, idx) => !used.has(idx));
        if (fallback === -1) break;
        used.add(fallback);
        chosen.push(points[fallback]);
        continue;
      }
      let target = Math.random() * total;
      let picked = points.length - 1;
      for (let i = 0; i < dists.length; i++) {
        target -= dists[i];
        if (target <= 0) {
          picked = i;
          break;
        }
      }
      used.add(picked);
      chosen.push(points[picked]);
    }
  }

  return chosen.map((p) => ({
    x: p.x,
    y: p.y,
    trail: [{ x: p.x, y: p.y }],
  }));
}

export function mountClusteringExplorer(root: HTMLElement): () => void {
  const canvas = root.querySelector<HTMLCanvasElement>('[data-clustering-canvas]');
  const sparkSvg = root.querySelector<SVGSVGElement>('[data-wcss-sparkline]');
  const presetSelect = root.querySelector<HTMLSelectElement>('[data-preset-select]');
  const kSlider = root.querySelector<HTMLInputElement>('[data-k-slider]');
  const kOutput = root.querySelector<HTMLElement>('[data-k-value]');
  const initSelect = root.querySelector<HTMLSelectElement>('[data-init-select]');
  const stepBtn = root.querySelector<HTMLButtonElement>('[data-step-btn]');
  const playBtn = root.querySelector<HTMLButtonElement>('[data-play-btn]');
  const resetBtn = root.querySelector<HTMLButtonElement>('[data-reset-btn]');
  const regenBtn = root.querySelector<HTMLButtonElement>('[data-regen-btn]');

  const iterEl = root.querySelector<HTMLElement>('[data-stat-iter]');
  const wcssEl = root.querySelector<HTMLElement>('[data-stat-wcss]');
  const movedEl = root.querySelector<HTMLElement>('[data-stat-moved]');
  const phaseEl = root.querySelector<HTMLElement>('[data-stat-phase]');

  if (!canvas || !sparkSvg) return () => {};
  const ctx = canvas.getContext('2d');
  if (!ctx) return () => {};

  const canvasEl: HTMLCanvasElement = canvas;
  const sparkEl: SVGSVGElement = sparkSvg;
  const context: CanvasRenderingContext2D = ctx;

  const reducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let preset: DatasetPreset = (presetSelect?.value as DatasetPreset) || 'blobs';
  let k = Number(kSlider?.value || 4);
  let initMethod: InitMethod = (initSelect?.value as InitMethod) || 'kmeans++';

  let points: Point[] = generateDataset(preset);
  let centroids: Centroid[] = [];
  let iteration = 0;
  let wcssHistory: number[] = [];
  let lastReassigned = 0;
  let phase: 'ready' | 'assigned' | 'updated' | 'converged' = 'ready';
  let playing = false;
  let timerId: number | null = null;
  let width = 600;
  let height = 420;

  function getPalette(): { bg: string; grid: string; ink: string; viz: string[] } {
    const cs = getComputedStyle(document.documentElement);
    const bg = cs.getPropertyValue('--bg-elevated').trim() || '#ffffff';
    const grid = cs.getPropertyValue('--border-subtle').trim() || '#e4e4e7';
    const ink = cs.getPropertyValue('--ink-primary').trim() || '#09090b';
    const viz = FALLBACK_COLORS.map(
      (fb, idx) => cs.getPropertyValue(`--viz-${idx + 1}`).trim() || fb,
    );
    return { bg, grid, ink, viz };
  }

  function assignPoints(): number {
    let changed = 0;
    for (const pt of points) {
      let bestIdx = 0;
      let bestDist = Infinity;
      for (let j = 0; j < centroids.length; j++) {
        const d = sqDist(pt, centroids[j]);
        if (d < bestDist) {
          bestDist = d;
          bestIdx = j;
        }
      }
      if (pt.cluster !== bestIdx) {
        changed++;
        pt.cluster = bestIdx;
      }
    }
    return changed;
  }

  function computeWcss(): number {
    let total = 0;
    for (const pt of points) {
      if (pt.cluster >= 0 && centroids[pt.cluster]) {
        total += sqDist(pt, centroids[pt.cluster]);
      }
    }
    return total;
  }

  function updateCentroids(): number {
    let maxShift = 0;
    for (let j = 0; j < centroids.length; j++) {
      let sx = 0;
      let sy = 0;
      let count = 0;
      for (const pt of points) {
        if (pt.cluster === j) {
          sx += pt.x;
          sy += pt.y;
          count++;
        }
      }
      if (count > 0) {
        const nx = sx / count;
        const ny = sy / count;
        const shift = Math.hypot(nx - centroids[j].x, ny - centroids[j].y);
        if (shift > maxShift) maxShift = shift;
        centroids[j].x = nx;
        centroids[j].y = ny;
        centroids[j].trail.push({ x: nx, y: ny });
      }
    }
    return maxShift;
  }

  function resetClustering(preservePoints = true): void {
    stopPlaying();
    if (!preservePoints) {
      points = generateDataset(preset);
    } else {
      for (const pt of points) pt.cluster = -1;
    }
    centroids = initCentroids(points, k, initMethod);
    lastReassigned = assignPoints();
    iteration = 0;
    wcssHistory = [computeWcss()];
    phase = 'ready';
    renderAll();
  }

  function stepOnce(): void {
    if (phase === 'converged') {
      stopPlaying();
      return;
    }
    const shift = updateCentroids();
    const changed = assignPoints();
    iteration++;
    lastReassigned = changed;
    wcssHistory.push(computeWcss());

    if (changed === 0 && shift < 1e-4) {
      phase = 'converged';
      stopPlaying();
    } else {
      phase = 'updated';
    }
    renderAll();
  }

  function stopPlaying(): void {
    playing = false;
    if (timerId !== null) {
      window.clearInterval(timerId);
      timerId = null;
    }
    if (playBtn) playBtn.textContent = 'Play';
  }

  function togglePlay(): void {
    if (playing) {
      stopPlaying();
      return;
    }
    if (phase === 'converged') {
      resetClustering(true);
    }
    playing = true;
    if (playBtn) playBtn.textContent = 'Pause';
    timerId = window.setInterval(stepOnce, reducedMotion ? 150 : 480);
  }

  function renderSparkline(vizColor: string): void {
    const sw = 240;
    const sh = 56;
    sparkEl.setAttribute('viewBox', `0 0 ${sw} ${sh}`);
    if (wcssHistory.length === 0) {
      sparkEl.innerHTML = '';
      return;
    }
    const xScale = scaleLinear()
      .domain([0, Math.max(1, wcssHistory.length - 1)])
      .range([6, sw - 6]);
    const maxW = Math.max(...wcssHistory, 1e-6);
    const minW = Math.min(...wcssHistory) * 0.85;
    const yScale = scaleLinear().domain([minW, maxW]).range([sh - 6, 6]);

    const pathGen = d3Line<number>()
      .x((_, i) => xScale(i))
      .y((d) => yScale(d));
    const dAttr = pathGen(wcssHistory) ?? '';
    const lastIdx = wcssHistory.length - 1;
    sparkEl.innerHTML = `
      <path d="${dAttr}" fill="none" stroke="${vizColor}" stroke-width="2" stroke-linejoin="round" />
      <circle cx="${xScale(lastIdx)}" cy="${yScale(wcssHistory[lastIdx])}" r="3.5" fill="${vizColor}" />
    `;
  }

  function renderCanvas(): void {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvasEl.width = Math.round(width * dpr);
    canvasEl.height = Math.round(height * dpr);
    context.setTransform(dpr, 0, 0, dpr, 0, 0);

    const { bg, grid, ink, viz } = getPalette();
    context.fillStyle = bg;
    context.fillRect(0, 0, width, height);

    // Subtle Voronoi territory tinting on coarse 6px grid for fast interactive shading
    if (centroids.length > 0) {
      const cell = 7;
      for (let py = 0; py < height; py += cell) {
        for (let px = 0; px < width; px += cell) {
          const nx = (px + cell * 0.5) / width;
          const ny = (py + cell * 0.5) / height;
          let best = 0;
          let bestD = Infinity;
          for (let j = 0; j < centroids.length; j++) {
            const dx = nx - centroids[j].x;
            const dy = ny - centroids[j].y;
            const d = dx * dx + dy * dy;
            if (d < bestD) {
              bestD = d;
              best = j;
            }
          }
          context.fillStyle = viz[best % viz.length];
          context.globalAlpha = 0.085;
          context.fillRect(px, py, cell, cell);
        }
      }
      context.globalAlpha = 1;
    }

    // Subtle hairline coordinate grid
    context.strokeStyle = grid;
    context.lineWidth = 1;
    for (let i = 1; i < 5; i++) {
      const gx = (width * i) / 5;
      const gy = (height * i) / 5;
      context.beginPath();
      context.moveTo(gx, 0);
      context.lineTo(gx, height);
      context.stroke();
      context.beginPath();
      context.moveTo(0, gy);
      context.lineTo(width, gy);
      context.stroke();
    }

    // Data points
    for (const pt of points) {
      const px = pt.x * width;
      const py = pt.y * height;
      const color = pt.cluster >= 0 ? viz[pt.cluster % viz.length] : ink;
      context.beginPath();
      context.arc(px, py, 4.2, 0, Math.PI * 2);
      context.fillStyle = color;
      context.globalAlpha = 0.88;
      context.fill();
      context.globalAlpha = 1;
      context.lineWidth = 1;
      context.strokeStyle = bg;
      context.stroke();
    }

    // Centroid trails & diamond markers
    centroids.forEach((c, idx) => {
      const color = viz[idx % viz.length];
      if (c.trail.length > 1) {
        context.save();
        context.setLineDash([4, 3]);
        context.strokeStyle = color;
        context.lineWidth = 1.6;
        context.beginPath();
        c.trail.forEach((t, ti) => {
          const tx = t.x * width;
          const ty = t.y * height;
          if (ti === 0) context.moveTo(tx, ty);
          else context.lineTo(tx, ty);
        });
        context.stroke();
        context.restore();
      }

      const cx = c.x * width;
      const cy = c.y * height;
      context.save();
      context.translate(cx, cy);
      context.rotate(Math.PI / 4);
      context.fillStyle = color;
      context.strokeStyle = ink;
      context.lineWidth = 2;
      context.fillRect(-6.5, -6.5, 13, 13);
      context.strokeRect(-6.5, -6.5, 13, 13);
      context.restore();
    });

    renderSparkline(viz[0]);
  }

  function renderAll(): void {
    const wcss = wcssHistory[wcssHistory.length - 1] ?? 0;
    if (kOutput) kOutput.textContent = String(k);
    if (iterEl) iterEl.textContent = String(iteration);
    if (wcssEl) wcssEl.textContent = wcss.toFixed(2);
    if (movedEl) movedEl.textContent = String(lastReassigned);
    if (phaseEl) {
      phaseEl.textContent =
        phase === 'converged'
          ? 'Converged'
          : phase === 'updated'
            ? 'Iterating'
            : 'Initialized';
    }
    renderCanvas();
    emitLabEvent('clustering:update', { iteration, wcss, k, phase });
  }

  // Event bindings
  const onPreset = () => {
    preset = (presetSelect?.value as DatasetPreset) || 'blobs';
    resetClustering(false);
  };
  const onKChange = () => {
    k = Number(kSlider?.value || 4);
    resetClustering(true);
  };
  const onInitChange = () => {
    initMethod = (initSelect?.value as InitMethod) || 'kmeans++';
    resetClustering(true);
  };
  const onCanvasPointer = (ev: PointerEvent) => {
    const rect = canvas.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return;
    const x = clamp01((ev.clientX - rect.left) / rect.width);
    const y = clamp01((ev.clientY - rect.top) / rect.height);
    points.push({ x, y, cluster: -1 });
    assignPoints();
    wcssHistory[wcssHistory.length - 1] = computeWcss();
    if (phase === 'converged') phase = 'updated';
    renderAll();
  };

  presetSelect?.addEventListener('change', onPreset);
  kSlider?.addEventListener('input', onKChange);
  initSelect?.addEventListener('change', onInitChange);
  stepBtn?.addEventListener('click', stepOnce);
  playBtn?.addEventListener('click', togglePlay);
  resetBtn?.addEventListener('click', () => resetClustering(true));
  regenBtn?.addEventListener('click', () => resetClustering(false));
  canvas.addEventListener('pointerdown', onCanvasPointer);

  const ro = new ResizeObserver((entries) => {
    const entry = entries[0];
    if (!entry) return;
    const nextW = Math.max(260, Math.round(entry.contentRect.width));
    const nextH = Math.round(Math.min(440, Math.max(260, nextW * 0.62)));
    if (Math.abs(nextW - width) < 1 && Math.abs(nextH - height) < 1) return;
    width = nextW;
    height = nextH;
    renderCanvas();
  });
  ro.observe(canvas.parentElement ?? canvas);

  const themeObserver = new MutationObserver(() => renderCanvas());
  themeObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-theme'],
  });

  resetClustering(false);

  return () => {
    stopPlaying();
    ro.disconnect();
    themeObserver.disconnect();
    presetSelect?.removeEventListener('change', onPreset);
    kSlider?.removeEventListener('input', onKChange);
    initSelect?.removeEventListener('change', onInitChange);
    stepBtn?.removeEventListener('click', stepOnce);
    playBtn?.removeEventListener('click', togglePlay);
    canvas.removeEventListener('pointerdown', onCanvasPointer);
  };
}
