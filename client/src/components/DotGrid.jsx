import { useRef, useEffect, useCallback, useMemo } from 'react';
import { gsap } from 'gsap';
import './DotGrid.css';

/* ------------------ HELPERS ------------------ */

const throttle = (func, limit) => {
  let lastCall = 0;
  return function (...args) {
    const now = performance.now();
    if (now - lastCall >= limit) {
      lastCall = now;
      func.apply(this, args);
    }
  };
};

const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

function hexToRgb(hex) {
  const m = hex.match(/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i);
  if (!m) return { r: 0, g: 0, b: 0 };
  return {
    r: parseInt(m[1], 16),
    g: parseInt(m[2], 16),
    b: parseInt(m[3], 16)
  };
}

/* ------------------ COMPONENT ------------------ */

const DotGrid = ({
  dotSize = 6,
  gap = 40,
  baseColor = '#334155',
  activeColor = '#00f3ff',
  proximity = 100,
  speedTrigger = 20,
  shockRadius = 300,
  shockStrength = 4,
  maxSpeed = 750,
  returnDuration = 2,
  className = '',
  style
}) => {
  const wrapperRef = useRef(null);
  const canvasRef = useRef(null);
  const dotsRef = useRef([]);
  const pointerRef = useRef({
    x: 0, y: 0, lastX: 0, lastY: 0, lastTime: 0
  });

  const baseRgb = useMemo(() => hexToRgb(baseColor), [baseColor]);
  const activeRgb = useMemo(() => hexToRgb(activeColor), [activeColor]);

  const circlePath = useMemo(() => {
    if (!window.Path2D) return null;
    const p = new Path2D();
    p.arc(0, 0, dotSize / 2, 0, Math.PI * 2);
    return p;
  }, [dotSize]);

  /* ------------------ GRID BUILD ------------------ */

  const buildGrid = useCallback(() => {
    const wrap = wrapperRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;

    const { width, height } = wrap.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    const ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const cell = dotSize + gap;
    const cols = Math.floor((width + gap) / cell);
    const rows = Math.floor((height + gap) / cell);

    const startX = (width - (cell * cols - gap)) / 2 + dotSize / 2;
    const startY = (height - (cell * rows - gap)) / 2 + dotSize / 2;

    dotsRef.current = [];

    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        dotsRef.current.push({
          cx: startX + x * cell,
          cy: startY + y * cell,
          xOffset: 0,
          yOffset: 0,
          _locked: false
        });
      }
    }
  }, [dotSize, gap]);

  /* ------------------ DRAW LOOP ------------------ */

  useEffect(() => {
    if (!circlePath) return;
    let raf;

    const proxSq = proximity * proximity;

    const draw = () => {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (!ctx) return;

      const dpr = window.devicePixelRatio || 1;

      // 🔥 FIX: reset transform BEFORE clearing
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const { x, y } = pointerRef.current;

      for (const dot of dotsRef.current) {
        const dx = dot.cx - x;
        const dy = dot.cy - y;
        const dsq = dx * dx + dy * dy;

        let color = baseColor;

        if (dsq < proxSq) {
          const t = 1 - Math.sqrt(dsq) / proximity;
          color = `rgb(
            ${baseRgb.r + (activeRgb.r - baseRgb.r) * t},
            ${baseRgb.g + (activeRgb.g - baseRgb.g) * t},
            ${baseRgb.b + (activeRgb.b - baseRgb.b) * t}
          )`;
        }

        ctx.save();
        ctx.translate(dot.cx + dot.xOffset, dot.cy + dot.yOffset);
        ctx.fillStyle = color;
        ctx.fill(circlePath);
        ctx.restore();
      }

      raf = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(raf);
  }, [circlePath, proximity, baseColor, baseRgb, activeRgb]);

  /* ------------------ RESIZE ------------------ */

  useEffect(() => {
    buildGrid();
    window.addEventListener('resize', buildGrid);
    return () => window.removeEventListener('resize', buildGrid);
  }, [buildGrid]);

  /* ------------------ INTERACTION ------------------ */

  useEffect(() => {
    const onMove = e => {
      const pr = pointerRef.current;
      const now = performance.now();
      const dt = pr.lastTime ? now - pr.lastTime : 16;

      const dx = e.clientX - pr.lastX;
      const dy = e.clientY - pr.lastY;

      const speed = Math.min(
        Math.hypot(dx / dt * 1000, dy / dt * 1000),
        maxSpeed
      );

      pr.lastTime = now;
      pr.lastX = e.clientX;
      pr.lastY = e.clientY;

      const rect = canvasRef.current.getBoundingClientRect();
      pr.x = e.clientX - rect.left;
      pr.y = e.clientY - rect.top;

      for (const dot of dotsRef.current) {
        if (dot._locked) continue;

        const dist = Math.hypot(dot.cx - pr.x, dot.cy - pr.y);
        if (speed < speedTrigger || dist > proximity) continue;

        dot._locked = true;
        gsap.killTweensOf(dot);

        const angle = Math.atan2(dot.cy - pr.y, dot.cx - pr.x);
        const maxPush = 18;

        const pushX = clamp(Math.cos(angle) * speed * 0.03, -maxPush, maxPush);
        const pushY = clamp(Math.sin(angle) * speed * 0.03, -maxPush, maxPush);

        gsap.to(dot, {
          xOffset: pushX,
          yOffset: pushY,
          duration: 0.25,
          ease: 'power3.out',
          onComplete: () => {
            gsap.to(dot, {
              xOffset: 0,
              yOffset: 0,
              duration: returnDuration,
              ease: 'elastic.out(1, 0.35)',
              onComplete: () => (dot._locked = false)
            });
          }
        });
      }
    };

    const onClick = e => {
      const rect = canvasRef.current.getBoundingClientRect();
      const cx = e.clientX - rect.left;
      const cy = e.clientY - rect.top;

      for (const dot of dotsRef.current) {
        const dist = Math.hypot(dot.cx - cx, dot.cy - cy);
        if (dist > shockRadius) continue;

        gsap.killTweensOf(dot);
        dot._locked = true;

        const angle = Math.atan2(dot.cy - cy, dot.cx - cx);
        const force = (1 - dist / shockRadius) * shockStrength * 20;

        gsap.to(dot, {
          xOffset: Math.cos(angle) * force,
          yOffset: Math.sin(angle) * force,
          duration: 0.25,
          ease: 'power2.out',
          onComplete: () => {
            gsap.to(dot, {
              xOffset: 0,
              yOffset: 0,
              duration: returnDuration,
              ease: 'elastic.out(1, 0.4)',
              onComplete: () => (dot._locked = false)
            });
          }
        });
      }
    };

    const throttled = throttle(onMove, 30);
    window.addEventListener('mousemove', throttled);
    window.addEventListener('click', onClick);

    return () => {
      window.removeEventListener('mousemove', throttled);
      window.removeEventListener('click', onClick);
    };
  }, [maxSpeed, speedTrigger, proximity, shockRadius, shockStrength, returnDuration]);

  /* ------------------ RENDER ------------------ */

  return (
    <div className={`dot-grid ${className}`} style={style}>
      <div ref={wrapperRef} className="dot-grid__wrap">
        <canvas ref={canvasRef} className="dot-grid__canvas" />
      </div>
    </div>
  );
};

export default DotGrid;
