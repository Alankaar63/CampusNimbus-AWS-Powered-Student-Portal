import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import BackgroundAudioContext from "./backgroundAudioContextObject";

export function BackgroundAudioProvider({ children }) {
  const audioRef = useRef(null);
  const [musicOn, setMusicOn] = useState(false);
  const defaultVolume = 0.42;

  const startMusic = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio) return false;

    try {
      audio.volume = defaultVolume;
      await audio.play();
      setMusicOn(true);
      return true;
    } catch {
      setMusicOn(false);
      return false;
    }
  }, []);

  const toggleMusic = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (musicOn) {
      audio.pause();
      setMusicOn(false);
      return;
    }

    await startMusic();
  }, [musicOn, startMusic]);

  useEffect(() => {
    const unlockOnFirstAction = async () => {
      if (musicOn) return;
      await startMusic();
    };

    window.addEventListener("pointerdown", unlockOnFirstAction, { once: true });
    window.addEventListener("keydown", unlockOnFirstAction, { once: true });

    return () => {
      window.removeEventListener("pointerdown", unlockOnFirstAction);
      window.removeEventListener("keydown", unlockOnFirstAction);
    };
  }, [musicOn, startMusic]);

  const value = useMemo(() => ({ musicOn, toggleMusic, startMusic }), [musicOn, toggleMusic, startMusic]);

  return (
    <BackgroundAudioContext.Provider value={value}>
      {children}
      <audio ref={audioRef} loop preload="auto">
        <source src="/media/theme.mp3" type="audio/mpeg" />
      </audio>
    </BackgroundAudioContext.Provider>
  );
}
