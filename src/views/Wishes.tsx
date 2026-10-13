import { useState } from "react";
import {
  ArrowRight,
  ChevronDown,
  Compass,
  Feather,
  Heart,
  Sparkles,
  Star,
  Sun,
} from "lucide-react";
import type { Content, ViewId } from "../types";
import { sfx } from "../utils/audio";

const WISH_ICONS = [
  <Sun size={18} className="text-gold" />,
  <Star size={18} className="text-rose" />,
  <Heart size={18} className="text-rose fill-rose" />,
  <Compass size={18} className="text-gold" />,
  <Feather size={18} className="text-gold" />,
  <Sparkles size={18} className="text-rose" />,
];

export default function Wishes({ c, go }: { c: Content; go: (v: ViewId) => void }) {
  const [openSet, setOpenSet] = useState<Set<number>>(new Set([0])); // First wish open by default

  const toggleWish = (index: number) => {
    sfx.pop();
    setOpenSet((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  const expandAll = () => {
    sfx.pop();
    if (openSet.size === c.wishes.length) {
      setOpenSet(new Set());
    } else {
      setOpenSet(new Set(c.wishes.map((_, i) => i)));
    }
  };

  return (
    <section className="view on wishes-view">
      <div className="section-header-center">
        <div className="eyebrow-pill">
          <Sparkles size={12} className="text-gold" />
          <span>Harapan buat umur 21</span>
        </div>
        <h2 className="section-title">
          Semoga tahun ini <span className="italic-serif text-gradient">baik buat kamu</span>
        </h2>
        <p className="section-subtitle">
          Ini beberapa hal yang aku harap terjadi buat kamu tahun ini.
        </p>

        <button className="expand-toggle-btn" onClick={expandAll}>
          {openSet.size === c.wishes.length ? "Tutup semua" : "Buka semua"}
        </button>
      </div>

      {/* Modern Wish Accordion Cards */}
      <div className="wishes-accordion-list">
        {c.wishes.map((w, i) => {
          const isOpen = openSet.has(i);
          return (
            <div
              key={i}
              className={`wish-accordion-card ${isOpen ? "is-expanded" : ""}`}
            >
              <button
                className="wish-header-btn"
                onClick={() => toggleWish(i)}
                aria-expanded={isOpen}
              >
                <div className="wish-icon-box">
                  {WISH_ICONS[i % WISH_ICONS.length]}
                </div>

                <div className="wish-title-text">
                  <span className="wish-number">Harapan #{i + 1}</span>
                  <h3 className="wish-title">{w.t}</h3>
                </div>

                <div className={`wish-chevron ${isOpen ? "rotate" : ""}`}>
                  <ChevronDown size={18} />
                </div>
              </button>

              {isOpen && (
                <div className="wish-content-body">
                  <p className="wish-message-text">{w.m}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Bottom CTA */}
      <div className="wishes-footer-action">
        <button
          className="btn-modern-primary"
          onClick={() => {
            sfx.sparkle();
            go("fin");
          }}
        >
          <span>Lanjut ke pesan terakhir</span>
          <ArrowRight size={16} />
        </button>
      </div>
    </section>
  );
}
