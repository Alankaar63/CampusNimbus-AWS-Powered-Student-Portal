import SiteHeader from "../components/site/SiteHeader";
import VideoBackdrop from "../components/site/VideoBackdrop";
import { getLoginUrl } from "../lib/auth";
import useBackgroundAudio from "../hooks/useBackgroundAudio";

export default function SIUPortalPage() {
  const { musicOn, toggleMusic } = useBackgroundAudio();

  return (
    <div className="cinema-page">
      <VideoBackdrop src="/media/portal.mp4" poster={null} />
      <SiteHeader />

      <section className="content-shell portal-shell">
        <h1>SIU Portal Access</h1>
        <p>Enter your user credentials via Cognito to access your academic information.</p>

        <div className="portal-form">
          <div className="home-cta-row">
            <button
              className="home-btn primary"
              type="button"
              data-cursor="hover"
              onClick={() => {
                window.location.href = getLoginUrl();
              }}
            >
              Login via Cognito
            </button>
            <button className="home-btn" type="button" data-cursor="hover" onClick={() => { void toggleMusic(); }}>
              {musicOn ? "Music Off" : "Music On"}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
