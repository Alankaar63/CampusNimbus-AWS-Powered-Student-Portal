uniform sampler2D tDiffuse;
uniform vec2 uResolution;
uniform float uAmount;
varying vec2 vUv;

void main() {
  vec2 texel = vec2(1.0) / uResolution;
  vec2 shift = texel * uAmount;

  float r = texture2D(tDiffuse, vUv + shift).r;
  float g = texture2D(tDiffuse, vUv).g;
  float b = texture2D(tDiffuse, vUv - shift).b;

  gl_FragColor = vec4(r, g, b, 1.0);
}
