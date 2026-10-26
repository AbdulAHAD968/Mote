export const SITE_NAME = "Mote";
export const SITE_TAGLINE = "Turn any image into animated particles";
export const SITE_DESCRIPTION =
  "Mote turns any image into animated 3D particles in your browser. Upload a picture, pick an animation, and export clean three.js code for HTML or React. Nothing is uploaded.";

// Set NEXT_PUBLIC_SITE_URL in Vercel to your custom domain; Vercel's production URL is the fallback.
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3000")
).replace(/\/$/, "");

export const FAQ = [
  {
    q: "What is Mote?",
    a: "Mote is a free web tool that converts any image into animated 3D particles. You upload a picture, choose an animation, and export ready-to-run three.js code as a standalone HTML file or a React component.",
  },
  {
    q: "Is my image uploaded to a server?",
    a: "No. Mote runs entirely in your browser. Your image is read on a hidden canvas on your device, turned into particle coordinates, and never sent anywhere.",
  },
  {
    q: "How does Mote turn an image into particles?",
    a: "Mote draws your image to a canvas, reads its pixels, ignores the transparent or background ones, and randomly samples the rest. Each sampled pixel becomes one particle that keeps its position and color.",
  },
  {
    q: "What can I export?",
    a: "You can export a single self-contained HTML file or a React component. Both embed the particle coordinates and colors, the shader, and the animation, and need only three.js to run.",
  },
  {
    q: "Which image formats work?",
    a: "PNG, JPG, WebP, GIF (first frame) and SVG. Images with a transparent background or a plain solid background give the cleanest shapes.",
  },
  {
    q: "Which animations are included?",
    a: "Assemble (particles scatter and fly back into the shape), Float, Wave, Swirl, Swing (a 3D sway), Pulse, Ripple and Sparkle, plus two cursor-reactive ones: Repel (particles nudge away) and Magnet (particles lean toward it).",
  },
] as const;
