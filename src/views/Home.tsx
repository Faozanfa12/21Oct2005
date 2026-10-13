import { ArrowRight, BookOpen, Camera, Heart, Sparkles } from "lucide-react";
import type { Content, ViewId } from "../types";
import { Ph } from "../components";
import { sfx } from "../utils/audio";

export default function Home({ c, go }: { c: Content; go: (v: ViewId) => void }) {
  const a = c.memories[0]?.src;
  const b = c.memories[1]?.src;

  const navigateTo = (v: ViewId) => {
    sfx.pop();
    go(v);
  };

  return (
    <section className="view on home-view">
      <div className="home-container">
        {/* Left Column: Story & Warm Greetings */}
        <div className="home-story">
          <div className="eyebrow-pill">
            <Sparkles size={12} className="text-gold" />
            <span>Spesial Untuk {c.name}</span>
          </div>

          <h1 className="home-heading">
            Dunia Kecil,<br />
            <span className="italic-serif text-gradient">Dibuat Khusus Untukmu.</span>
          </h1>

          <div className="ornamental-divider">
            <span className="divider-line" />
            <Heart size={16} className="divider-heart" />
            <span className="divider-line" />
          </div>

          {/* Frosted Glass Message Card */}
          <div className="home-message-card">
            <div className="quote-mark">❝</div>
            <p className="home-message-text">{c.homeMsg}</p>
            <div className="quote-author">— Dari yang selalu mendoakanmu</div>
          </div>

          {/* Highlights / Quick Metric Cards */}
          <div className="home-features-grid">
            <div className="feature-card" onClick={() => navigateTo("memories")}>
              <div className="feature-icon-wrapper">
                <Camera size={18} />
              </div>
              <div>
                <div className="feature-num">{c.memories.length} Momen</div>
                <div className="feature-desc">Kenangan terindah bersama</div>
              </div>
            </div>

            <div className="feature-card" onClick={() => navigateTo("reasons")}>
              <div className="feature-icon-wrapper text-rose">
                <Heart size={18} />
              </div>
              <div>
                <div className="feature-num">21 Alasan</div>
                <div className="feature-desc">Hal manis yang kusyukuri</div>
              </div>
            </div>
          </div>

          {/* Action Navigation Buttons */}
          <div className="home-actions">
            <button
              className="btn-modern-primary"
              onClick={() => navigateTo("memories")}
            >
              <span>Jelajahi Kenangan Kita</span>
              <ArrowRight size={16} />
            </button>
            <button
              className="btn-modern-ghost"
              onClick={() => navigateTo("letter")}
            >
              <BookOpen size={16} />
              <span>Baca Surat Hatiku</span>
            </button>
          </div>
        </div>

        {/* Right Column: Layered 3D Polaroid Cards */}
        <div className="home-visual-column">
          <div className="polaroid-stack">
            {/* Top Right Photo */}
            <div className="polaroid-item polaroid-primary">
              <div className="washi-tape tape-top" />
              <div className="polaroid-frame">
                <Ph
                  src={a}
                  label="Momen 1"
                  className="polaroid-photo"
                  alt="Kenangan bersama"
                />
                <div className="polaroid-caption">
                  <span>{c.memories[0]?.cap || "Kenangan terindah bersamamu"}</span>
                  <Heart size={12} className="caption-heart fill-rose text-rose" />
                </div>
              </div>
            </div>

            {/* Bottom Left Photo */}
            <div className="polaroid-item polaroid-secondary">
              <div className="washi-tape tape-slanted" />
              <div className="polaroid-frame">
                <Ph
                  src={b}
                  label="Momen 2"
                  className="polaroid-photo"
                  alt="Kenangan kedua"
                />
                <div className="polaroid-caption">
                  <span>{c.memories[1]?.cap || "Senyum favoritku setiap hari"}</span>
                </div>
              </div>
            </div>

            {/* Glowing Ambient Card Backdrop */}
            <div className="polaroid-ambient-glow" />
          </div>
        </div>
      </div>
    </section>
  );
}
