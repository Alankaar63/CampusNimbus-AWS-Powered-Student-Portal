import { useContext } from "react";
import BackgroundAudioContext from "../context/backgroundAudioContextObject";

export default function useBackgroundAudio() {
  const ctx = useContext(BackgroundAudioContext);
  if (!ctx) {
    throw new Error("useBackgroundAudio must be used within BackgroundAudioProvider");
  }
  return ctx;
}
