import { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Heart,
  Mail,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import type { Content } from "../types";
import { triggerCelebrationConfetti } from "../components";
import { sfx } from "../utils/audio";

export default function Letter({ c, onDone }: { c: Content; onDone: () => void }) {
  const [started, setStarted] = useState(false);
  const [page, setPage] = useState(0);
  const totalPages = c.letter.length;
  const isLastPage = page === totalPages - 1;

  const handleStart = () => {
    sfx.sparkle();
    setStarted(true);
    setPage(0);
    if (totalPages === 1) onDone();
  };

  const nextPage = () => {
    sfx.pop();
    if (page < totalPages - 1) {
      const nextIdx = page + 1;
      setPage(nextIdx);
      if (nextIdx === totalPages - 1) {
        onDone();
        setTimeout(() => {
          sfx.sparkle();
          triggerCelebrationConfetti(0.5, 0.5);
        }, 300);
      }
    }
  };

  const prevPage = () => {
    sfx.pop();
    if (page > 0) setPage(page - 1);
  };

  return (
    <section className="view on letter-view">
      <div className="section-header-center">
        <div className="eyebrow-pill">
          <Mail size={12} className="text-gold" />
          <span>Sedikit pesan buat kamu</span>
        </div>
        <h2 className="section-title">Untuk Zahwa Rahma Nisa</h2>
        <p className="section-subtitle">
          Aku mau bilang sesuatu, sebelum kita lanjut ke bagian berikutnya.
        </p>
      </div>

      {!started ? (
        /* Envelope Teaser Stage */
        <div className="letter-teaser-container">
          <div className="letter-envelope-preview" onClick={handleStart}>
            <div className="letter-envelope-flap" />
            <div className="letter-wax-seal">
              <Heart size={20} className="fill-current" />
            </div>
            <div className="letter-envelope-body">
              <span className="envelope-to">Tertuju Untuk:</span>
              <span className="envelope-name">{c.name}</span>
              <span className="envelope-stamp">Buat kamu, dengan sayang</span>
            </div>
          </div>

          <button className="btn-modern-primary" onClick={handleStart}>
            <Sparkles size={16} />
            <span>Buka & Baca Surat ♡</span>
          </button>
        </div>
      ) : (
        /* Parchment Letter Stage */
        <div className="letter-paper-wrapper">
          {/* Page Progress Indicator */}
          <div className="letter-page-indicator">
            <span className="page-text">Bagian {page + 1} dari {totalPages}</span>
            <div className="page-dots">
              {Array.from({ length: totalPages }, (_, idx) => (
                <span
                  key={idx}
                  className={`dot ${idx === page ? "active" : ""}`}
                  onClick={() => setPage(idx)}
                />
              ))}
            </div>
          </div>

          {/* Parchment Sheet */}
          <div className="letter-parchment-sheet">
            <div className="parchment-gold-border" />
            <div className="parchment-corner top-left">✦</div>
            <div className="parchment-corner top-right">✦</div>
            <div className="parchment-corner bottom-left">✦</div>
            <div className="parchment-corner bottom-right">✦</div>

            <div className="parchment-content">
              <p className="letter-paragraph" key={page}>
                {c.letter[page]}
              </p>

              {/* Signature on the last page */}
              {isLastPage && (
                <div className="letter-signature-block">
                  <div className="sig-ornament">✧ ─── ♡ ─── ✧</div>
                  <div className="letter-signature">{c.signature}</div>
                  <div className="letter-postscript">Selalu & Selamanya</div>
                </div>
              )}
            </div>
          </div>

          {/* Letter Navigation Bar */}
          <div className="letter-nav-actions">
            <button
              className="btn-modern-ghost"
              style={{ visibility: page > 0 ? "visible" : "hidden" }}
              onClick={prevPage}
            >
              <ArrowLeft size={16} />
              <span>Halaman Sebelumnya</span>
            </button>

            {!isLastPage ? (
              <button className="btn-modern-primary" onClick={nextPage}>
                <span>Lanjut Membaca</span>
                <ArrowRight size={16} />
              </button>
            ) : (
              <button
                className="btn-modern-ghost"
                onClick={() => {
                  sfx.pop();
                  setPage(0);
                }}
              >
                <RotateCcw size={16} />
                <span>Baca Kembali Dari Awal</span>
              </button>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
