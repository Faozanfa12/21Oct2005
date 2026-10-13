import { useState } from "react";
import { Disc, Music, Pause, Play, Volume2, VolumeX } from "lucide-react";

interface MusicPlayerProps {
  playing: boolean;
  onToggle: () => void;
  hasTrack: boolean;
  trackName?: string;
}

export function MusicPlayer({
  playing,
  onToggle,
  hasTrack,
  trackName = "Melodi Spesial Hari Ini",
}: MusicPlayerProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!hasTrack) return null;

  return (
    <div
      className={`music-widget ${playing ? "is-playing" : ""} ${isExpanded ? "is-expanded" : ""}`}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
    >
      <div className="music-pill">
        {/* Spinning Vinyl Record */}
        <div className="vinyl-wrapper">
          <div className={`vinyl ${playing ? "spin-continuous" : ""}`}>
            <Disc size={20} className="vinyl-icon" />
            <div className="vinyl-center" />
          </div>
        </div>

        {/* Dynamic sound equalizer bars */}
        <div className="sound-wave" aria-hidden="true">
          <span className={`wave-bar ${playing ? "active" : ""}`} />
          <span className={`wave-bar ${playing ? "active" : ""}`} />
          <span className={`wave-bar ${playing ? "active" : ""}`} />
          <span className={`wave-bar ${playing ? "active" : ""}`} />
        </div>

        {/* Track Title */}
        <div className="music-info">
          <span className="music-status">{playing ? "Memutar Suasana" : "Musik Latar"}</span>
          <span className="music-title">{trackName}</span>
        </div>

        {/* Play/Pause Button */}
        <button
          className="music-toggle-btn"
          onClick={onToggle}
          aria-label={playing ? "Jeda musik" : "Putar musik"}
          title={playing ? "Jeda musik" : "Putar musik"}
        >
          {playing ? <Pause size={15} /> : <Play size={15} className="ml-px" />}
        </button>
      </div>
    </div>
  );
}
