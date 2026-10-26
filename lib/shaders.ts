// Shared by the live preview and the exported code, so both always look identical.

export type AnimationId =
  | "assemble"
  | "float"
  | "wave"
  | "repel"
  | "magnet"
  | "swirl"
  | "swing"
  | "pulse"
  | "ripple"
  | "sparkle";

export const ANIMATIONS: { id: AnimationId; label: string; hint: string; mode: number }[] = [
  { id: "assemble", label: "Assemble", hint: "Particles scatter and fly back into shape", mode: 0 },
  { id: "float", label: "Float", hint: "A gentle, breathing drift", mode: 1 },
  { id: "wave", label: "Wave", hint: "A ripple travels across the image", mode: 2 },
  { id: "repel", label: "Repel", hint: "Particles nudge away from your cursor", mode: 3 },
  { id: "magnet", label: "Magnet", hint: "Particles lean toward your cursor", mode: 8 },
  { id: "swirl", label: "Swirl", hint: "The center twists back and forth", mode: 4 },
  { id: "swing", label: "Swing", hint: "The image swings in 3D like a hanging sign", mode: 5 },
  { id: "pulse", label: "Pulse", hint: "A heartbeat that radiates outward", mode: 6 },
  { id: "ripple", label: "Ripple", hint: "Rings spread out from the center", mode: 7 },
  { id: "sparkle", label: "Sparkle", hint: "Particles twinkle like stars", mode: 9 },
];

export const modeOf = (id: AnimationId) => ANIMATIONS.find((a) => a.id === id)!.mode;

export const VERTEX_SHADER = `
attribute vec3 aColor;
attribute float aSeed;
uniform float uTime;
uniform float uSize;
uniform float uPR;
uniform float uMode;
uniform vec2 uMouse;
uniform vec3 uTint;
uniform float uUseTint;
varying vec3 vColor;

void main() {
  vec3 p = position;
  float s = aSeed;
  float t = uTime;
  float r = length(p.xy);
  float sizeMul = 1.0;
  vec3 offset = vec3(0.0);

  if (uMode < 0.5) {
    // 0 assemble: scatter -> form -> hold -> scatter, looping every 9s
    float cycle = mod(t, 9.0);
    float formIn = smoothstep(0.0, 2.5, cycle - s);
    float formOut = smoothstep(6.5 + s * 0.8, 8.5, cycle);
    float f = formIn * (1.0 - formOut);
    vec3 scatter = vec3(cos(s * 43.98), sin(s * 81.68), sin(s * 31.4)) * (1.2 + s * 2.2);
    float k = 1.0 - f;
    offset = scatter * k * k;
  } else if (uMode < 1.5) {
    // 1 float
    offset = vec3(sin(t * 0.6 + s * 40.0), cos(t * 0.5 + s * 23.0), sin(t * 0.4 + s * 11.0)) * 0.03;
  } else if (uMode < 2.5) {
    // 2 wave
    offset.z = sin(p.x * 4.0 + t * 2.0) * 0.12;
    offset.y = cos(p.x * 3.0 + t * 2.0) * 0.03;
  } else if (uMode < 3.5) {
    // 3 repel: a small, soft push right around the cursor
    float d = distance(p.xy, uMouse);
    float f = smoothstep(0.22, 0.0, d);
    vec2 dir = normalize(p.xy - uMouse + vec2(0.0001));
    offset.xy = dir * f * f * 0.1;
    offset.z = f * (s - 0.5) * 0.12;
    offset += vec3(sin(t * 0.6 + s * 40.0), cos(t * 0.5 + s * 23.0), 0.0) * 0.006;
  } else if (uMode < 4.5) {
    // 4 swirl: twist that is strongest in the middle
    float a = sin(t * 0.8) * 0.9 * (1.0 - min(r, 1.0));
    float c = cos(a);
    float sn = sin(a);
    offset.xy = vec2(p.x * c - p.y * sn, p.x * sn + p.y * c) - p.xy;
  } else if (uMode < 5.5) {
    // 5 swing: rotate around the vertical axis
    float a = sin(t * 0.7) * 0.9;
    offset.x = p.x * (cos(a) - 1.0);
    offset.z = -p.x * sin(a);
  } else if (uMode < 6.5) {
    // 6 pulse: heartbeat that travels outward
    offset.xy = p.xy * (0.07 * sin(t * 2.2 - r * 2.5));
    offset.z = 0.05 * sin(t * 2.2 - r * 2.5);
  } else if (uMode < 7.5) {
    // 7 ripple: rings spreading from the center
    float w = sin(r * 12.0 - t * 3.0);
    offset.z = w * 0.08;
    offset.xy = normalize(p.xy + vec2(0.0001)) * w * 0.012;
  } else if (uMode < 8.5) {
    // 8 magnet: lean toward the cursor
    float d = distance(p.xy, uMouse);
    float f = smoothstep(0.4, 0.0, d);
    offset.xy = (uMouse - p.xy) * f * 0.45;
    offset.z = f * 0.12;
  } else {
    // 9 sparkle: twinkle in size
    float tw = 0.5 + 0.5 * sin(t * (1.0 + s * 3.0) + s * 60.0);
    sizeMul = 0.35 + 1.5 * tw * tw * tw;
    offset = vec3(sin(t * 0.5 + s * 40.0), cos(t * 0.4 + s * 23.0), 0.0) * 0.01;
  }

  vec4 mv = modelViewMatrix * vec4(p + offset, 1.0);
  gl_Position = projectionMatrix * mv;
  gl_PointSize = uSize * uPR * sizeMul * (3.0 / -mv.z);
  vColor = mix(aColor, uTint, uUseTint);
}
`;

export const FRAGMENT_SHADER = `
varying vec3 vColor;
void main() {
  float d = length(gl_PointCoord - 0.5);
  if (d > 0.5) discard;
  gl_FragColor = vec4(vColor, smoothstep(0.5, 0.2, d));
}
`;
