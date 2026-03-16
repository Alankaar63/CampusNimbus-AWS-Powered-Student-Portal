uniform sampler2D tDiffuse;
uniform float uTime;
uniform float uAmount;
uniform vec2 uPointer;
varying vec2 vUv;

float noise(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

void main() {
  vec2 uv = vUv;
  float n = noise(uv * 14.0 + uTime * 0.3);
  vec2 wave = vec2(sin(uv.y * 12.0 + uTime), cos(uv.x * 10.0 - uTime)) * 0.0035;
  vec2 pointer = uPointer * 0.004;
  uv += (wave + pointer) * uAmount + (n - 0.5) * 0.001;

  gl_FragColor = texture2D(tDiffuse, uv);
}
