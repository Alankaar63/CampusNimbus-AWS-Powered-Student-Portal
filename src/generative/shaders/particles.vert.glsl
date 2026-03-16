uniform float uTime;
uniform float uSpeed;
uniform float uAudio;
uniform vec2 uPointer;
uniform vec2 uResolution;

attribute vec3 aSeed;
varying float vGlow;
varying vec3 vColor;

float hash(vec3 p) {
  return fract(sin(dot(p, vec3(17.13, 31.97, 43.71))) * 43758.5453);
}

vec3 flow(vec3 p) {
  float t = uTime * (0.24 + uSpeed * 0.12);
  float a = sin(p.x * 3.4 + t) + cos(p.z * 2.6 - t * 1.3);
  float b = sin(p.y * 2.9 - t * 0.8) + cos(p.x * 4.1 + t * 0.9);
  float c = sin(p.z * 3.1 + t * 1.2) + cos(p.y * 2.5 - t * 0.7);
  return vec3(a, b, c) * 0.23;
}

void main() {
  vec3 pos = aSeed;
  vec3 f = flow(pos + vec3(uPointer * 0.7, 0.0));

  float pulse = sin(uTime * (0.5 + uSpeed * 0.25) + dot(pos.xy, vec2(6.0, 4.0))) * 0.5 + 0.5;
  float audioLift = uAudio * 0.9;
  float sparkle = hash(pos * 25.0 + uTime) * 0.35;
  float swirl = sin(uTime * 0.35 + pos.z * 6.0) * 0.4;

  pos += f * (1.05 + uSpeed * 0.72);
  pos.xy += vec2(-pos.y, pos.x) * swirl * 0.045;
  pos += normalize(pos + 0.0001) * (pulse + sparkle) * (0.08 + audioLift * 0.28);

  vec4 mvPosition = modelViewMatrix * vec4(pos * 2.2, 1.0);
  gl_Position = projectionMatrix * mvPosition;

  float dist = length(mvPosition.xyz);
  gl_PointSize = (4.4 + 14.0 * (pulse + sparkle) + uAudio * 14.0) * (1.0 / max(dist, 0.1));

  vGlow = pulse + sparkle * 0.7;
  vColor = vec3(
    0.26 + 0.42 * pulse + uAudio * 0.45,
    0.44 + 0.28 * sin(pos.x * 10.0 + uTime * 0.5),
    0.72 + 0.3 * cos(pos.y * 8.6 - uTime * 0.45)
  );
}
