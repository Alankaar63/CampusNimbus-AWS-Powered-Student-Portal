import SiteHeader from "../components/site/SiteHeader";
import VideoBackdrop from "../components/site/VideoBackdrop";
import useBackgroundAudio from "../hooks/useBackgroundAudio";
import { MEDIA_CONFIG } from "../config";

export default function CampusPage() {
  const { musicOn, toggleMusic } = useBackgroundAudio();

  return (
    <div className="cinema-page campus-page">
      <VideoBackdrop src={MEDIA_CONFIG.campusVideoUrl} poster={null} />
      <SiteHeader />

      <button
        className="home-btn campus-music-btn"
        type="button"
        data-cursor="hover"
        onClick={() => { void toggleMusic(); }}
      >
        {musicOn ? "Music Off" : "Music On"}
      </button>
    </div>
  );
}
