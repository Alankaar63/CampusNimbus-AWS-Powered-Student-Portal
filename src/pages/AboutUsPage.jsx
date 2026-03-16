import { useEffect } from "react";

export default function AboutUsPage() {
  useEffect(() => {
    window.location.href = "https://www.siu.edu.in/";
  }, []);

  return (
    <div className="cinema-page" style={{ display: "grid", placeItems: "center", minHeight: "100dvh" }}>
      <a className="home-btn primary" href="https://www.siu.edu.in/" target="_blank" rel="noreferrer">
        Open Official SIU Website
      </a>
    </div>
  );
}
