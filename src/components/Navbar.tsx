import { useState } from "react";
import {
  Camera,
  Gift,
  Heart,
  Home,
  Mail,
  Menu,
  Sparkles,
  Stars,
  X,
} from "lucide-react";
import { NAV, type ViewId } from "../types";
import { sfx } from "../utils/audio";

interface NavbarProps {
  currentView: ViewId;
  onNavigate: (view: ViewId) => void;
  visible: boolean;
  name: string;
}

const VIEW_ICONS: Record<string, React.ReactNode> = {
  home: <Home size={14} />,
  memories: <Camera size={14} />,
  reasons: <Heart size={14} />,
  letter: <Mail size={14} />,
  surprise: <Gift size={14} />,
  wishes: <Stars size={14} />,
};

export function Navbar({ currentView, onNavigate, visible, name }: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  if (!visible) return null;

  const handleNav = (id: ViewId) => {
    sfx.pop();
    onNavigate(id);
    setMobileOpen(false);
  };

  return (
    <header className="modern-nav-wrapper">
      <nav className="modern-nav-pill">
        {/* Brand / Chapter 21 Emblem */}
        <button
          className="nav-brand"
          onClick={() => handleNav("home")}
          aria-label="Kembali ke beranda"
        >
          <span className="brand-badge">21</span>
          <span className="brand-name">
            {name.split(" ")[0]}
            <Sparkles size={11} className="brand-sparkle" />
          </span>
        </button>

        {/* Desktop Links */}
        <div className="nav-links-desktop">
          {NAV.map((item) => {
            const isCur = currentView === item.id;
            return (
              <button
                key={item.id}
                className={`nav-tab-btn ${isCur ? "is-active" : ""}`}
                onClick={() => handleNav(item.id)}
              >
                <span className="tab-icon">{VIEW_ICONS[item.id]}</span>
                <span className="tab-label">{item.label}</span>
                {isCur && <span className="tab-glow" />}
              </button>
            );
          })}
        </div>

        {/* Mobile Hamburger Button */}
        <button
          className="nav-mobile-toggle"
          onClick={() => {
            sfx.pop();
            setMobileOpen(!mobileOpen);
          }}
          aria-label={mobileOpen ? "Tutup menu navigasi" : "Buka menu navigasi"}
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </nav>

      {/* Mobile Drawer Backdrop & Menu */}
      {mobileOpen && (
        <div
          className="nav-mobile-backdrop"
          onClick={() => setMobileOpen(false)}
        >
          <div
            className="nav-mobile-menu"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mobile-menu-header">
              <div className="mobile-menu-title">
                <span className="brand-badge small">21</span>
                <span>Untuk {name}</span>
              </div>
              <button
                className="close-mobile-btn"
                onClick={() => setMobileOpen(false)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="mobile-links-list">
              {NAV.map((item) => {
                const isCur = currentView === item.id;
                return (
                  <button
                    key={item.id}
                    className={`mobile-tab-btn ${isCur ? "is-active" : ""}`}
                    onClick={() => handleNav(item.id)}
                  >
                    <span className="mobile-tab-icon">{VIEW_ICONS[item.id]}</span>
                    <span className="mobile-tab-text">{item.label}</span>
                    {isCur && <span className="active-dot">●</span>}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
