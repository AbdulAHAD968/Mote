import { FRAGMENT_SHADER, VERTEX_SHADER, modeOf, type AnimationId } from "./shaders";

export const THREE_VERSION = "0.186.0";

export type ExportFormat = "html" | "react";

export type ExportInput = {
  data: string;
  count: number;
  animation: AnimationId;
  size: number;
  tint: string | null;
};

// Plain JS (no backticks or template placeholders) shared by both formats.
const CORE = `function createMote(canvas) {
  const bytes = Uint8Array.from(atob(DATA), (c) => c.charCodeAt(0));
  const xy = new Int16Array(bytes.buffer, 0, COUNT * 2);
  const positions = new Float32Array(COUNT * 3);
  const colors = new Float32Array(COUNT * 3);
  const seeds = new Float32Array(COUNT);
  for (let i = 0; i < COUNT; i++) {
    positions[i * 3] = xy[i * 2] / 30000;
    positions[i * 3 + 1] = xy[i * 2 + 1] / 30000;
    colors[i * 3] = bytes[COUNT * 4 + i * 3] / 255;
    colors[i * 3 + 1] = bytes[COUNT * 4 + i * 3 + 1] / 255;
    colors[i * 3 + 2] = bytes[COUNT * 4 + i * 3 + 2] / 255;
    seeds[i] = Math.random();
  }

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 50);
  const halfTan = Math.tan((45 / 2) * (Math.PI / 180));

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("aColor", new THREE.BufferAttribute(colors, 3));
  geometry.setAttribute("aSeed", new THREE.BufferAttribute(seeds, 1));

  const material = new THREE.ShaderMaterial({
    vertexShader: VERTEX,
    fragmentShader: FRAGMENT,
    transparent: true,
    depthWrite: false,
    uniforms: {
      uTime: { value: 0 },
      uSize: { value: SIZE },
      uPR: { value: 1 },
      uMode: { value: MODE },
      uMouse: { value: new THREE.Vector2(9, 9) },
      uTint: { value: new THREE.Color(TINT || "#ffffff") },
      uUseTint: { value: TINT ? 1 : 0 },
    },
  });
  const points = new THREE.Points(geometry, material);
  points.frustumCulled = false;
  scene.add(points);

  const target = new THREE.Vector2(9, 9);
  let active = false;
  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

  function resize() {
    const w = canvas.clientWidth || 1;
    const h = canvas.clientHeight || 1;
    const pr = Math.min(window.devicePixelRatio || 1, 2);
    renderer.setPixelRatio(pr);
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.position.z = Math.max(3, 1.2 / (halfTan * Math.min(w / h, 1)));
    camera.updateProjectionMatrix();
    material.uniforms.uPR.value = pr;
  }
  const observer = new ResizeObserver(resize);
  observer.observe(canvas);
  resize();

  function onMove(e) {
    const r = canvas.getBoundingClientRect();
    const nx = ((e.clientX - r.left) / r.width) * 2 - 1;
    const ny = -(((e.clientY - r.top) / r.height) * 2 - 1);
    target.set(nx * halfTan * camera.position.z * camera.aspect, ny * halfTan * camera.position.z);
    active = true;
  }
  function onLeave() {
    active = false;
    target.set(9, 9);
  }
  canvas.addEventListener("pointermove", onMove);
  canvas.addEventListener("pointerleave", onLeave);

  const start = performance.now();
  let frame = 0;
  function tick() {
    frame = requestAnimationFrame(tick);
    material.uniforms.uTime.value = reduceMotion ? 4 : (performance.now() - start) / 1000;
    material.uniforms.uMouse.value.lerp(target, active ? 0.25 : 1);
    renderer.render(scene, camera);
  }
  tick();

  return () => {
    cancelAnimationFrame(frame);
    observer.disconnect();
    canvas.removeEventListener("pointermove", onMove);
    canvas.removeEventListener("pointerleave", onLeave);
    geometry.dispose();
    material.dispose();
    renderer.dispose();
  };
}`;

function constants({ data, count, animation, size, tint }: ExportInput) {
  return [
    `const COUNT = ${count};`,
    `const MODE = ${modeOf(animation)}; // ${animation}`,
    `const SIZE = ${size};`,
    `const TINT = ${tint ? JSON.stringify(tint) : "null"}; // null keeps the image colours`,
    `// ${count.toLocaleString("en-US")} particles: int16 x,y pairs, then uint8 r,g,b, base64-encoded`,
    `const DATA = "${data}";`,
    "const VERTEX = `" + VERTEX_SHADER.trim() + "`;",
    "const FRAGMENT = `" + FRAGMENT_SHADER.trim() + "`;",
  ].join("\n");
}

export function buildHtml(input: ExportInput) {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Particles made with Mote</title>
<style>
  html, body { margin: 0; height: 100%; background: #181715; }
  canvas { display: block; width: 100%; height: 100%; }
</style>
<script type="importmap">
  { "imports": { "three": "https://cdn.jsdelivr.net/npm/three@${THREE_VERSION}/build/three.module.js" } }
</script>
</head>
<body>
<canvas id="mote"></canvas>
<script type="module">
import * as THREE from "three";

${constants(input)}

${CORE}

createMote(document.getElementById("mote"));
</script>
</body>
</html>
`;
}

export function buildReact(input: ExportInput) {
  return `"use client";

// npm install three
import { useEffect, useRef } from "react";
import * as THREE from "three";

${constants(input)}

${CORE}

export default function MoteParticles({ className }) {
  const ref = useRef(null);
  useEffect(() => createMote(ref.current), []);
  return (
    <canvas
      ref={ref}
      className={className}
      style={{ display: "block", width: "100%", height: "100%" }}
    />
  );
}
`;
}

export function buildExport(format: ExportFormat, input: ExportInput) {
  return format === "html" ? buildHtml(input) : buildReact(input);
}

export const EXPORT_FILENAMES: Record<ExportFormat, string> = {
  html: "mote-particles.html",
  react: "MoteParticles.jsx",
};
