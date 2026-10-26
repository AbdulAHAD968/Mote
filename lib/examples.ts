// Sample images drawn on a canvas, so the landing page needs no image assets.
import type { AnimationId } from "./shaders";

export type ExampleId = "heart" | "star" | "rings" | "wordmark";

export const EXAMPLES: { id: ExampleId; title: string; note: string; animation: AnimationId }[] = [
  { id: "heart", title: "Heart", note: "Assemble", animation: "assemble" },
  { id: "star", title: "Star", note: "Wave", animation: "wave" },
  { id: "rings", title: "Rings", note: "Repel", animation: "repel" },
  { id: "wordmark", title: "Wordmark", note: "Float", animation: "float" },
];

const SIZE = 320;

export function drawExample(id: ExampleId): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = SIZE;
  canvas.height = SIZE;
  const ctx = canvas.getContext("2d")!;
  const c = SIZE / 2;

  if (id === "heart") {
    const g = ctx.createLinearGradient(0, 40, 0, 290);
    g.addColorStop(0, "#e8a55a");
    g.addColorStop(1, "#cc785c");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(c, 285);
    ctx.bezierCurveTo(10, 190, 20, 60, 110, 60);
    ctx.bezierCurveTo(145, 60, c, 95, c, 125);
    ctx.bezierCurveTo(c, 95, 175, 60, 210, 60);
    ctx.bezierCurveTo(300, 60, 310, 190, c, 285);
    ctx.fill();
  } else if (id === "star") {
    const g = ctx.createRadialGradient(c, c, 10, c, c, 150);
    g.addColorStop(0, "#faf9f5");
    g.addColorStop(0.5, "#e8a55a");
    g.addColorStop(1, "#cc785c");
    ctx.fillStyle = g;
    ctx.beginPath();
    for (let i = 0; i < 10; i++) {
      const r = i % 2 === 0 ? 150 : 62;
      const a = -Math.PI / 2 + (i * Math.PI) / 5;
      ctx.lineTo(c + Math.cos(a) * r, c + 8 + Math.sin(a) * r);
    }
    ctx.closePath();
    ctx.fill();
  } else if (id === "rings") {
    const colors = ["#cc785c", "#e8a55a", "#5db8a6", "#faf9f5"];
    colors.forEach((col, i) => {
      ctx.strokeStyle = col;
      ctx.lineWidth = 16;
      ctx.beginPath();
      ctx.arc(c, c, 140 - i * 36, 0, Math.PI * 2);
      ctx.stroke();
    });
  } else {
    ctx.fillStyle = "#faf9f5";
    ctx.font = "700 100px Georgia, 'Times New Roman', serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("Mote", c, c - 14);
    ctx.fillStyle = "#cc785c";
    ctx.fillRect(c - 100, c + 52, 200, 12);
  }
  return canvas;
}
