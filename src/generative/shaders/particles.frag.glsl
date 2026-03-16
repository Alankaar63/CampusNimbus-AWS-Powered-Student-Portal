precision highp float;

varying float vGlow;
varying vec3 vColor;

void main() {
  vec2 uv = gl_PointCoord - 0.5;
  float d = length(uv);

  float core = smoothstep(0.25, 0.0, d);
  float halo = smoothstep(0.55, 0.12, d);
  float alpha = max(core, halo * 0.6);

  vec3 color = mix(vColor * 0.6, vColor * 1.4, core + vGlow * 0.3);
  gl_FragColor = vec4(color, alpha);
}
