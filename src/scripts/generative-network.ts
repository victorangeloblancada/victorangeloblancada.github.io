import { emitLabEvent } from '../components/interactive/eventBus';

interface NodeParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  isHub: boolean;
}

export interface NetworkOptions {
  nodeCount: number;
  linkRadius: number;
  speed: number;
}

export function mountGenerativeNetwork(
  root: HTMLElement,
  initialOpts: NetworkOptions,
): () => void {
  const canvas = root.querySelector<HTMLCanvasElement>('[data-network-canvas]');
  if (!canvas) return () => {};
  const ctx = canvas.getContext('2d');
  if (!ctx) return () => {};

  const canvasEl: HTMLCanvasElement = canvas;
  const context: CanvasRenderingContext2D = ctx;

  const nodesSlider = root.querySelector<HTMLInputElement>('[data-net-nodes]');
  const radiusSlider = root.querySelector<HTMLInputElement>('[data-net-radius]');
  const speedSlider = root.querySelector<HTMLInputElement>('[data-net-speed]');
  const pauseBtn = root.querySelector<HTMLButtonElement>('[data-net-pause]');
  const resetBtn = root.querySelector<HTMLButtonElement>('[data-net-reset]');
  const nodesVal = root.querySelector<HTMLElement>('[data-net-nodes-val]');
  const radiusVal = root.querySelector<HTMLElement>('[data-net-radius-val]');
  const speedVal = root.querySelector<HTMLElement>('[data-net-speed-val]');
  const edgeCountEl = root.querySelector<HTMLElement>('[data-net-edges-val]');

  const reducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let width = 640;
  let height = 340;
  let nodeCount = Number(nodesSlider?.value || initialOpts.nodeCount);
  let linkRadius = Number(radiusSlider?.value || initialOpts.linkRadius);
  let speed = Number(speedSlider?.value || initialOpts.speed);
  let paused = reducedMotion;
  let isVisible = true;
  let rafId: number | null = null;
  let lastFrameTime = 0;

  const pointer = { x: -9999, y: -9999, active: false };
  let particles: NodeParticle[] = [];

  function seedParticles(): void {
    const effectiveMax = Math.min(85, Math.max(12, nodeCount));
    particles = Array.from({ length: effectiveMax }, (_, i) => {
      const angle = Math.random() * Math.PI * 2;
      const baseSpeed = (0.18 + Math.random() * 0.25) * speed;
      return {
        x: Math.random() * width,
        y: Math.random() * height,
        vx: Math.cos(angle) * baseSpeed,
        vy: Math.sin(angle) * baseSpeed,
        radius: i % 7 === 0 ? 3.2 : 2.1,
        isHub: i % 7 === 0,
      };
    });
  }

  function readColors(): { accent: string; ink: string; edge: string } {
    const cs = getComputedStyle(document.documentElement);
    return {
      accent: cs.getPropertyValue('--accent').trim() || '#d97706',
      ink: cs.getPropertyValue('--ink-muted').trim() || '#52525b',
      edge: cs.getPropertyValue('--border-strong').trim() || '#d4d4d8',
    };
  }

  function stepPhysics(dtScale: number): void {
    for (const p of particles) {
      p.x += p.vx * speed * dtScale;
      p.y += p.vy * speed * dtScale;

      if (p.x < 8 || p.x > width - 8) {
        p.vx *= -1;
        p.x = Math.max(8, Math.min(width - 8, p.x));
      }
      if (p.y < 8 || p.y > height - 8) {
        p.vy *= -1;
        p.y = Math.max(8, Math.min(height - 8, p.y));
      }

      // Gentle pointer coupling on capable devices
      if (pointer.active) {
        const dx = pointer.x - p.x;
        const dy = pointer.y - p.y;
        const distSq = dx * dx + dy * dy;
        const maxRange = linkRadius * 1.35;
        if (distSq > 25 && distSq < maxRange * maxRange) {
          const force = 0.015 * dtScale;
          p.x += dx * force;
          p.y += dy * force;
        }
      }
    }
  }

  function drawFrame(): void {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvasEl.width = Math.round(width * dpr);
    canvasEl.height = Math.round(height * dpr);
    context.setTransform(dpr, 0, 0, dpr, 0, 0);
    context.clearRect(0, 0, width, height);

    const { accent, ink, edge } = readColors();
    const rSq = linkRadius * linkRadius;
    let activeEdges = 0;

    // Edges (squared distance avoids sqrt in inner loop)
    context.lineWidth = 1;
    for (let i = 0; i < particles.length; i++) {
      const a = particles[i];
      for (let j = i + 1; j < particles.length; j++) {
        const b = particles[j];
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const dSq = dx * dx + dy * dy;
        if (dSq < rSq) {
          activeEdges++;
          const ratio = 1 - Math.sqrt(dSq) / linkRadius;
          const nearPointer =
            pointer.active &&
            (Math.hypot(a.x - pointer.x, a.y - pointer.y) < linkRadius ||
              Math.hypot(b.x - pointer.x, b.y - pointer.y) < linkRadius);
          context.strokeStyle = nearPointer ? accent : edge;
          context.globalAlpha = nearPointer ? Math.min(0.85, ratio * 0.9) : ratio * 0.55;
          context.beginPath();
          context.moveTo(a.x, a.y);
          context.lineTo(b.x, b.y);
          context.stroke();
        }
      }
    }
    context.globalAlpha = 1;

    // Nodes
    for (const p of particles) {
      const nearPointer =
        pointer.active && Math.hypot(p.x - pointer.x, p.y - pointer.y) < linkRadius * 0.9;
      context.beginPath();
      context.arc(p.x, p.y, nearPointer ? p.radius + 1.2 : p.radius, 0, Math.PI * 2);
      context.fillStyle = p.isHub || nearPointer ? accent : ink;
      context.globalAlpha = p.isHub || nearPointer ? 0.95 : 0.65;
      context.fill();
    }
    context.globalAlpha = 1;

    if (edgeCountEl) edgeCountEl.textContent = String(activeEdges);
    emitLabEvent('network:frame', { nodes: particles.length, edges: activeEdges });
  }

  function loop(now: number): void {
    rafId = null;
    if (paused || !isVisible) return;
    // Cap frame interval ~30fps+ smoothly while avoiding runaway delta after tab switches
    if (now - lastFrameTime >= 24) {
      const dtScale = lastFrameTime ? Math.min(2.2, (now - lastFrameTime) / 16.67) : 1;
      lastFrameTime = now;
      stepPhysics(dtScale);
      drawFrame();
    }
    rafId = window.requestAnimationFrame(loop);
  }

  function startLoop(): void {
    if (!paused && isVisible && rafId === null) {
      lastFrameTime = 0;
      rafId = window.requestAnimationFrame(loop);
    }
  }

  const onPointerMove = (e: PointerEvent) => {
    if (e.pointerType === 'touch') return;
    const rect = canvas.getBoundingClientRect();
    pointer.x = e.clientX - rect.left;
    pointer.y = e.clientY - rect.top;
    pointer.active = true;
    if (paused) drawFrame();
  };
  const onPointerLeave = () => {
    pointer.active = false;
    if (paused) drawFrame();
  };

  const onNodesInput = () => {
    nodeCount = Number(nodesSlider?.value || initialOpts.nodeCount);
    if (nodesVal) nodesVal.textContent = String(nodeCount);
    seedParticles();
    drawFrame();
  };
  const onRadiusInput = () => {
    linkRadius = Number(radiusSlider?.value || initialOpts.linkRadius);
    if (radiusVal) radiusVal.textContent = `${linkRadius}px`;
    drawFrame();
  };
  const onSpeedInput = () => {
    speed = Number(speedSlider?.value || initialOpts.speed);
    if (speedVal) speedVal.textContent = `${speed.toFixed(1)}x`;
  };
  const onPauseToggle = () => {
    paused = !paused;
    if (pauseBtn) pauseBtn.textContent = paused ? 'Resume' : 'Pause';
    if (!paused) startLoop();
  };
  const onReset = () => {
    seedParticles();
    drawFrame();
  };

  canvas.addEventListener('pointermove', onPointerMove);
  canvas.addEventListener('pointerleave', onPointerLeave);
  nodesSlider?.addEventListener('input', onNodesInput);
  radiusSlider?.addEventListener('input', onRadiusInput);
  speedSlider?.addEventListener('input', onSpeedInput);
  pauseBtn?.addEventListener('click', onPauseToggle);
  resetBtn?.addEventListener('click', onReset);

  const ro = new ResizeObserver((entries) => {
    const rect = entries[0]?.contentRect;
    if (!rect) return;
    const nextW = Math.max(240, Math.round(rect.width));
    const nextH = Math.max(220, Math.round(rect.height));
    if (Math.abs(nextW - width) < 1 && Math.abs(nextH - height) < 1) return;
    const prevW = width || 1;
    const prevH = height || 1;
    width = nextW;
    height = nextH;
    if (particles.length === 0) {
      seedParticles();
    } else {
      for (const p of particles) {
        p.x = (p.x / prevW) * width;
        p.y = (p.y / prevH) * height;
      }
    }
    drawFrame();
  });
  ro.observe(canvas.parentElement ?? canvas);

  const io = new IntersectionObserver((entries) => {
    isVisible = entries[0]?.isIntersecting ?? true;
    if (isVisible && !paused) startLoop();
  });
  io.observe(root);

  const themeObserver = new MutationObserver(() => drawFrame());
  themeObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-theme'],
  });

  if (pauseBtn) pauseBtn.textContent = paused ? 'Resume' : 'Pause';
  seedParticles();
  drawFrame();
  if (!paused) startLoop();

  return () => {
    if (rafId !== null) window.cancelAnimationFrame(rafId);
    ro.disconnect();
    io.disconnect();
    themeObserver.disconnect();
    canvas.removeEventListener('pointermove', onPointerMove);
    canvas.removeEventListener('pointerleave', onPointerLeave);
    nodesSlider?.removeEventListener('input', onNodesInput);
    radiusSlider?.removeEventListener('input', onRadiusInput);
    speedSlider?.removeEventListener('input', onSpeedInput);
    pauseBtn?.removeEventListener('click', onPauseToggle);
    resetBtn?.removeEventListener('click', onReset);
  };
}
