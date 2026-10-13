import { Heart, Sparkles } from "lucide-react";
import type { Content } from "../types";
import { Ph, triggerCelebrationConfetti } from "../components";
import { sfx } from "../utils/audio";

export default function Opening({ c, onOpen }: { c: Content; onOpen: () => void }) {
  const words = `Happy 21st Birthday, ${c.name}.`.split(" ");

  const handleOpen = () => {
    sfx.sparkle();
    triggerCelebrationConfetti(0.5, 0.4);
    onOpen();
  };

  return (
    <section id="open" className="hero-opening on">
      <div className="hero-content">
        {/* Milestone Pill Badge */}
        <div className="celebration-pill">
          <Sparkles size={14} className="text-gold" />
          <span>A Milestone Chapter · 21st Birthday</span>
          <Sparkles size={14} className="text-gold" />
        </div>

        {/* Elegant Animated Heading */}
        <h1 className="hero-title">
          {words.map((w, i) => (
            <span
              key={i}
              className="word-fade"
              style={{ animationDelay: `${i * 0.14 + 0.1}s` }}
            >
              {w}&nbsp;
            </span>
          ))}
        </h1>

        {/* Subtitle / Romantic Message */}
        <p className="hero-subtitle">{c.sub}</p>

        {/* Date Line Badge */}
        <div className="hero-date-badge">
          <span className="dot-pulse" />
          <span>{c.dateLabel}</span>
        </div>

        {/* Primary CTA Button */}
        <div className="hero-actions">
          <button className="btn-modern-primary" onClick={handleOpen}>
            <span className="btn-shine" />
            <span className="btn-text">Buka Kejutan Spesial Ulang Tahun</span>
            <Heart size={18} className="btn-icon fill-current" />
          </button>
        </div>
      </div>

      {/* Portrait Showcase with Luxe Glass Arch */}
      <div className="hero-portrait-wrapper">
        <div className="portrait-glow-aura" />
        <div className="portrait-luxe-frame">
          <Ph
            src={c.portrait}
            label="Foto Portrait Zahwa"
            className="portrait-img"
            showBadge="Zahwa · 21 ✨"
            alt={`Foto ${c.name}`}
          />
          <div className="portrait-overlay-shimmer" />
        </div>

        {/* Floating Accent Badges */}
        <div className="floating-badge badge-top-right">
          <Sparkles size={13} className="text-gold" />
          <span>My Favorite Person</span>
        </div>

        <div className="floating-badge badge-bottom-left">
          <Heart size={13} className="text-rose fill-rose" />
          <span>21 Years of Grace</span>
        </div>
      </div>
    </section>
  );
}
