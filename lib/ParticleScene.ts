import * as THREE from "three";
import type { ParticleField } from "./particles";
import { FRAGMENT_SHADER, VERTEX_SHADER, modeOf, type AnimationId } from "./shaders";

export type SceneOptions = {
  animation: AnimationId;
  size: number;
  /** hex colour, or null to keep the image's own colours */
  tint: string | null;
};

const FOV = 45;
const HALF_TAN = Math.tan((FOV / 2) * (Math.PI / 180));

export class ParticleScene {
  private renderer: THREE.WebGLRenderer;
  private scene = new THREE.Scene();
  private camera = new THREE.PerspectiveCamera(FOV, 1, 0.1, 50);
  private material: THREE.ShaderMaterial;
  private points: THREE.Points | null = null;
  private raf = 0;
  private visible = true;
  private reduceMotion: boolean;
  private mouseActive = false;
  private start = performance.now();
  private resizeObserver: ResizeObserver;
  private intersection: IntersectionObserver;
  private target = new THREE.Vector2(9, 9);

  constructor(private canvas: HTMLCanvasElement) {
    this.renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    this.reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    this.material = new THREE.ShaderMaterial({
      vertexShader: VERTEX_SHADER,
      fragmentShader: FRAGMENT_SHADER,
      transparent: true,
      depthWrite: false,
      uniforms: {
        uTime: { value: 0 },
        uSize: { value: 2 },
        uPR: { value: 1 },
        uMode: { value: 0 },
        uMouse: { value: new THREE.Vector2(9, 9) },
        uTint: { value: new THREE.Color("#ffffff") },
        uUseTint: { value: 0 },
      },
    });

    this.resizeObserver = new ResizeObserver(() => this.resize());
    this.resizeObserver.observe(canvas);
    this.intersection = new IntersectionObserver(([e]) => (this.visible = e.isIntersecting));
    this.intersection.observe(canvas);

    canvas.addEventListener("pointermove", this.onMove);
    canvas.addEventListener("pointerleave", this.onLeave);

    this.resize();
    this.loop();
  }

  setField(field: ParticleField) {
    if (this.points) {
      this.points.geometry.dispose();
      this.scene.remove(this.points);
    }
    const geometry = new THREE.BufferGeometry();
    const pos = new Float32Array(field.count * 3);
    for (let i = 0; i < field.count; i++) {
      pos[i * 3] = field.positions[i * 2];
      pos[i * 3 + 1] = field.positions[i * 2 + 1];
    }
    geometry.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    geometry.setAttribute("aColor", new THREE.BufferAttribute(field.colors, 3));
    geometry.setAttribute("aSeed", new THREE.BufferAttribute(field.seeds, 1));
    this.points = new THREE.Points(geometry, this.material);
    this.points.frustumCulled = false;
    this.scene.add(this.points);
    this.start = performance.now();
  }

  setOptions({ animation, size, tint }: SceneOptions) {
    const u = this.material.uniforms;
    u.uMode.value = modeOf(animation);
    u.uSize.value = size;
    u.uUseTint.value = tint ? 1 : 0;
    if (tint) u.uTint.value.set(tint);
  }

  dispose() {
    cancelAnimationFrame(this.raf);
    this.resizeObserver.disconnect();
    this.intersection.disconnect();
    this.canvas.removeEventListener("pointermove", this.onMove);
    this.canvas.removeEventListener("pointerleave", this.onLeave);
    this.points?.geometry.dispose();
    this.material.dispose();
    this.renderer.dispose();
  }

  private cameraZ(aspect: number) {
    // Fit the -1..1 image plus a little scatter margin, in both orientations.
    return Math.max(3, 1.2 / (HALF_TAN * Math.min(aspect, 1)));
  }

  private resize() {
    const w = this.canvas.clientWidth || 1;
    const h = this.canvas.clientHeight || 1;
    const pr = Math.min(window.devicePixelRatio || 1, 2);
    this.renderer.setPixelRatio(pr);
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    this.camera.position.z = this.cameraZ(w / h);
    this.camera.updateProjectionMatrix();
    this.material.uniforms.uPR.value = pr;
  }

  private onMove = (e: PointerEvent) => {
    const r = this.canvas.getBoundingClientRect();
    const nx = ((e.clientX - r.left) / r.width) * 2 - 1;
    const ny = -(((e.clientY - r.top) / r.height) * 2 - 1);
    const z = this.camera.position.z;
    this.target.set(nx * HALF_TAN * z * this.camera.aspect, ny * HALF_TAN * z);
    this.mouseActive = true;
  };

  private onLeave = () => {
    this.mouseActive = false;
    this.target.set(9, 9);
  };

  private loop = () => {
    this.raf = requestAnimationFrame(this.loop);
    if (!this.visible) return;
    const u = this.material.uniforms;
    // Reduced motion freezes on a fully formed frame.
    u.uTime.value = this.reduceMotion ? 4 : (performance.now() - this.start) / 1000;
    const m = u.uMouse.value as THREE.Vector2;
    m.lerp(this.target, this.mouseActive ? 0.25 : 1);
    this.renderer.render(this.scene, this.camera);
  };
}
