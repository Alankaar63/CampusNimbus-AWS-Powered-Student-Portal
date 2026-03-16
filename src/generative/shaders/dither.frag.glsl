uniform sampler2D tDiffuse;
uniform vec2 uResolution;
uniform float uStrength;
uniform float uTime;
uniform float uAudio;
varying vec2 vUv;

float bayer(vec2 p) {
  vec2 f = mod(p, 4.0);
  float x = f.x;
  float y = f.y;
  float idx = x + y * 4.0;

  if (idx == 0.0) return 0.0;
  if (idx == 1.0) return 8.0;
  if (idx == 2.0) return 2.0;
  if (idx == 3.0) return 10.0;
  if (idx == 4.0) return 12.0;
  if (idx == 5.0) return 4.0;
  if (idx == 6.0) return 14.0;
  if (idx == 7.0) return 6.0;
  if (idx == 8.0) return 3.0;
  if (idx == 9.0) return 11.0;
  if (idx == 10.0) return 1.0;
  if (idx == 11.0) return 9.0;
  if (idx == 12.0) return 15.0;
  if (idx == 13.0) return 7.0;
  if (idx == 14.0) return 13.0;
  return 5.0;
}

float grain(vec2 uv) {
  return fract(sin(dot(uv * 1.3 + uTime * 0.07, vec2(12.9898, 78.233))) * 43758.5453);
}

void main() {
  vec4 color = texture2D(tDiffuse, vUv);

  // Posterize to emulate limited tonal steps from dithered displays.
  float levels = 6.0 + floor(uAudio * 6.0);
  color.rgb = floor(color.rgb * levels) / levels;

  float threshold = (bayer(gl_FragCoord.xy) / 16.0 - 0.5) * uStrength;
  float film = (grain(gl_FragCoord.xy / uResolution.xy) - 0.5) * (0.09 + uAudio * 0.15);

  color.rgb += threshold + film;

  // Soft vignette for cinematic framing.
  vec2 centered = vUv * 2.0 - 1.0;
  float vignette = smoothstep(1.25, 0.25, dot(centered, centered));
  color.rgb *= mix(0.72, 1.0, vignette);

  gl_FragColor = color;
}
