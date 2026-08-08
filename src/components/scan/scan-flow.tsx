import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Camera,
  CheckCircle2,
  Cpu,
  ImageIcon,
  RefreshCw,
  ScanLine,
  Sparkles,
  Upload,
} from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Eyebrow, Section } from "@/components/sections/primitives";
import { runRde, type RdeResult } from "@/lib/rde";
import { cn } from "@/lib/utils";

const STAGES = [
  "Uploading image",
  "AI Vision",
  "Product detection",
  "Fault analysis",
  "RDE scoring",
  "R5 recommendation",
];

const componentPlan = [
  { part: "Battery", action: "Replace" },
  { part: "RAM", action: "Reuse" },
  { part: "SSD", action: "Retrieve / Reuse" },
  { part: "Display", action: "Reuse" },
  { part: "Motherboard", action: "Inspect" },
];

export function ScanFlow() {
  const [preview, setPreview] = useState<string | null>(null);
  const [stage, setStage] = useState(-1);
  const [result, setResult] = useState<RdeResult | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const analyze = useCallback(() => {
    setResult(null);
    setStage(0);
    timers.current.forEach(clearTimeout);
    timers.current = STAGES.map((_, i) =>
      setTimeout(() => {
        setStage(i);
        if (i === STAGES.length - 1) {
          setResult(
            runRde({
              repairCost: 3200,
              replacementCost: 48000,
              ageYears: 3,
              repairability: 88,
              componentAvailability: 0.8,
              remainingLife: 3,
              componentValue: 0.7,
            }),
          );
        }
      }, 700 * (i + 1)),
    );
  }, []);

  const onFile = (file: File | undefined) => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPreview(url);
    analyze();
  };

  return (
    <Section className="pt-6">
      <div className="flex flex-col items-center gap-4 text-center">
        <Eyebrow>AI Vision × RDE × R5</Eyebrow>
        <h1 className="text-4xl font-semibold sm:text-5xl md:text-6xl">
          Scan Your <span className="text-gradient">Product</span>
        </h1>
        <p className="max-w-xl text-muted-foreground">
          Upload a photo of your broken product. ReLife AI identifies it, analyses the fault and
          returns an R5 decision in seconds.
        </p>
      </div>

      <div className="mt-14 grid gap-6 lg:grid-cols-[1.05fr_1fr]">
        {/* Upload surface */}
        <div className="card-surface lift relative overflow-hidden p-6">
          <div className="pointer-events-none absolute inset-0 grid-bg opacity-60" />
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              onFile(e.dataTransfer.files[0]);
            }}
            className="relative grid min-h-[22rem] place-items-center overflow-hidden rounded-2xl border border-dashed border-border p-6 text-center"
          >
            {preview ? (
              <div className="relative w-full">
                <img
                  src={preview}
                  alt="Uploaded product awaiting AI analysis"
                  className="mx-auto max-h-72 w-auto rounded-xl object-contain"
                />
                <BoundingBoxes />
              </div>
            ) : (
              <div className="flex flex-col items-center gap-4">
                <span className="relative grid h-16 w-16 place-items-center rounded-2xl border border-emerald/40">
                  <span className="absolute inset-0 rounded-2xl bg-gradient-brand opacity-15 animate-pulse-glow" />
                  <ImageIcon className="relative h-6 w-6 text-emerald" />
                </span>
                <p className="font-display text-lg font-semibold">
                  Upload a photo of your broken product
                </p>
                <p className="max-w-sm text-sm text-muted-foreground">
                  Drag and drop, choose a file, or use your camera. Images stay on your device in
                  this prototype.
                </p>
              </div>
            )}
          </div>

          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => onFile(e.target.files?.[0])}
          />

          <div className="relative mt-6 flex flex-wrap gap-3">
            <Button variant="hero" size="lg" onClick={() => inputRef.current?.click()}>
              <Upload className="h-4 w-4" /> Upload Image
            </Button>
            <Button
              variant="glass"
              size="lg"
              onClick={() => {
                if (inputRef.current) {
                  inputRef.current.setAttribute("capture", "environment");
                  inputRef.current.click();
                }
              }}
            >
              <Camera className="h-4 w-4" /> Use Camera
            </Button>
            {preview && (
              <Button variant="ghost" size="lg" onClick={analyze}>
                <RefreshCw className="h-4 w-4" /> Re-analyze
              </Button>
            )}
          </div>
        </div>

        {/* Pipeline */}
        <div className="card-surface p-6">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Cpu className="h-4 w-4 text-electric" />
            {stage < 0
              ? "Pipeline idle"
              : result
                ? "Analysis complete"
                : "Analyzing product..."}
          </div>

          <ol className="mt-6 grid gap-3">
            {STAGES.map((s, i) => {
              const active = stage === i && !result;
              const done = stage > i || (result != null && i <= stage);
              return (
                <li
                  key={s}
                  className={cn(
                    "flex items-center gap-3 rounded-xl border border-border px-4 py-3 text-sm transition-all",
                    active && "border-emerald/50 glow-ring",
                    done ? "text-foreground" : "text-muted-foreground",
                  )}
                >
                  {done ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald" />
                  ) : active ? (
                    <ScanLine className="h-4 w-4 animate-pulse text-electric" />
                  ) : (
                    <span className="h-4 w-4 rounded-full border border-border" />
                  )}
                  <span className="font-mono text-xs text-muted-foreground">
                    0{i + 1}
                  </span>
                  {s}
                </li>
              );
            })}
          </ol>

          <div className="mt-6 h-1.5 overflow-hidden rounded-full bg-muted">
            <motion.div
              className="h-full bg-gradient-brand"
              animate={{ width: `${((stage + 1) / STAGES.length) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>
      </div>

      {result && <ResultCard result={result} />}
    </Section>
  );
}

function BoundingBoxes() {
  return (
    <div className="pointer-events-none absolute inset-0">
      {[
        { top: "18%", left: "14%", w: "38%", h: "48%", label: "chassis" },
        { top: "48%", left: "58%", w: "28%", h: "30%", label: "battery" },
      ].map((b) => (
        <motion.div
          key={b.label}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="absolute rounded-lg border border-emerald"
          style={{ top: b.top, left: b.left, width: b.w, height: b.h }}
        >
          <span className="absolute -top-6 left-0 rounded-md bg-gradient-brand px-2 py-0.5 text-[0.6rem] font-semibold uppercase tracking-wider text-primary-foreground">
            {b.label}
          </span>
        </motion.div>
      ))}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-brand animate-scanline" />
    </div>
  );
}

function ResultCard({ result }: { result: RdeResult }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7 }}
      className="card-surface mt-6 overflow-hidden"
    >
      <div className="grid gap-8 p-7 md:grid-cols-[1.1fr_1fr]">
        <div>
          <Eyebrow>R5 Recommendation</Eyebrow>
          <h2 className="mt-4 text-3xl font-semibold">
            <span className="text-gradient">{result.action}</span>
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">{result.headline}</p>

          <dl className="mt-6 grid gap-4 sm:grid-cols-2">
            <Stat label="Product" value="Laptop" />
            <Stat label="Detected condition" value="Battery degradation" />
            <Stat label="Repairability" value={`${result.score} / 100`} />
            <Stat label="Repair vs replace" value={`${Math.round(result.costRatio * 100)}%`} />
            <Stat label="Estimated money saved" value="₹44,800" />
            <Stat label="Life extension" value="3 years" />
          </dl>

          <div className="mt-6 rounded-2xl border border-border p-4">
            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              <Sparkles className="h-3.5 w-3.5 text-lime" /> Why?
            </p>
            <ul className="mt-3 grid gap-2 text-sm text-muted-foreground">
              {result.reasoning.map((r) => (
                <li key={r} className="flex gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gradient-brand" />
                  {r}
                </li>
              ))}
            </ul>
          </div>

          <Button asChild variant="hero" size="lg" className="mt-6">
            <Link to="/skill-centers">
              Find ReLife Skill Center <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>

        <div className="rounded-2xl border border-border p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Component plan
          </p>
          <ul className="mt-4 grid gap-2">
            {componentPlan.map((c) => (
              <li
                key={c.part}
                className="flex items-center justify-between rounded-xl border border-border px-4 py-3 text-sm"
              >
                <span className="font-medium">{c.part}</span>
                <span className="text-emerald">{c.action}</span>
              </li>
            ))}
          </ul>
          <div className="mt-5 rounded-xl border border-border p-4 text-sm text-muted-foreground">
            <p>Waste avoided: 94% of unit mass</p>
            <p className="mt-1">Prototype estimate — not verified field data.</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-[0.14em] text-muted-foreground">{label}</dt>
      <dd className="mt-1 font-display text-lg font-semibold">{value}</dd>
    </div>
  );
}
