import { useState, type CSSProperties } from "react";
import confetti from "canvas-confetti";

export function Ph({
  src,
  label,
  style,
  id,
  className = "",
  onClick,
  showBadge,
  alt = "Memory photo",
}: {
  src?: string;
  label?: string;
  style?: CSSProperties;
  id?: string;
  className?: string;
  onClick?: () => void;
  showBadge?: string;
  alt?: string;
}) {
  const [loaded, setLoaded] = useState(false);

  return (
    <div
      className={`ph-wrapper ${className}`}
      style={style}
      id={id}
      onClick={onClick}
    >
      <div className={`ph ${loaded ? "is-loaded" : "is-loading"}`}>
        {src ? (
          <>
            <img
              src={src}
              alt={alt}
              loading="lazy"
              onLoad={() => setLoaded(true)}
              className="ph-img"
            />
            {!loaded && <div className="ph-skeleton" />}
          </>
        ) : (
          <div className="ph-placeholder">
            <span className="ph-placeholder-icon">📷</span>
            <span>{label ?? "Foto belum ditambahkan"}</span>
          </div>
        )}
        {showBadge && <div className="ph-badge">{showBadge}</div>}
      </div>
    </div>
  );
}

export function Petals() {
  if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    return null;
  }

  // 16 petals with diverse coordinates, rotations, and sway speeds
  const petals = Array.from({ length: 16 }, (_, i) => ({
    left: `${(i * 23 + 7) % 96}%`,
    dur: `${12 + ((i * 5) % 10)}s`,
    delay: `-${(i * 3.7) % 15}s`,
    size: `${12 + (i % 4) * 4}px`,
    type: i % 3,
  }));

  return (
    <div className="petals-container" aria-hidden="true">
      {petals.map((p, i) => (
        <div
          key={i}
          className={`petal petal-type-${p.type}`}
          style={{
            left: p.left,
            animationDuration: p.dur,
            animationDelay: p.delay,
            width: p.size,
            height: `calc(${p.size} * 1.3)`,
          }}
        />
      ))}
    </div>
  );
}

// Confetti burst helper for celebrations
export function triggerCelebrationConfetti(x = 0.5, y = 0.6) {
  try {
    // Burst 1: Heart shaped / rose pink confetti
    confetti({
      particleCount: 50,
      spread: 70,
      origin: { x, y },
      colors: ["#f4a8b5", "#e87a90", "#b8934f", "#ffd1dc", "#ffffff"],
      shapes: ["circle"],
      scalar: 1.1,
      ticks: 200,
    });

    // Burst 2: Gold shimmer sparkles
    setTimeout(() => {
      confetti({
        particleCount: 40,
        angle: 60,
        spread: 55,
        origin: { x: 0.1, y: 0.7 },
        colors: ["#d4af37", "#f3e5ab", "#e8b4bc"],
      });
      confetti({
        particleCount: 40,
        angle: 120,
        spread: 55,
        origin: { x: 0.9, y: 0.7 },
        colors: ["#d4af37", "#f3e5ab", "#e8b4bc"],
      });
    }, 180);
  } catch {
    // Graceful fallback if canvas is unsupported
  }
}

// Grand celebratory fireworks
export function triggerGrandFireworks() {
  const duration = 3.5 * 1000;
  const animationEnd = Date.now() + duration;

  const interval: ReturnType<typeof setInterval> = setInterval(() => {
    const timeLeft = animationEnd - Date.now();
    if (timeLeft <= 0) {
      return clearInterval(interval);
    }
    const particleCount = 40 * (timeLeft / duration);

    confetti({
      particleCount,
      startVelocity: 30,
      spread: 360,
      ticks: 80,
      origin: {
        x: Math.random() * 0.8 + 0.1,
        y: Math.random() * 0.5 + 0.1,
      },
      colors: ["#e87a90", "#d4af37", "#f7cad0", "#ffb3c6", "#fffdfa", "#c59b27"],
    });
  }, 350);
}
