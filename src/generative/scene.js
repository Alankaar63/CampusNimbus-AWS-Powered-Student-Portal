import * as THREE from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";

import particlesVert from "./shaders/particles.vert.glsl?raw";
import particlesFrag from "./shaders/particles.frag.glsl?raw";
import fullscreenVert from "./shaders/fullscreen.vert.glsl?raw";
import chromaticFrag from "./shaders/chromatic.frag.glsl?raw";
import distortFrag from "./shaders/distort.frag.glsl?raw";
import ditherFrag from "./shaders/dither.frag.glsl?raw";

export class GenerativeScene {
  constructor({ container }) {
    this.container = container;
    this.pointer = new THREE.Vector2(0, 0);
    this.speed = 1;
    this.targetSpeed = 1;

    this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.7));
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    this.renderer.setClearColor(0x050913, 1);
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    container.appendChild(this.renderer.domElement);

    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.Fog(0x050913, 8, 20);

    this.camera = new THREE.PerspectiveCamera(
      46,
      container.clientWidth / Math.max(container.clientHeight, 1),
      0.1,
      100,
    );
    this.camera.position.set(0, 0, 7.5);

    this.clock = new THREE.Clock();

    this._buildBackground();
    this._buildParticles();
    this._buildPostProcessing();

    window.addEventListener("resize", this.resize);
  }

  _buildBackground() {
    const starCount = 2200;
    const arr = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i += 1) {
      const i3 = i * 3;
      arr[i3] = (Math.random() - 0.5) * 25;
      arr[i3 + 1] = (Math.random() - 0.5) * 14;
      arr[i3 + 2] = -Math.random() * 15;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(arr, 3));
    const mat = new THREE.PointsMaterial({ color: 0x6d8dff, size: 0.03, transparent: true, opacity: 0.65 });

    this.starfield = new THREE.Points(geo, mat);
    this.scene.add(this.starfield);
  }

  _buildParticles() {
    const count = 24000;
    const seeds = new Float32Array(count * 3);

    for (let i = 0; i < count; i += 1) {
      const i3 = i * 3;
      const r = Math.pow(Math.random(), 0.6) * 1.3;
      const a = Math.random() * Math.PI * 2;
      const b = (Math.random() - 0.5) * Math.PI;
      seeds[i3] = Math.cos(a) * Math.cos(b) * r;
      seeds[i3 + 1] = Math.sin(b) * r;
      seeds[i3 + 2] = Math.sin(a) * Math.cos(b) * r;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("aSeed", new THREE.BufferAttribute(seeds, 3));

    this.uniforms = {
      uTime: { value: 0 },
      uSpeed: { value: 1 },
      uAudio: { value: 0 },
      uPointer: { value: new THREE.Vector2(0, 0) },
      uResolution: { value: new THREE.Vector2(this.container.clientWidth, this.container.clientHeight) },
    };

    const material = new THREE.ShaderMaterial({
      uniforms: this.uniforms,
      vertexShader: particlesVert,
      fragmentShader: particlesFrag,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    this.points = new THREE.Points(geometry, material);
    this.scene.add(this.points);
  }

  _buildPostProcessing() {
    this.composer = null;
    this.bloomPass = null;
    this.chromaticPass = null;
    this.distortPass = null;
    this.ditherPass = null;

    try {
      this.composer = new EffectComposer(this.renderer);
      this.composer.addPass(new RenderPass(this.scene, this.camera));

      this.bloomPass = new UnrealBloomPass(
        new THREE.Vector2(this.container.clientWidth, this.container.clientHeight),
        0.95,
        0.5,
        0.4,
      );
      this.composer.addPass(this.bloomPass);

      this.chromaticPass = new ShaderPass({
        uniforms: {
          tDiffuse: { value: null },
          uResolution: { value: new THREE.Vector2(this.container.clientWidth, this.container.clientHeight) },
          uAmount: { value: 0.8 },
        },
        vertexShader: fullscreenVert,
        fragmentShader: chromaticFrag,
      });

      this.distortPass = new ShaderPass({
        uniforms: {
          tDiffuse: { value: null },
          uTime: { value: 0 },
          uAmount: { value: 0.42 },
          uPointer: { value: new THREE.Vector2() },
        },
        vertexShader: fullscreenVert,
        fragmentShader: distortFrag,
      });

      this.ditherPass = new ShaderPass({
        uniforms: {
          tDiffuse: { value: null },
          uResolution: { value: new THREE.Vector2(this.container.clientWidth, this.container.clientHeight) },
          uStrength: { value: 0.08 },
          uTime: { value: 0 },
          uAudio: { value: 0 },
        },
        vertexShader: fullscreenVert,
        fragmentShader: ditherFrag,
      });

      this.composer.addPass(this.chromaticPass);
      this.composer.addPass(this.distortPass);
      this.composer.addPass(this.ditherPass);
    } catch (err) {
      console.warn("Post-processing disabled due to GPU/shader incompatibility:", err);
      this.composer = null;
    }
  }

  setPointer(nx, ny) {
    this.pointer.set(nx, ny);
  }

  setBoost(pressed) {
    this.targetSpeed = pressed ? 2.4 : 1;
  }

  update(audioLevel = 0) {
    const t = this.clock.getElapsedTime();
    this.speed += (this.targetSpeed - this.speed) * 0.1;

    this.uniforms.uTime.value = t;
    this.uniforms.uSpeed.value = this.speed;
    this.uniforms.uAudio.value = audioLevel;
    this.uniforms.uPointer.value.lerp(this.pointer, 0.12);

    if (this.starfield) {
      this.starfield.rotation.y = t * 0.015;
      this.starfield.rotation.x = Math.sin(t * 0.11) * 0.04;
    }

    if (this.distortPass && this.chromaticPass && this.bloomPass && this.ditherPass) {
      this.distortPass.uniforms.uTime.value = t;
      this.distortPass.uniforms.uAmount.value = 0.34 + this.speed * 0.2 + audioLevel * 0.8;
      this.distortPass.uniforms.uPointer.value.copy(this.uniforms.uPointer.value);

      this.chromaticPass.uniforms.uAmount.value = 0.45 + audioLevel * 2.4;
      this.bloomPass.strength = 0.72 + audioLevel * 1.8;
      this.bloomPass.radius = 0.38 + audioLevel * 0.2;

      this.ditherPass.uniforms.uTime.value = t;
      this.ditherPass.uniforms.uAudio.value = audioLevel;
      this.ditherPass.uniforms.uStrength.value = 0.06 + audioLevel * 0.07;
    }

    if (this.composer) this.composer.render();
    else this.renderer.render(this.scene, this.camera);
  }

  getSpeed() {
    return this.speed;
  }

  resize = () => {
    const w = this.container.clientWidth;
    const h = this.container.clientHeight;

    this.renderer.setSize(w, h);
    this.camera.aspect = w / Math.max(h, 1);
    this.camera.updateProjectionMatrix();

    this.uniforms.uResolution.value.set(w, h);
    if (this.chromaticPass) this.chromaticPass.uniforms.uResolution.value.set(w, h);
    if (this.ditherPass) this.ditherPass.uniforms.uResolution.value.set(w, h);
    if (this.composer) this.composer.setSize(w, h);
  };

  dispose() {
    window.removeEventListener("resize", this.resize);

    if (this.points) {
      this.points.geometry.dispose();
      this.points.material.dispose();
    }

    if (this.starfield) {
      this.starfield.geometry.dispose();
      this.starfield.material.dispose();
    }

    if (this.composer) this.composer.dispose();
    this.renderer.dispose();

    if (this.renderer.domElement.parentNode === this.container) {
      this.container.removeChild(this.renderer.domElement);
    }
  }
}
