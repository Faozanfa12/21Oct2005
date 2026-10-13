import { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  maxOpacity: number;
  fadeSpeed: number;
  color: string;
  isStar?: boolean;
}

export function AmbientCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const onResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", onResize);

    const colors = [
      "rgba(248, 200, 212, ",  // soft blush
      "rgba(216, 178, 108, ",  // champagne gold
      "rgba(235, 155, 175, ",  // romantic rose
      "rgba(255, 230, 190, ",  // warm ivory/amber
    ];

    const particles: Particle[] = [];
    const maxParticles = Math.min(45, Math.floor((width * height) / 32000));

    function createParticle(x?: number, y?: number, isMouse = false): Particle {
      const color = colors[Math.floor(Math.random() * colors.length)];
      return {
        x: x ?? Math.random() * width,
        y: y ?? Math.random() * height,
        vx: (Math.random() - 0.5) * (isMouse ? 1.2 : 0.4),
        vy: isMouse ? -Math.random() * 1.5 - 0.3 : -Math.random() * 0.45 - 0.15,
        size: isMouse ? Math.random() * 2.5 + 1.2 : Math.random() * 2.8 + 0.8,
        opacity: isMouse ? 0.9 : Math.random() * 0.2,
        maxOpacity: Math.random() * 0.6 + 0.25,
        fadeSpeed: isMouse ? 0.025 : Math.random() * 0.008 + 0.003,
        color,
        isStar: Math.random() > 0.65,
      };
    }

    for (let i = 0; i < maxParticles; i++) {
      particles.push(createParticle());
    }

    // Touch/pointer sparkle spawner
    let lastSpawn = 0;
    const onPointerMove = (e: PointerEvent) => {
      const now = performance.now();
      if (now - lastSpawn < 40) return;
      lastSpawn = now;
      if (particles.length < maxParticles + 15) {
        particles.push(createParticle(e.clientX, e.clientY, true));
      }
    };
    window.addEventListener("pointermove", onPointerMove, { passive: true });

    function drawStar(c: CanvasRenderingContext2D, cx: number, cy: number, spikes: number, outerRadius: number, innerRadius: number) {
      let rot = (Math.PI / 2) * 3;
      let x = cx;
      let y = cy;
      const step = Math.PI / spikes;

      c.beginPath();
      c.moveTo(cx, cy - outerRadius);
      for (let i = 0; i < spikes; i++) {
        x = cx + Math.cos(rot) * outerRadius;
        y = cy + Math.sin(rot) * outerRadius;
        c.lineTo(x, y);
        rot += step;

        x = cx + Math.cos(rot) * innerRadius;
        y = cy + Math.sin(rot) * innerRadius;
        c.lineTo(x, y);
        rot += step;
      }
      c.lineTo(cx, cy - outerRadius);
      c.closePath();
      c.fill();
    }

    let tick = 0;
    const render = () => {
      tick++;
      ctx.clearRect(0, 0, width, height);

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx + Math.sin(tick * 0.02 + p.y * 0.01) * 0.2;
        p.y += p.vy;

        // Opacity oscillation / fade
        p.opacity += p.fadeSpeed;
        if (p.opacity > p.maxOpacity) {
          p.opacity = p.maxOpacity;
          p.fadeSpeed = -Math.abs(p.fadeSpeed);
        }

        if (p.opacity <= 0 || p.y < -10 || p.x < -10 || p.x > width + 10) {
          if (particles.length > maxParticles) {
            particles.splice(i, 1);
            continue;
          } else {
            particles[i] = createParticle(Math.random() * width, height + 10);
            continue;
          }
        }

        ctx.fillStyle = `${p.color}${Math.max(0, p.opacity)})`;
        if (p.isStar && p.size > 1.8) {
          drawStar(ctx, p.x, p.y, 4, p.size * 2, p.size * 0.7);
        } else {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("pointermove", onPointerMove);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="ambient-canvas"
      aria-hidden="true"
      style={{
        position: "fixed",
        inset: 0,
        pointerEvents: "none",
        zIndex: 1,
        width: "100%",
        height: "100%",
      }}
    />
  );
}
