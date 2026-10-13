import { useCallback, useEffect, useRef, useState } from "react";
import { api } from "./api";
import type { Content, ViewId } from "./types";
import { Petals } from "./components";
import { AmbientCanvas } from "./components/AmbientCanvas";
import { Navbar } from "./components/Navbar";
import { MusicPlayer } from "./components/MusicPlayer";
import Opening from "./views/Opening";
import Home from "./views/Home";
import Memories from "./views/Memories";
import Reasons from "./views/Reasons";
import Letter from "./views/Letter";
import Surprise from "./views/Surprise";
import Wishes from "./views/Wishes";
import Final from "./views/Final";
import Admin from "./Admin";
import { Heart, Lock, Sparkles } from "lucide-react";
import { sfx } from "./utils/audio";

type Phase = "loading" | "locked" | "ready" | "error";

function Site() {
  const [phase, setPhase] = useState<Phase>("loading");
  const [c, setC] = useState<Content | null>(null);
  const [opened, setOpened] = useState<Set<number>>(new Set());
  const [view, setView] = useState<ViewId>("open");
  const [code, setCode] = useState("");
  const [codeErr, setCodeErr] = useState("");
  const [playing, setPlaying] = useState(false);
  const audio = useRef<HTMLAudioElement | null>(null);

  const load = useCallback(async () => {
    try {
      const r = await api.content();
      setC(r.content);
      setOpened(new Set(r.opened));
      setPhase("ready");
    } catch (e) {
      setPhase((e as { status?: number }).status === 401 ? "locked" : "error");
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const move = (e: PointerEvent) => {
      document.documentElement.style.setProperty("--mx", `${e.clientX}px`);
      document.documentElement.style.setProperty("--my", `${e.clientY}px`);
    };
    addEventListener("pointermove", move);
    return () => removeEventListener("pointermove", move);
  }, []);

  const go = (v: ViewId) => {
    setView(v);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const toggleMusic = () => {
    if (!c?.music) return;
    if (!audio.current) {
      audio.current = new Audio(c.music);
      audio.current.loop = true;
    }
    if (audio.current.paused) {
      audio.current
        .play()
        .then(() => setPlaying(true))
        .catch(() => {});
    } else {
      audio.current.pause();
      setPlaying(false);
    }
  };

  const onReason = (n: number) => {
    setOpened((s) => new Set(s).add(n));
    api.event("reason", n);
  };

  const submitCode = async () => {
    try {
      sfx.pop();
      await api.unlock(code);
      setCodeErr("");
      await load();
    } catch (e) {
      setCodeErr((e as Error).message);
    }
  };

  if (phase === "loading") {
    return (
      <main className="gate-modern">
        <div className="gate-card">
          <div className="gate-spinner">
            <Heart size={28} className="fill-rose text-rose animate-pulse" />
          </div>
          <p className="gate-loading-text">Menyiapkan dunia kecil untukmu…</p>
        </div>
      </main>
    );
  }

  if (phase === "error") {
    return (
      <main className="gate-modern">
        <div className="gate-card">
          <p className="gate-text">Terjadi kendala saat memuat halaman.</p>
          <button className="btn-modern-primary" onClick={() => location.reload()}>
            Muat Ulang Halaman
          </button>
        </div>
      </main>
    );
  }

  if (phase === "locked") {
    return (
      <main className="gate-modern">
        <div className="gate-card">
          <div className="gate-lock-icon">
            <Lock size={28} className="text-gold" />
          </div>
          <h1 className="gate-title">Khusus Untukmu ♡</h1>
          <p className="gate-text">Masukkan kode rahasia yang telah kuberikan.</p>

          <div className="gate-input-group">
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Masukkan kode akses…"
              className="gate-input"
              aria-label="Access code"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter") submitCode();
              }}
            />
            <button className="btn-modern-primary" onClick={submitCode}>
              <span>Buka</span>
              <Sparkles size={16} />
            </button>
          </div>

          {codeErr && <p className="gate-error" role="alert">{codeErr}</p>}
        </div>
      </main>
    );
  }

  if (!c) return null;

  return (
    <>
      {/* Dynamic Ambient Background Illumination */}
      <div className="glow-interactive" />
      <div className="ambient-orb orb-1" />
      <div className="ambient-orb orb-2" />
      <div className="ambient-orb orb-3" />

      {/* Floating Canvas Stardust & Petals */}
      <AmbientCanvas />
      <Petals />

      {/* Watermark 21 in background */}
      <div className="wm-chapter" aria-hidden="true">
        21
      </div>

      {/* Modern Floating Header Navigation */}
      <Navbar
        currentView={view}
        onNavigate={go}
        visible={view !== "open" && view !== "fin"}
        name={c.name}
      />

      {/* Main View Router */}
      <main className="main-viewport">
        {view === "open" && (
          <Opening
            c={c}
            onOpen={() => {
              go("home");
              api.event("visit");
              if (c.music && !playing) {
                // Try initiating audio on gesture
                if (!audio.current) {
                  audio.current = new Audio(c.music);
                  audio.current.loop = true;
                }
                audio.current.play().then(() => setPlaying(true)).catch(() => {});
              }
            }}
          />
        )}
        {view === "home" && <Home c={c} go={go} />}
        {view === "memories" && <Memories c={c} />}
        {view === "reasons" && <Reasons c={c} opened={opened} onOpen={onReason} />}
        {view === "letter" && <Letter c={c} onDone={() => api.event("letter_done")} />}
        {view === "surprise" && <Surprise c={c} go={go} onOpen={() => api.event("gift_opened")} />}
        {view === "wishes" && <Wishes c={c} go={go} />}
        {view === "fin" && <Final c={c} onHug={() => api.event("hug")} restart={() => go("open")} />}
      </main>

      {/* Floating Vinyl Music Widget */}
      <MusicPlayer
        playing={playing}
        onToggle={toggleMusic}
        hasTrack={!!c.music}
        trackName={`Melodi Spesial Untuk ${c.name.split(" ")[0]}`}
      />
    </>
  );
}

export default function App() {
  const [hash, setHash] = useState(location.hash);

  useEffect(() => {
    const handleHash = () => setHash(location.hash);
    addEventListener("hashchange", handleHash);
    return () => removeEventListener("hashchange", handleHash);
  }, []);

  return hash === "#admin" ? <Admin /> : <Site />;
}
