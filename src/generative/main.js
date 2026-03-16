import gsap from "gsap";
import { GenerativeScene } from "./scene";
import { AudioController } from "./audio";

export function createGenerativeArt({
  mount,
  audioElement,
  onSpeed,
  onState,
}) {
  const scene = new GenerativeScene({ container: mount });
  const audio = new AudioController(audioElement);

  let running = false;
  let raf = null;

  const pointerMove = (e) => {
    const rect = mount.getBoundingClientRect();
    const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const ny = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
    scene.setPointer(nx, ny);
  };

  const down = () => scene.setBoost(true);
  const up = () => scene.setBoost(false);

  const tick = () => {
    if (!running) return;
    const audioLevel = audio.updateLevel();
    scene.update(audioLevel);

    if (onSpeed) onSpeed(scene.getSpeed());
    raf = window.requestAnimationFrame(tick);
  };

  const start = () => {
    if (running) return;
    running = true;
    gsap.fromTo(
      mount,
      { opacity: 0 },
      { opacity: 1, duration: 0.8, ease: "power2.out" },
    );
    tick();
  };

  const stop = () => {
    running = false;
    if (raf) window.cancelAnimationFrame(raf);
  };

  const toggleAudio = async () => {
    const enabled = await audio.toggleAudioPlayback();
    if (onState) onState(enabled);
    return enabled;
  };

  mount.addEventListener("mousemove", pointerMove);
  mount.addEventListener("mousedown", down);
  window.addEventListener("mouseup", up);

  return {
    start,
    stop,
    toggleAudio,
    dispose() {
      stop();
      mount.removeEventListener("mousemove", pointerMove);
      mount.removeEventListener("mousedown", down);
      window.removeEventListener("mouseup", up);
      scene.dispose();
    },
  };
}
