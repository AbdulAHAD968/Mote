import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

const inner = [
  [51, 32], [41.5, 48.5], [22.5, 48.5], [13, 32], [22.5, 15.5], [41.5, 15.5],
];
const outer = [
  [53.6, 44.5], [32, 57], [10.4, 44.5], [10.4, 19.5], [32, 7], [53.6, 19.5],
];

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div style={{ display: "flex", width: "100%", height: "100%", background: "#181715" }}>
        <svg width="180" height="180" viewBox="0 0 64 64">
          <circle cx="32" cy="32" r="9" fill="#cc785c" />
          {inner.map(([x, y]) => (
            <circle key={`i${x}${y}`} cx={x} cy={y} r="3" fill="#cc785c" />
          ))}
          {outer.map(([x, y]) => (
            <circle key={`o${x}${y}`} cx={x} cy={y} r="2" fill="#e8a55a" opacity="0.7" />
          ))}
        </svg>
      </div>
    ),
    { ...size },
  );
}
