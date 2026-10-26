// Browser-only: turns an image into a ParticleField (positions, colors, seeds).

export type ParticleField = {
  count: number;
  /** x,y pairs, normalised so the longest side spans -1..1 */
  positions: Float32Array;
  /** r,g,b triples, 0..1 */
  colors: Float32Array;
  /** one random 0..1 value per particle */
  seeds: Float32Array;
};

/** Pixels worth sampling, cached so the particle count can change cheaply. */
export type ImageSource = {
  width: number;
  height: number;
  /** indices into rgb of visible pixels */
  visible: Uint32Array;
  rgb: Uint8ClampedArray;
};

const MAX_SIDE = 320;

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function analyseImage(
  source: CanvasImageSource & { width: number; height: number },
  removeBackground: boolean,
): ImageSource {
  const sw = source.width || 512;
  const sh = source.height || 512;
  const scale = Math.min(1, MAX_SIDE / Math.max(sw, sh));
  const width = Math.max(1, Math.round(sw * scale));
  const height = Math.max(1, Math.round(sh * scale));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) throw new Error("Canvas is not supported in this browser.");
  ctx.drawImage(source, 0, 0, width, height);
  const { data } = ctx.getImageData(0, 0, width, height);

  // A plain background shows up as four near-identical corners.
  let bg: [number, number, number] | null = null;
  if (removeBackground) {
    const corners = [0, width - 1, (height - 1) * width, height * width - 1].map((p) => p * 4);
    const opaque = corners.every((c) => data[c + 3] > 200);
    if (opaque) {
      const avg = [0, 1, 2].map((ch) => corners.reduce((s, c) => s + data[c + ch], 0) / 4);
      const spread = Math.max(
        ...corners.map((c) =>
          Math.hypot(data[c] - avg[0], data[c + 1] - avg[1], data[c + 2] - avg[2]),
        ),
      );
      if (spread < 24) bg = [avg[0], avg[1], avg[2]];
    }
  }

  const visible: number[] = [];
  for (let i = 0; i < width * height; i++) {
    const o = i * 4;
    if (data[o + 3] < 40) continue;
    if (bg && Math.hypot(data[o] - bg[0], data[o + 1] - bg[1], data[o + 2] - bg[2]) < 40) continue;
    visible.push(i);
  }

  const rgb = new Uint8ClampedArray(width * height * 3);
  for (let i = 0; i < width * height; i++) {
    rgb[i * 3] = data[i * 4];
    rgb[i * 3 + 1] = data[i * 4 + 1];
    rgb[i * 3 + 2] = data[i * 4 + 2];
  }

  return { width, height, visible: Uint32Array.from(visible), rgb };
}

export function sampleParticles(src: ImageSource, count: number): ParticleField {
  const rand = mulberry32(42);
  const n = src.visible.length ? count : 0;
  const positions = new Float32Array(n * 2);
  const colors = new Float32Array(n * 3);
  const seeds = new Float32Array(n);
  const half = Math.max(src.width, src.height) / 2;

  for (let i = 0; i < n; i++) {
    const p = src.visible[Math.floor(rand() * src.visible.length)];
    const px = (p % src.width) + rand() - 0.5;
    const py = Math.floor(p / src.width) + rand() - 0.5;
    positions[i * 2] = (px - src.width / 2) / half;
    positions[i * 2 + 1] = -(py - src.height / 2) / half;
    colors[i * 3] = src.rgb[p * 3] / 255;
    colors[i * 3 + 1] = src.rgb[p * 3 + 1] / 255;
    colors[i * 3 + 2] = src.rgb[p * 3 + 2] / 255;
    seeds[i] = rand();
  }
  return { count: n, positions, colors, seeds };
}

function toBase64(bytes: Uint8Array) {
  let s = "";
  for (let i = 0; i < bytes.length; i += 0x8000) {
    s += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  }
  return btoa(s);
}

/** Compact encoding for exported code: int16 x,y pairs followed by uint8 r,g,b triples. */
export function encodeField(field: ParticleField): string {
  const n = field.count;
  const bytes = new Uint8Array(n * 7);
  const xy = new Int16Array(bytes.buffer, 0, n * 2);
  for (let i = 0; i < n * 2; i++) xy[i] = Math.round(field.positions[i] * 30000);
  for (let i = 0; i < n * 3; i++) bytes[n * 4 + i] = Math.round(field.colors[i] * 255);
  return toBase64(bytes);
}
