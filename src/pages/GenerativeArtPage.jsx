import { useEffect, useRef, useState } from "react";
import { m } from "framer-motion";
import { Link } from "react-router-dom";
import { createGenerativeArt } from "../generative/main";

export default function GenerativeArtPage() {
  const mountRef = useRef(null);
  const audioRef = useRef(null);
  const engineRef = useRef(null);

  const [started, setStarted] = useState(true);
  const [speed, setSpeed] = useState(1);
  const [audioOn, setAudioOn] = useState(false);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return undefined;

    let engine = null;
    try {
      engine = createGenerativeArt({
        mount,
        audioElement: audioRef.current,
        onSpeed: (v) => setSpeed(v),
        onState: (v) => setAudioOn(v),
      });

      engineRef.current = engine;
      engine.start();
    } catch (err) {
      console.error("Generative scene failed to start:", err);
    }

    return () => {
      if (engine) engine.dispose();
      engineRef.current = null;
    };
  }, []);

  const start = () => {
    if (!engineRef.current) return;
    engineRef.current.start();
    setStarted(true);
  };

  const toggleAudio = async () => {
    if (!engineRef.current) return;
    await engineRef.current.toggleAudio();
  };

  return (
    <div className="gen-page">
      <div className="gen-fallback-gradient" />
      <div ref={mountRef} className="gen-canvas" />

      <audio ref={audioRef} loop preload="none">
        <source src="/media/theme.mp3" type="audio/mpeg" />
      </audio>

      <m.div
        className="gen-ui"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="gen-top-row">
          <h1>Astro Dither Lab</h1>
          <Link to="/about-us" className="gen-link">About SIU</Link>
        </div>

        <p className="gen-sub">Mouse move bends flow. Hold click for speed boost.</p>

        <div className="gen-controls">
          <button className="gen-btn primary" onClick={start} disabled={started}>
            {started ? "Simulation Running" : "Start"}
          </button>
          <button className="gen-btn" onClick={toggleAudio}>
            {audioOn ? "Toggle Audio: On" : "Toggle Audio: Off"}
          </button>
          <Link to="/campus" className="gen-btn">Campus</Link>
          <Link to="/siu-portal" className="gen-btn">SIU Portal</Link>
        </div>

        <div className="gen-speed">
          <span>Speed</span>
          <strong>{speed.toFixed(2)}x</strong>
        </div>
      </m.div>
    </div>
  );
}
