import { useEffect, useState } from "react";

export default function VideoBackdrop({
  src,
  poster = "/campus/hero.jpg",
  overlay = true,
  className = "",
  isPlaying = true,
  muted = true,
  videoRef = null,
}) {
  const [failed, setFailed] = useState(false);
  const resolvedPoster = poster === null ? undefined : poster || "/campus/hero.jpg";

  useEffect(() => {
    const el = videoRef?.current;
    if (!el) return;

    if (isPlaying) {
      const p = el.play();
      if (p && typeof p.catch === "function") p.catch(() => {});
    } else {
      el.pause();
    }
  }, [isPlaying, src, videoRef]);

  return (
    <div className={`video-backdrop ${className}`} aria-hidden="true">
      {!failed ? (
        <video
          ref={videoRef}
          className="video-element"
          autoPlay
          muted={muted}
          loop
          playsInline
          preload="auto"
          poster={resolvedPoster}
          onError={() => setFailed(true)}
        >
          <source src={src} type="video/mp4" />
        </video>
      ) : (
        resolvedPoster ? <img className="video-fallback" src={resolvedPoster} alt="background" /> : <div className="video-fallback-solid" />
      )}
      {overlay ? <div className="video-overlay" /> : null}
    </div>
  );
}
