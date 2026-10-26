import { ImageResponse } from "next/og";
import { SITE_NAME, SITE_TAGLINE } from "@/lib/site";

export const alt = `${SITE_NAME} - ${SITE_TAGLINE}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Deterministic dots forming a heart-ish ring on the right.
const dots = Array.from({ length: 220 }, (_, i) => {
  const t = (i / 220) * Math.PI * 2;
  const r = 150 + ((i * 37) % 60);
  return {
    x: 900 + Math.cos(t) * r,
    y: 315 + Math.sin(t) * r * 0.9,
    s: 4 + ((i * 13) % 9),
    c: i % 5 === 0 ? "#e8a55a" : "#cc785c",
  };
});

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          position: "relative",
          width: "100%",
          height: "100%",
          background: "#faf9f5",
          color: "#141413",
        }}
      >
        {dots.map((d, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              left: d.x,
              top: d.y,
              width: d.s,
              height: d.s,
              borderRadius: 9999,
              background: d.c,
            }}
          />
        ))}
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 80px", width: 760 }}>
          <div style={{ fontSize: 40, color: "#cc785c", marginBottom: 24 }}>{SITE_NAME}</div>
          <div style={{ fontSize: 80, lineHeight: 1.05, letterSpacing: -2 }}>{SITE_TAGLINE}</div>
          <div style={{ fontSize: 30, color: "#6c6a64", marginTop: 28 }}>
            Upload, animate, export three.js code.
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
