import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Heart,
  Maximize2,
  Sparkles,
  X,
} from "lucide-react";
import type { Content } from "../types";
import { Ph } from "../components";
import { sfx } from "../utils/audio";

const HEIGHTS = [290, 230, 340, 260, 310, 240];

export default function Memories({ c }: { c: Content }) {
  const [idx, setIdx] = useState<number | null>(null);
  const startX = useRef(0);
  const n = c.memories.length;

  const step = (d: number) => {
    sfx.pop();
    setIdx((i) => (i === null ? i : (i + d + n) % n));
  };

  const openLightbox = (i: number) => {
    sfx.chime(1.1);
    setIdx(i);
  };

  useEffect(() => {
    if (idx === null) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
      if (e.key === "Escape") setIdx(null);
    };

    addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      removeEventListener("keydown", onKey);
    };
  }, [idx, n]);

  const cur = idx === null ? null : c.memories[idx];

  return (
    <section className="view on memories-view">
      {/* Section Header */}
      <div className="section-header-center">
        <div className="eyebrow-pill">
          <Sparkles size={12} className="text-gold" />
          <span>Foto-foto kita</span>
        </div>
        <h2 className="section-title">Beberapa kenangan bareng kamu</h2>
        <p className="section-subtitle">
          Lihat lagi foto-foto ini, yuk. Semoga kamu masih ingat ceritanya.
        </p>
        <div className="memory-counter-badge">
          <span>{n} Foto Kenangan</span>
          <span className="dot-sep">•</span>
          <span>Klik foto untuk melihat ukuran penuh</span>
        </div>
      </div>

      {/* Masonry Photo Grid */}
      <div className="memories-masonry-grid">
        {c.memories.map((m, i) => (
          <div
            key={i}
            className="memory-card"
            role="button"
            tabIndex={0}
            aria-label={`Buka memori ${i + 1}: ${m.cap}`}
            onClick={() => openLightbox(i)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                openLightbox(i);
              }
            }}
          >
            <div className="memory-washi-tape" />

            <div className="memory-photo-container">
              <Ph
                src={m.src}
                label={`Tambah Foto ${i + 1}`}
                style={{ height: HEIGHTS[i % HEIGHTS.length] }}
                alt={m.cap}
              />
              <div className="memory-hover-overlay">
                <span className="zoom-pill">
                  <Maximize2 size={13} />
                  <span>Lihat Detail</span>
                </span>
              </div>
            </div>

            <div className="memory-details">
              <p className="memory-caption">{m.cap}</p>
              {m.date && (
                <div className="memory-date-tag">
                  <Calendar size={11} />
                  <span>{m.date}</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Modern Frosted Glass Lightbox */}
      {cur &&
        createPortal(
          <div
            className="lightbox-overlay"
            role="dialog"
            aria-modal="true"
            onClick={() => setIdx(null)}
            onTouchStart={(e) => {
              startX.current = e.touches[0].clientX;
            }}
            onTouchEnd={(e) => {
              const d = e.changedTouches[0].clientX - startX.current;
              if (Math.abs(d) > 40) step(d < 0 ? 1 : -1);
            }}
          >
            {/* Top Navigation Bar */}
            <div
              className="lightbox-top-bar"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="lightbox-index-pill">
                <span>Momen</span>
                <strong>{(idx ?? 0) + 1}</strong>
                <span>dari</span>
                <strong>{n}</strong>
              </div>

              <button
                className="lightbox-close-btn"
                onClick={() => setIdx(null)}
                aria-label="Tutup foto"
              >
                <span>Tutup</span>
                <X size={16} />
              </button>
            </div>

            {/* Main Stage */}
            <div
              className="lightbox-stage"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Prev Button */}
              <button
                className="lightbox-arrow-btn arrow-prev"
                onClick={() => step(-1)}
                aria-label="Foto sebelumnya"
              >
                <ChevronLeft size={24} />
              </button>

              {/* Photo Display Card */}
              <div className="lightbox-card">
                <div className="lightbox-image-box">
                  <Ph
                    src={cur.src}
                    label={`Foto ${(idx ?? 0) + 1}`}
                    className="lightbox-main-img"
                    alt={cur.cap}
                  />
                </div>

                {/* Caption Bar */}
                <div className="lightbox-caption-card">
                  <div className="caption-text-group">
                    <p className="lightbox-caption">{cur.cap}</p>
                    {cur.date && (
                      <span className="lightbox-date">
                        <Calendar size={12} />
                        {cur.date}
                      </span>
                    )}
                  </div>
                  <div className="lightbox-badge-heart">
                    <Heart size={16} className="fill-rose text-rose" />
                  </div>
                </div>
              </div>

              {/* Next Button */}
              <button
                className="lightbox-arrow-btn arrow-next"
                onClick={() => step(1)}
                aria-label="Foto berikutnya"
              >
                <ChevronRight size={24} />
              </button>
            </div>

            {/* Bottom Keyboard Hint */}
            <div className="lightbox-footer-hint">
              <span>Gunakan tombol panah ‹ › di keyboard atau usap layar untuk berpindah</span>
            </div>
          </div>,
          document.body,
        )}
    </section>
  );
}
