import { useState } from "react";
import { Heart, RotateCcw, Sparkles } from "lucide-react";
import type { Content } from "../types";
import { triggerGrandFireworks } from "../components";
import { sfx } from "../utils/audio";

export default function Final({
  c,
  onHug,
  restart,
}: {
  c: Content;
  onHug: () => void;
  restart: () => void;
}) {
  const [hearts, setHearts] = useState<
    { id: number; left: number; delay: number; size: number }[]
  >([]);
  const [hugged, setHugged] = useState(false);

  const handleHug = () => {
    sfx.sparkle();
    const base = Date.now();
    setHearts(
      Array.from({ length: 32 }, (_, i) => ({
        id: base + i,
        left: (i * 31 + 5) % 94,
        delay: (i % 10) * 0.12,
        size: 18 + ((i * 11) % 26),
      })),
    );
    setHugged(true);
    onHug();
    triggerGrandFireworks();

    setTimeout(() => setHearts([]), 5000);
  };

  return (
    <section id="fin" className="view on final-view">
      <div className="final-container">
        {/* Emblem */}
        <div className="final-emblem">
          <span className="emblem-line" />
          <div className="emblem-badge">
            <Heart size={16} className="fill-rose text-rose" />
            <span>Dengan sayang</span>
            <Sparkles size={14} className="text-gold" />
          </div>
          <span className="emblem-line" />
        </div>

        {/* Heading */}
        <h1 className="final-heading">
          Dari sekian banyak orang di dunia,<br />
          <span className="italic-serif text-gradient">
            aku senang kenal kamu.
          </span>
        </h1>

        {/* Description */}
        <p className="final-body-text">
          Selamat ulang tahun ke-21, {c.name}. Makasih sudah jadi bagian dari hidupku. Semoga tahun ini banyak hal baik datang buat kamu.
        </p>

        {/* Primary Hug Button */}
        <div className="final-hug-action">
          <button
            className={`btn-grand-hug ${hugged ? "is-hugged" : ""}`}
            onClick={handleHug}
          >
            <span className="hug-pulse-ring" />
            <Heart size={22} className="fill-current" />
            <span>{hugged ? "Kirim Pelukan Lagi ♡" : "Kirim Pelukan Terhangat ♡"}</span>
          </button>
        </div>

        {/* Revealed Hug Message Card */}
        {hugged && (
          <div className="final-hug-card" aria-live="polite">
            <div className="hug-card-seal">
              <Heart size={20} className="fill-gold text-gold" />
            </div>
            <p className="hug-card-message">{c.hugMsg}</p>
            <div className="hug-card-sub">
              <span>Selamat ulang tahun ke-21, Zahwa!</span>
            </div>
          </div>
        )}

        {/* Restart Action */}
        {hugged && (
          <div className="final-restart-block">
            <button
              className="btn-modern-ghost"
              onClick={() => {
                sfx.pop();
                restart();
              }}
            >
              <RotateCcw size={15} />
              <span>Kembali ke Halaman Pertama</span>
            </button>
          </div>
        )}
      </div>

      {/* Floating Animated Hearts */}
      {hearts.map((h) => (
        <div
          key={h.id}
          className="floating-burst-heart"
          style={{
            left: `${h.left}vw`,
            animationDelay: `${h.delay}s`,
            fontSize: `${h.size}px`,
          }}
        >
          ♡
        </div>
      ))}
    </section>
  );
}
