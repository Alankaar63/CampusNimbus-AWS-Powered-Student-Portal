export class AudioController {
  constructor(audioElement = null) {
    this.audioElement = audioElement;
    this.ctx = null;
    this.analyser = null;
    this.source = null;
    this.data = null;
    this.enabled = false;
    this.level = 0;
  }

  async initFromElement() {
    if (!this.audioElement) return;
    if (!this.ctx) this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    if (this.ctx.state === "suspended") await this.ctx.resume();

    if (!this.source) {
      this.source = this.ctx.createMediaElementSource(this.audioElement);
      this.analyser = this.ctx.createAnalyser();
      this.analyser.fftSize = 512;
      this.data = new Uint8Array(this.analyser.frequencyBinCount);

      this.source.connect(this.analyser);
      this.analyser.connect(this.ctx.destination);
    }
  }

  async initFromMic() {
    if (!this.ctx) this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    if (this.ctx.state === "suspended") await this.ctx.resume();

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
    const mic = this.ctx.createMediaStreamSource(stream);

    this.analyser = this.ctx.createAnalyser();
    this.analyser.fftSize = 512;
    this.data = new Uint8Array(this.analyser.frequencyBinCount);

    mic.connect(this.analyser);
  }

  async toggleAudioPlayback() {
    if (!this.audioElement) return false;

    if (this.enabled) {
      this.audioElement.pause();
      this.enabled = false;
      return false;
    }

    await this.initFromElement();
    this.audioElement.volume = 0.5;
    await this.audioElement.play();
    this.enabled = true;
    return true;
  }

  updateLevel() {
    if (!this.analyser || !this.data) {
      this.level *= 0.95;
      return this.level;
    }

    this.analyser.getByteFrequencyData(this.data);
    let sum = 0;
    for (let i = 0; i < this.data.length; i += 1) sum += this.data[i];
    const avg = (sum / this.data.length) / 255;

    this.level += (avg - this.level) * 0.12;
    return this.level;
  }
}
