"use client";

import { useEffect, useRef, useState } from "react";
import { ParticleScene, type SceneOptions } from "@/lib/ParticleScene";
import type { ParticleField } from "@/lib/particles";

type Props = SceneOptions & {
  field: ParticleField | null;
  label: string;
  className?: string;
};

export function ParticleCanvas({ field, animation, size, tint, label, className }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<ParticleScene | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    try {
      sceneRef.current = new ParticleScene(canvasRef.current!);
    } catch {
      setFailed(true);
    }
    return () => {
      sceneRef.current?.dispose();
      sceneRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (field) sceneRef.current?.setField(field);
  }, [field]);

  useEffect(() => {
    sceneRef.current?.setOptions({ animation, size, tint });
  }, [animation, size, tint]);

  if (failed) {
    return (
      <div className={`${className} flex items-center justify-center p-6 text-center text-sm text-on-dark-soft`}>
        WebGL isn&apos;t available in this browser, so the particle preview can&apos;t run.
      </div>
    );
  }
  return <canvas ref={canvasRef} className={className} role="img" aria-label={label} />;
}
