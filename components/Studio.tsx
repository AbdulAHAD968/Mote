"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { drawExample } from "@/lib/examples";
import {
  buildExport,
  EXPORT_FILENAMES,
  type ExportFormat,
  type ExportInput,
} from "@/lib/exporters";
import { analyseImage, encodeField, sampleParticles, type ImageSource } from "@/lib/particles";
import { ANIMATIONS, type AnimationId } from "@/lib/shaders";
import { ParticleCanvas } from "./ParticleCanvas";

type Loaded = { source: CanvasImageSource & { width: number; height: number }; name: string };

function loadFile(file: File): Promise<Loaded> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith("image/")) {
      reject(new Error("That file isn't an image. Try a PNG, JPG, WebP, GIF or SVG."));
      return;
    }
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve({ source: img, name: file.name });
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("We couldn't read that image. Try another file."));
    };
    img.src = url;
  });
}

export function Studio() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [loaded, setLoaded] = useState<Loaded | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);

  const [removeBg, setRemoveBg] = useState(true);
  const [count, setCount] = useState(12000);
  const [size, setSize] = useState(2);
  const [animation, setAnimation] = useState<AnimationId>("assemble");
  const [colorMode, setColorMode] = useState<"original" | "single">("original");
  const [color, setColor] = useState("#cc785c");

  const [format, setFormat] = useState<ExportFormat>("html");
  const [copied, setCopied] = useState(false);

  const analysis: { source: ImageSource | null; error: string | null } = useMemo(() => {
    if (!loaded) return { source: null, error: null };
    try {
      return { source: analyseImage(loaded.source, removeBg), error: null };
    } catch (e) {
      return {
        source: null,
        error: e instanceof Error ? e.message : "Something went wrong reading the image.",
      };
    }
  }, [loaded, removeBg]);
  const imageSource = analysis.source;

  const field = useMemo(
    () => (imageSource ? sampleParticles(imageSource, count) : null),
    [imageSource, count],
  );
  const empty = imageSource && imageSource.visible.length === 0;
  const tint = colorMode === "single" ? color : null;

  const accept = useCallback(async (file: File | undefined) => {
    if (!file) return;
    setError(null);
    try {
      setLoaded(await loadFile(file));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    }
  }, []);

  const useSample = () => {
    setError(null);
    setLoaded({ source: drawExample("heart"), name: "Sample heart" });
  };

  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), 1600);
    return () => clearTimeout(t);
  }, [copied]);

  const input = (data: string): ExportInput => ({
    data,
    count: field?.count ?? 0,
    animation,
    size,
    tint,
  });
  const preview = field ? buildExport(format, input("<particle data is included in the copied/downloaded file>")) : "";
  const fullCode = () => buildExport(format, input(encodeField(field!)));
  const approxKb = field ? Math.round((field.count * 7 * 4) / 3 / 1024) : 0;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(fullCode());
      setCopied(true);
    } catch {
      setError("Copy was blocked by your browser. Use Download instead.");
    }
  };

  const download = () => {
    const blob = new Blob([fullCode()], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = EXPORT_FILENAMES[format];
    a.click();
    URL.revokeObjectURL(url);
  };

  const hasField = !!field && field.count > 0;

  return (
    <div className="mx-auto max-w-[1200px] px-5 py-10 md:py-14">
      <h1 className="display-lg">Studio</h1>
      <p className="mt-3 max-w-xl text-body">
        Upload an image, pick an animation, then copy or download the code.
      </p>

      <div className="mt-10 grid gap-6 lg:grid-cols-[1fr_340px]">
        {/* Stage - dark surface */}
        <div
          className="relative aspect-[4/3] overflow-hidden rounded-xl bg-surface-dark"
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            accept(e.dataTransfer.files[0]);
          }}
        >
          {hasField && (
            <ParticleCanvas
              field={field}
              animation={animation}
              size={size}
              tint={tint}
              label="Animated particle preview of your image"
              className="absolute inset-0 h-full w-full"
            />
          )}

          {!hasField && (
            <div
              className={`absolute inset-4 flex flex-col items-center justify-center rounded-lg border border-dashed p-6 text-center ${
                dragging ? "border-primary" : "border-on-dark-soft/40"
              }`}
            >
              <p className="font-display text-3xl text-on-dark">
                {empty ? "We couldn't find a shape" : "Drop an image here"}
              </p>
              <p className="mt-2 max-w-sm text-sm text-on-dark-soft">
                {empty
                  ? "That image looks empty or entirely background. Try one with a clear subject, or turn off “Remove background”."
                  : "PNG, JPG, WebP, GIF or SVG. It stays on your device."}
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <button className="btn btn-primary" onClick={() => inputRef.current?.click()}>
                  Choose a file
                </button>
                <button className="btn btn-on-dark" onClick={useSample}>
                  Try a sample
                </button>
              </div>
            </div>
          )}

          {hasField && (
            <button
              className="btn btn-on-dark absolute right-3 top-3"
              onClick={() => inputRef.current?.click()}
            >
              Replace image
            </button>
          )}
          {hasField && loaded && (
            <span className="absolute bottom-3 left-3 max-w-[60%] truncate rounded-full bg-surface-dark-elevated px-3 py-1 text-[13px] text-on-dark-soft">
              {loaded.name} · {field.count.toLocaleString("en-US")} particles
            </span>
          )}
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              accept(e.target.files?.[0]);
              e.target.value = "";
            }}
          />
        </div>

        {/* Controls - cream card */}
        <fieldset
          disabled={!hasField}
          className="m-0 min-w-0 space-y-6 rounded-lg border-0 bg-surface-card p-6 disabled:opacity-60"
        >
          <legend className="sr-only">Particle settings</legend>
          <div>
            <p className="caption-uppercase text-muted">Animation</p>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {ANIMATIONS.map((a) => (
                <button
                  key={a.id}
                  type="button"
                  aria-pressed={animation === a.id}
                  onClick={() => setAnimation(a.id)}
                  className={`rounded-md px-3 py-2 text-left text-sm font-medium ${
                    animation === a.id
                      ? "bg-surface-cream-strong text-ink"
                      : "text-muted"
                  }`}
                >
                  {a.label}
                </button>
              ))}
            </div>
            <p className="mt-2 text-[13px] text-muted">
              {ANIMATIONS.find((a) => a.id === animation)!.hint}
            </p>
          </div>

          <label className="block">
            <span className="flex justify-between text-sm font-medium text-ink">
              Particles <span className="font-normal text-muted">{count.toLocaleString("en-US")}</span>
            </span>
            <input
              className="mt-2"
              type="range"
              min={2000}
              max={30000}
              step={1000}
              value={count}
              onChange={(e) => setCount(+e.target.value)}
            />
          </label>

          <label className="block">
            <span className="flex justify-between text-sm font-medium text-ink">
              Size <span className="font-normal text-muted">{size}</span>
            </span>
            <input
              className="mt-2"
              type="range"
              min={1}
              max={6}
              step={0.5}
              value={size}
              onChange={(e) => setSize(+e.target.value)}
            />
          </label>

          <div>
            <p className="text-sm font-medium text-ink">Color</p>
            <div className="mt-2 flex items-center gap-2">
              {(["original", "single"] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  aria-pressed={colorMode === m}
                  onClick={() => setColorMode(m)}
                  className={`rounded-md px-3 py-2 text-sm font-medium ${
                    colorMode === m ? "bg-surface-cream-strong text-ink" : "text-muted"
                  }`}
                >
                  {m === "original" ? "Original" : "Single"}
                </button>
              ))}
              {colorMode === "single" && (
                <input
                  type="color"
                  aria-label="Particle color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="ml-auto h-9 w-12 cursor-pointer rounded-md border border-hairline bg-canvas p-1"
                />
              )}
            </div>
          </div>

          <label className="flex items-center gap-3 text-sm font-medium text-ink">
            <input
              type="checkbox"
              checked={removeBg}
              onChange={(e) => setRemoveBg(e.target.checked)}
              className="h-4 w-4 accent-[#cc785c]"
            />
            Remove plain background
          </label>
        </fieldset>
      </div>

      {(error ?? analysis.error) && (
        <p role="alert" className="mt-4 text-sm text-error">
          {error ?? analysis.error}
        </p>
      )}

      {/* Export - dark code window */}
      <section aria-labelledby="export-heading" className="mt-10 rounded-lg bg-surface-dark p-6">
        <div className="flex flex-wrap items-center gap-3">
          <h2 id="export-heading" className="mr-auto font-display text-3xl text-on-dark">
            Export
          </h2>
          {(["html", "react"] as const).map((f) => (
            <button
              key={f}
              type="button"
              aria-pressed={format === f}
              onClick={() => setFormat(f)}
              className={`btn ${format === f ? "btn-on-dark !bg-surface-dark-soft !text-on-dark" : "!bg-transparent !text-on-dark-soft"}`}
            >
              {f === "html" ? "HTML" : "React"}
            </button>
          ))}
          <button className="btn btn-primary" onClick={copy} disabled={!hasField}>
            {copied ? "Copied" : "Copy code"}
          </button>
          <button className="btn btn-on-dark" onClick={download} disabled={!hasField}>
            Download
          </button>
        </div>

        {hasField ? (
          <>
            <pre
              tabIndex={0}
              className="mt-5 max-h-[28rem] overflow-auto rounded-md bg-surface-dark-soft p-5 font-mono text-sm leading-relaxed text-on-dark"
            >
              <code>{preview}</code>
            </pre>
            <p className="mt-4 text-sm text-on-dark-soft">
              {format === "html"
                ? `Open ${EXPORT_FILENAMES.html} in any browser. About ${approxKb} KB, loads three.js from a CDN.`
                : `Run npm install three, then render <MoteParticles className="h-96" />. About ${approxKb} KB.`}{" "}
              The preview above hides the particle data; copy and download include it.
            </p>
          </>
        ) : (
          <p className="mt-5 rounded-md bg-surface-dark-soft p-5 text-sm text-on-dark-soft">
            Upload an image to generate code.
          </p>
        )}
      </section>
    </div>
  );
}
