"use client";

import { useEffect, useRef, useState } from "react";
import { drawExample, EXAMPLES, type ExampleId } from "@/lib/examples";
import { analyseImage, sampleParticles, type ParticleField } from "@/lib/particles";
import type { AnimationId } from "@/lib/shaders";
import { ParticleCanvas } from "./ParticleCanvas";

function useExampleField(id: ExampleId, count: number) {
  const [field, setField] = useState<ParticleField | null>(null);
  const [original, setOriginal] = useState<HTMLCanvasElement | null>(null);
  useEffect(() => {
    const canvas = drawExample(id);
    setOriginal(canvas);
    setField(sampleParticles(analyseImage(canvas, { removeBackground: false, enhance: false }), count));
  }, [id, count]);
  return { field, original };
}

function Thumb({ source, label }: { source: HTMLCanvasElement | null; label: string }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx || !source) return;
    ctx.clearRect(0, 0, 320, 320);
    ctx.drawImage(source, 0, 0);
  }, [source]);
  return <canvas ref={ref} width={320} height={320} role="img" aria-label={label} className="h-full w-full" />;
}

export function HeroDemo() {
  const { field } = useExampleField("wordmark", 14000);
  return (
    <div className="aspect-[4/3] w-full overflow-hidden rounded-xl bg-surface-dark">
      <ParticleCanvas
        field={field}
        animation="assemble"
        size={2.2}
        tint={null}
        label="Animated particles forming the word Mote"
        className="h-full w-full"
      />
    </div>
  );
}

export function ExampleCard({ id }: { id: ExampleId }) {
  const meta = EXAMPLES.find((e) => e.id === id)!;
  const { field, original } = useExampleField(id, 11000);
  const animation: AnimationId = meta.animation;
  return (
    <article className="rounded-lg bg-surface-card p-4">
      <div className="grid grid-cols-2 gap-3">
        <figure className="m-0">
          <div className="aspect-square overflow-hidden rounded-md bg-surface-dark">
            <Thumb source={original} label={`Original ${meta.title.toLowerCase()} image`} />
          </div>
          <figcaption className="mt-2 text-[13px] font-medium text-muted">Image</figcaption>
        </figure>
        <figure className="m-0">
          <div className="aspect-square overflow-hidden rounded-md bg-surface-dark">
            <ParticleCanvas
              field={field}
              animation={animation}
              size={2.6}
              tint={null}
              label={`${meta.title} as animated particles`}
              className="h-full w-full"
            />
          </div>
          <figcaption className="mt-2 text-[13px] font-medium text-muted">Particles</figcaption>
        </figure>
      </div>
      <div className="mt-4 flex items-center justify-between px-1 pb-1">
        <h3 className="m-0 text-lg font-medium text-ink">{meta.title}</h3>
        <span className="badge-pill bg-canvas">{meta.note}</span>
      </div>
    </article>
  );
}
