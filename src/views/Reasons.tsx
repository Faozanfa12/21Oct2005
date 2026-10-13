import { useEffect, useState } from "react";
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Heart,
  Lock,
  Sparkles,
  Trophy,
  X,
} from "lucide-react";
import type { Content } from "../types";
import { triggerCelebrationConfetti } from "../components";
import { sfx } from "../utils/audio";

export default function Reasons({
  c,
  opened,
  onOpen,
}: {
  c: Content;
  opened: Set<number>;
  onOpen: (n: number) => void;
}) {
  const [active, setActive] = useState<number | null>(null);
  const total = c.reasons.length;
  const openedCount = opened.size;
  const progressPercent = Math.round((openedCount / total) * 100);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setActive(null);
      if (active !== null) {
        if (e.key === "ArrowRight" && active < total - 1) {
          handleSelect(active + 1);
        }
        if (e.key === "ArrowLeft" && active > 0) {
          handleSelect(active - 1);
        }
      }
    };
    addEventListener("keydown", onKey);
    return () => removeEventListener("keydown", onKey);
  }, [active, total]);

  const handleSelect = (idx: number) => {
    sfx.chime(1 + (idx / total) * 0.5);
    const wasOpened = opened.has(idx);
    onOpen(idx);
    setActive(idx);

    if (!wasOpened) {
      triggerCelebrationConfetti(0.5, 0.5);
      if (opened.size + 1 === total) {
        // All unlocked celebration!
        setTimeout(() => {
          sfx.sparkle();
          triggerCelebrationConfetti(0.5, 0.4);
        }, 500);
      }
    }
  };

  return (
    <section className="view on reasons-view">
      {/* Header */}
      <div className="section-header-center">
        <div className="eyebrow-pill">
          <Heart size={12} className="text-rose fill-rose" />
          <span>21 hal tentang kamu</span>
        </div>
        <h2 className="section-title">21 hal yang aku suka dari kamu</h2>
        <p className="section-subtitle">
          Sebenarnya masih banyak lagi, tapi ini 21 yang langsung kepikiran.
        </p>

        {/* Progress Bar Container */}
        <div className="reasons-progress-container">
          <div className="progress-labels">
            <span className="progress-status">
              {openedCount === total ? (
                <span className="all-unlocked-badge">
                  <Trophy size={14} className="text-gold" />
                  Kamu sudah buka semuanya! ♡
                </span>
              ) : (
                `Terbuka ${openedCount} dari ${total} Alasan`
              )}
            </span>
            <span className="progress-percent">{progressPercent}%</span>
          </div>

          <div className="progress-track">
            <div
              className="progress-fill"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Grid of 21 Cards */}
      <div className="reasons-cards-grid">
        {c.reasons.map((_, i) => {
          const isSeen = opened.has(i);
          return (
            <button
              key={i}
              className={`reason-gem-card ${isSeen ? "is-unlocked" : "is-locked"}`}
              onClick={() => handleSelect(i)}
              aria-label={`Buka alasan nomor ${i + 1}`}
            >
              <div className="gem-number-box">
                <span className="gem-hash">#</span>
                <span className="gem-num">{String(i + 1).padStart(2, "0")}</span>
              </div>

              <div className="gem-status-indicator">
                {isSeen ? (
                  <CheckCircle2 size={13} className="text-gold" />
                ) : (
                  <Sparkles size={13} className="text-rose opacity-60" />
                )}
              </div>

              <div className="gem-shimmer" />
            </button>
          );
        })}
      </div>

      {/* Modal / Dialog for Active Reason */}
      {active !== null && (
        <div
          className="reason-modal-backdrop"
          onClick={() => setActive(null)}
        >
          <div
            className="reason-modal-card"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            {/* Modal Top Bar */}
            <div className="reason-modal-header">
              <div className="reason-modal-badge">
                <Sparkles size={14} className="text-gold" />
                <span>Alasan #{String(active + 1).padStart(2, "0")} dari {total}</span>
              </div>

              <button
                className="reason-close-btn"
                onClick={() => setActive(null)}
                aria-label="Tutup"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="reason-modal-body">
              <div className="quote-heart-badge">
                <Heart size={24} className="fill-rose text-rose" />
              </div>
              <p className="reason-text-full">{c.reasons[active]}</p>
            </div>

            {/* Modal Navigation Footer */}
            <div className="reason-modal-footer">
              <button
                className="modal-nav-btn"
                disabled={active === 0}
                onClick={() => handleSelect(active - 1)}
              >
                <ChevronLeft size={16} />
                <span>Sebelumnya</span>
              </button>

              <div className="modal-indicator-dots">
                <span>{active + 1} / {total}</span>
              </div>

              <button
                className="modal-nav-btn"
                disabled={active === total - 1}
                onClick={() => handleSelect(active + 1)}
              >
                <span>Berikutnya</span>
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
