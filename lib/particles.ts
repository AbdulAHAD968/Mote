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
  /** 0..1 edge strength per pixel (Sobel on luminance) */
  edge: Float32Array;
};

export type AnalyseOptions = {
  removeBackground: boolean;
  /** stretch contrast and lift saturation so dark photos stay visible */
  enhance: boolean;
};

const MAX_SIDE = 480;

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

function percentile(values: ArrayLike<number>, p: number) {
  const sorted = Float32Array.from(values as ArrayLike<number>).sort();
  return sorted.length ? sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * p))] : 0;
}

export function analyseImage(
  source: CanvasImageSource & { width: number; height: number },
  { removeBackground, enhance }: AnalyseOptions,
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
  ctx.imageSmoothingQuality = "high";
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

  const total = width * height;

  // Flood-fill the background from the border, so dark features inside the subject
  // (eyes, hair) survive even when they are close to the background colour.
  const isBg = new Uint8Array(total);
  if (bg) {
    const near = (p: number) =>
      Math.hypot(data[p * 4] - bg![0], data[p * 4 + 1] - bg![1], data[p * 4 + 2] - bg![2]) < 40;
    const stack: number[] = [];
    const push = (p: number) => {
      if (!isBg[p] && near(p)) {
        isBg[p] = 1;
        stack.push(p);
      }
    };
    for (let x = 0; x < width; x++) {
      push(x);
      push((height - 1) * width + x);
    }
    for (let y = 0; y < height; y++) {
      push(y * width);
      push(y * width + width - 1);
    }
    while (stack.length) {
      const p = stack.pop()!;
      const x = p % width;
      if (x > 0) push(p - 1);
      if (x < width - 1) push(p + 1);
      if (p >= width) push(p - width);
      if (p < total - width) push(p + width);
    }
  }

  const lum = new Float32Array(total);
  const rgb = new Uint8ClampedArray(total * 3);
  const visible: number[] = [];
  for (let i = 0; i < total; i++) {
    const o = i * 4;
    rgb[i * 3] = data[o];
    rgb[i * 3 + 1] = data[o + 1];
    rgb[i * 3 + 2] = data[o + 2];
    lum[i] = 0.2126 * data[o] + 0.7152 * data[o + 1] + 0.0722 * data[o + 2];
    if (data[o + 3] < 40 || isBg[i]) continue;
    visible.push(i);
  }

  // Edge strength (Sobel) on the original luminance, normalised by the 98th percentile.
  const edge = new Float32Array(total);
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const i = y * width + x;
      const gx =
        -lum[i - width - 1] - 2 * lum[i - 1] - lum[i + width - 1] +
        lum[i - width + 1] + 2 * lum[i + 1] + lum[i + width + 1];
      const gy =
        -lum[i - width - 1] - 2 * lum[i - width] - lum[i - width + 1] +
        lum[i + width - 1] + 2 * lum[i + width] + lum[i + width + 1];
      edge[i] = Math.hypot(gx, gy);
    }
  }
  const edgeNorm = percentile(visible.map((i) => edge[i]), 0.98) || 1;
  for (let i = 0; i < total; i++) edge[i] = Math.min(1, edge[i] / edgeNorm);

  if (enhance && visible.length) {
    const lo = percentile(visible.map((i) => lum[i]), 0.02);
    const hi = percentile(visible.map((i) => lum[i]), 0.98);
    if (hi - lo > 20) {
      const gain = Math.min(2.4, 255 / (hi - lo));
      for (const i of visible) {
        const l = (lum[i] - lo) * gain;
        const base = lum[i];
        for (let ch = 0; ch < 3; ch++) {
          // saturation lift around the pixel's own luminance, then the levels stretch
          const c = base + (rgb[i * 3 + ch] - base) * 1.2;
          rgb[i * 3 + ch] = (c - base) + l;
        }
      }
    }
  }

  return { width, height, visible: Uint32Array.from(visible), rgb, edge };
}

/**
 * Places about `count` particles over the visible pixels. Edges get more particles
 * (`detail` 0..1), and Floyd-Steinberg error diffusion spreads them evenly instead of
 * letting random clumps and gaps appear.
 */
export function sampleParticles(src: ImageSource, count: number, detail = 0.5): ParticleField {
  const { width, height, visible, rgb, edge } = src;
  const rand = mulberry32(42);

  const weight = new Float32Array(width * height);
  let sum = 0;
  for (const p of visible) {
    weight[p] = 1 + detail * 3 * edge[p];
    sum += weight[p];
  }
  const perWeight = sum ? count / sum : 0;

  const err = new Float32Array(width * height);
  const xs: number[] = [];
  const ys: number[] = [];
  const idx: number[] = [];

  for (let y = 0; y < height; y++) {
    const ltr = y % 2 === 0;
    for (let k = 0; k < width; k++) {
      const x = ltr ? k : width - 1 - k;
      const p = y * width + x;
      if (!weight[p]) continue;
      const v = weight[p] * perWeight + err[p];
      const n = Math.max(0, Math.round(v));
      const e = v - n;
      const dir = ltr ? 1 : -1;
      if (x + dir >= 0 && x + dir < width) err[p + dir] += (e * 7) / 16;
      if (y + 1 < height) {
        if (x - dir >= 0 && x - dir < width) err[p + width - dir] += (e * 3) / 16;
        err[p + width] += (e * 5) / 16;
        if (x + dir >= 0 && x + dir < width) err[p + width + dir] += (e * 1) / 16;
      }
      for (let j = 0; j < n; j++) {
        xs.push(x + rand() - 0.5);
        ys.push(y + rand() - 0.5);
        idx.push(p);
      }
    }
  }

  const n = idx.length;
  const half = Math.max(width, height) / 2;
  const positions = new Float32Array(n * 2);
  const colors = new Float32Array(n * 3);
  const seeds = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    positions[i * 2] = (xs[i] - width / 2) / half;
    positions[i * 2 + 1] = -(ys[i] - height / 2) / half;
    colors[i * 3] = rgb[idx[i] * 3] / 255;
    colors[i * 3 + 1] = rgb[idx[i] * 3 + 1] / 255;
    colors[i * 3 + 2] = rgb[idx[i] * 3 + 2] / 255;
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
