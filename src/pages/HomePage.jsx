import { useEffect, useRef, useState } from "react";
import { m } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Link } from "react-router-dom";
import SiteHeader from "../components/site/SiteHeader";
import VideoBackdrop from "../components/site/VideoBackdrop";
import useBackgroundAudio from "../hooks/useBackgroundAudio";

gsap.registerPlugin(ScrollTrigger);

export default function HomePage() {
  const videoRef = useRef(null);
  const [videoPlaying] = useState(true);
  const { musicOn, toggleMusic } = useBackgroundAudio();

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.to(".home-hero-title", {
        y: -80,
        opacity: 0.72,
        scrollTrigger: {
          trigger: ".home-hero",
          start: "top top",
          end: "bottom top",
          scrub: true,
        },
      });

      gsap.fromTo(
        ".home-panel",
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          stagger: 0.12,
          duration: 0.8,
          ease: "power3.out",
          scrollTrigger: {
            trigger: ".home-grid",
            start: "top 82%",
          },
        },
      );
    });

    return () => {
      ctx.revert();
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, []);

  return (
    <div className="cinema-page">
      <VideoBackdrop
        src="/media/hero.mp4"
        poster={null}
        isPlaying={videoPlaying}
        videoRef={videoRef}
      />
      <SiteHeader />

      <section className="home-hero">
        <m.p className="home-kicker" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          SIU Digital Experience
        </m.p>

        <m.h2
          className="home-uni-title"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12, duration: 0.7 }}
        >
          Symbiosis International University Student Portal
        </m.h2>

        <m.p
          className="home-sub"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          Add your own college or movie footage in the background and run the entire
          SIU portal flow with role-based access.
        </m.p>

        <div className="home-cta-row">
          <a
            href="https://www.siu.edu.in/"
            target="_blank"
            rel="noreferrer"
            className="home-btn primary"
            data-cursor="hover"
          >
            About Us
          </a>
          <Link to="/campus" className="home-btn" data-cursor="hover">
            Campus Life
          </Link>
          <Link to="/siu-portal" className="home-btn" data-cursor="hover">
            Open SIU Portal
          </Link>
        </div>

        <div className="home-media-controls">
          <button className="home-btn" type="button" onClick={() => { void toggleMusic(); }} data-cursor="hover">
            {musicOn ? "Music Off" : "Music On"}
          </button>
        </div>
      </section>

      <section className="home-grid">
        <a
          href="https://www.siu.edu.in/"
          target="_blank"
          rel="noreferrer"
          className="home-panel home-panel-link"
          data-cursor="hover"
        >
          <h3>About Us</h3>
        </a>
        <Link to="/campus" className="home-panel home-panel-link" data-cursor="hover">
          <h3>Campus Life</h3>
        </Link>
        <Link to="/siu-portal" className="home-panel home-panel-link" data-cursor="hover">
          <h3>SIU Portal</h3>
        </Link>
      </section>
    </div>
  );
}
