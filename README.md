# Mote

**Turn any image into animated 3D particles, then export the code.**

Live: **https://i2p-seven.vercel.app**

Upload a picture, watch it break into thousands of GPU-animated particles, pick one of ten animations, and copy or download clean three.js code as a standalone HTML file or a React component. Everything runs in your browser: there is no backend and your images never leave your device.

## Features

- **Image to particles in the browser.** The image is drawn to a hidden canvas, its visible pixels are sampled, and each sample becomes one particle with that pixel's position and color.
- **Ten animations:** Assemble, Float, Wave, Repel, Magnet, Swirl, Swing, Pulse, Ripple and Sparkle. Repel and Magnet react to your cursor.
- **Live controls:** particle count (2,000 to 30,000), particle size, original or single color, and plain-background removal.
- **Two export formats:**
  - **HTML:** one self-contained file. three.js is loaded from a CDN import map.
  - **React:** a single `MoteParticles.jsx` component. Run `npm install three`.
- **Preview equals export.** The preview and the exported code share the same shader, so they look identical.
- **Private by design.** Nothing is uploaded; there are no API routes.
- **SEO and AI-search ready:** metadata, Open Graph and Twitter images, `robots.txt` (AI crawlers allowed), `sitemap.xml`, web manifest, JSON-LD (WebApplication, FAQPage, HowTo) and `llms.txt`.
- Respects `prefers-reduced-motion` (the animation freezes on a formed frame).

## Quick start

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build
npm start        # serve the production build
```

Requires Node.js 20 or newer and a browser with WebGL.

## Using the studio

1. Open `/studio` and drop in a PNG, JPG, WebP, GIF (first frame) or SVG, or click **Try a sample**.
2. Choose an animation and tune particle count, size and color.
3. Pick **HTML** or **React**, then **Copy code** or **Download**.

Images with a transparent background, or a plain solid one, give the cleanest shapes. If a photo has a busy background, the whole rectangle becomes particles; turn off **Remove plain background** only if the shape you want is being cut away.

### Using the exported code

**HTML:** open `mote-particles.html` in any browser, or host it as a static page.

**React / Next.js:**

```bash
npm install three
```

```jsx
import MoteParticles from "./MoteParticles";

export default function Hero() {
  return (
    <section style={{ height: 480 }}>
      <MoteParticles />
    </section>
  );
}
```

The component fills its parent, so give the parent a height. In the Next.js App Router the file already starts with `"use client"`.

## How it works

1. `lib/particles.ts` reads the image into an offscreen canvas (longest side capped at 320 px), detects a plain background from the four corners, and keeps the visible pixels.
2. It samples N of those pixels with a seeded random generator and normalises positions so the longest side spans -1 to 1.
3. `lib/ParticleScene.ts` renders the points with three.js and a custom shader (`lib/shaders.ts`). All animation happens on the GPU from a time uniform, so there is no per-frame JavaScript per particle.
4. `lib/exporters.ts` encodes the particles compactly (int16 x/y pairs plus uint8 r/g/b, base64) and embeds them with the same shader. About 9 KB per 1,000 particles.

## Project structure

```
app/
  page.tsx               landing page
  studio/page.tsx        studio route
  layout.tsx             fonts, global metadata
  globals.css            design tokens (from DESIGN.md)
  robots.ts, sitemap.ts, manifest.ts
  icon.svg, apple-icon.tsx, opengraph-image.tsx
components/
  Studio.tsx             upload, controls, export panel
  ParticleCanvas.tsx     React wrapper around the three.js scene
  ExampleParticles.tsx   hero demo and landing example cards
  Nav.tsx, Footer.tsx, Logo.tsx, JsonLd.tsx
lib/
  particles.ts           image -> particle field, export encoding
  shaders.ts             vertex/fragment shader and animation list
  ParticleScene.ts       three.js scene, resize, pointer handling
  exporters.ts           HTML and React code generation
  examples.ts            canvas-drawn sample images
  site.ts                site name, URL, FAQ copy
public/llms.txt          summary for AI answer engines
DESIGN.md                design system reference
```

## Adding an animation

1. Add an entry to `ANIMATIONS` (and the `AnimationId` type) in `lib/shaders.ts` with a new `mode` number.
2. Add a branch for that mode in `VERTEX_SHADER`. Set `offset` (and optionally `sizeMul`); `uTime`, `uMouse` and the per-particle `aSeed` are available.
3. That is all. The studio picker, the preview and both exporters read from the same list and shader.

## Deploying to Vercel

Mote is a static Next.js app, so the default Vercel settings work.

1. Import the repository in Vercel.
2. Optional: set `NEXT_PUBLIC_SITE_URL` (for example `https://i2p-seven.vercel.app` or your custom domain). It drives canonical URLs, the sitemap, `robots.txt` and the social share image. If unset, Vercel's production URL is used automatically.

## Tech stack

- [Next.js](https://nextjs.org) 16 (App Router) and React 19
- [three.js](https://threejs.org) with a custom `ShaderMaterial`
- Tailwind CSS 4
- TypeScript
- Cormorant Garamond, Inter and JetBrains Mono via `next/font`

## Design

The UI follows [DESIGN.md](./DESIGN.md): a warm cream canvas, coral accents, dark code surfaces, serif display type and no hover styling beyond the pressed state.

## Roadmap ideas

- Depth from image brightness for true 3D shapes
- Text-to-particles
- More export targets (Vue, plain Canvas, Lottie-style video)
- Shareable links for a studio setup
- Custom animation editor

## License

Add a license of your choice before publishing.
