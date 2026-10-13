import { useState } from "react";
import {
  ArrowRight,
  ExternalLink,
  Gift,
  Heart,
  PackageOpen,
  Sparkles,
} from "lucide-react";
import type { Content, ViewId } from "../types";
import { Ph, triggerCelebrationConfetti } from "../components";
import { sfx } from "../utils/audio";

export default function Surprise({
  c,
  go,
  onOpen,
}: {
  c: Content;
  go: (v: ViewId) => void;
  onOpen: () => void;
}) {
  const [phase, setPhase] = useState<"closed" | "opening" | "open">("closed");

  const openGift = () => {
    if (phase !== "closed") return;
    sfx.sparkle();
    setPhase("opening");
    onOpen();
    triggerCelebrationConfetti(0.5, 0.45);

    setTimeout(() => {
      setPhase("open");
    }, 900);
  };

  return (
    <section className="view on surprise-view">
      <div className="section-header-center">
        <div className="eyebrow-pill">
          <Gift size={12} className="text-gold" />
          <span>Kejutan Khusus Ulang Tahun</span>
        </div>
        <h2 className="section-title">Sesuatu Spesial Untukmu</h2>
        <p className="section-subtitle">
          Sebuah ungkapan kasih yang disiapkan dengan segenap doa dan ketulusan hati.
        </p>
      </div>

      {phase !== "open" && (
        <div className="gift-box-stage">
          <div
            className={`luxury-gift-box ${phase === "opening" ? "is-opening" : ""}`}
            onClick={openGift}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") openGift();
            }}
            aria-label="Buka kotak kado"
          >
            {/* Box Lid & Ribbon */}
            <div className="gift-lid">
              <div className="ribbon-bow">
                <div className="bow-loop left" />
                <div className="bow-loop right" />
                <div className="bow-center">
                  <Heart size={14} className="fill-gold text-gold" />
                </div>
              </div>
              <div className="ribbon-vertical" />
            </div>

            {/* Box Body */}
            <div className="gift-body">
              <div className="ribbon-horizontal" />
              <div className="ribbon-vertical-body" />
              <div className="gift-tag">
                <Sparkles size={11} className="text-gold" />
                <span>Untuk Zahwa ♡</span>
              </div>
            </div>

            {/* Ambient Aura */}
            <div className="gift-glow-aura" />
          </div>

          <p className="gift-tap-hint">
            <Sparkles size={14} className="text-gold" />
            <span>Sentuh kado di atas untuk membuka kejutannya</span>
            <Sparkles size={14} className="text-gold" />
          </p>
        </div>
      )}

      {phase === "open" && (
        <div className="gift-revealed-card">
          <div className="card-top-icon">
            <PackageOpen size={28} className="text-gold" />
          </div>

          {c.gift.photo && (
            <div className="gift-photo-frame">
              <Ph
                src={c.gift.photo}
                label="Foto Hadiah"
                className="gift-photo"
                alt="Hadiah Ulang Tahun"
              />
            </div>
          )}

          <h3 className="gift-title">{c.gift.title}</h3>
          <p className="gift-message">{c.gift.msg}</p>

          {c.gift.links.length > 0 && (
            <div className="gift-links-group">
              {c.gift.links.map((l, i) => (
                <a
                  key={i}
                  className="btn-modern-primary"
                  href={l.url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span>{l.label}</span>
                  <ExternalLink size={14} />
                </a>
              ))}
            </div>
          )}

          <div className="gift-next-action">
            <button
              className="btn-modern-ghost"
              onClick={() => {
                sfx.pop();
                go("wishes");
              }}
            >
              <span>Lanjut ke Doa Babak 21</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
