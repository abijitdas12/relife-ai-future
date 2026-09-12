import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  AlertTriangle,
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
import { analyzeProductImage, type VisionAnalysis } from "@/lib/vision.functions";
import { cn } from "@/lib/utils";

const STAGES = [
  "Uploading image",
  "Gemini Vision",
  "Product detection",
  "Fault analysis",
  "RDE scoring",
  "R5 recommendation",
];

const inr = (n: number) => `₹${Math.round(n).toLocaleString("en-IN")}`;

function readAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Could not read that file."));
    reader.readAsDataURL(file);
  });
}

export function ScanFlow() {
  const [preview, setPreview] = useState<string | null>(null);
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const [stage, setStage] = useState(-1);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<VisionAnalysis | null>(null);
  const [result, setResult] = useState<RdeResult | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const [cameraOpen, setCameraOpen] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(
    () => () => {
      timers.current.forEach(clearTimeout);
      streamRef.current?.getTracks().forEach((t) => t.stop());
    },
    [],
  );

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setCameraOpen(false);
  }, []);

  const openCamera = useCallback(async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
        audio: false,
      });
      streamRef.current = stream;
      setCameraOpen(true);
      requestAnimationFrame(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          void videoRef.current.play().catch(() => undefined);
        }
      });
    } catch {
      setError(
        "Camera is unavailable or permission was denied. Please allow camera access or use Upload Image instead.",
      );
    }
  }, []);

  const capturePhoto = useCallback(() => {
    const video = videoRef.current;
    if (!video || !video.videoWidth) return;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d")?.drawImage(video, 0, 0);
    const url = canvas.toDataURL("image/jpeg", 0.9);
    stopCamera();
    setPreview(url);
    setDataUrl(url);
    void analyze(url);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stopCamera]);

  const analyze = useCallback(async (image: string) => {
    setResult(null);
    setAnalysis(null);
    setError(null);
    setBusy(true);
    setStage(0);

    timers.current.forEach(clearTimeout);
    timers.current = [1, 2, 3].map((i) => setTimeout(() => setStage(i), 900 * i));

    try {
      const vision = await analyzeProductImage({ data: { image } });
      timers.current.forEach(clearTimeout);
      setAnalysis(vision);
      setStage(4);
      const rde = runRde({
        repairCost: vision.repairCostInr,
        replacementCost: vision.replacementCostInr,
        ageYears: vision.ageYearsEstimate,
        repairability: vision.repairability,
        componentAvailability: vision.componentAvailability,
        remainingLife: vision.remainingLifeYears,
        componentValue: vision.componentValue,
      });
      timers.current = [
        setTimeout(() => {
          setStage(5);
          setResult(rde);
        }, 600),
      ];
    } catch (e) {
      timers.current.forEach(clearTimeout);
      setStage(-1);
      setError(e instanceof Error ? e.message : "Analysis failed. Please try again.");
    } finally {
      setBusy(false);
    }
  }, []);

  const onFile = async (file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Please choose an image file.");
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      setError("Image is larger than 8MB — please use a smaller photo.");
      return;
    }
    setPreview(URL.createObjectURL(file));
    const url = await readAsDataUrl(file);
    setDataUrl(url);
    void analyze(url);
  };

  return (
    <Section className="pt-6">
      <div className="flex flex-col items-center gap-4 text-center">
        <Eyebrow>Gemini Vision × RDE × R5</Eyebrow>
        <h1 className="text-4xl font-semibold sm:text-5xl md:text-6xl">
          Scan Your <span className="text-gradient">Product</span>
        </h1>
        <p className="max-w-xl text-muted-foreground">
          Upload a photo of your broken product. Gemini Vision identifies it, ReLife AI analyses the
          fault and returns an R5 decision in seconds.
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
              void onFile(e.dataTransfer.files[0]);
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
                {busy && <ScanOverlay />}
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
                  Drag and drop, choose a file, or use your camera. The photo is sent once to Gemini
                  Vision for identification and never stored.
                </p>
              </div>
            )}
          </div>

          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => void onFile(e.target.files?.[0])}
          />

          <div className="relative mt-6 flex flex-wrap gap-3">
            <Button
              variant="hero"
              size="lg"
              disabled={busy}
              onClick={() => inputRef.current?.click()}
            >
              <Upload className="h-4 w-4" /> Upload Image
            </Button>
            <Button
              variant="glass"
              size="lg"
              disabled={busy}
              onClick={() => {
                if (inputRef.current) {
                  inputRef.current.setAttribute("capture", "environment");
                  inputRef.current.click();
                }
              }}
            >
              <Camera className="h-4 w-4" /> Use Camera
            </Button>
            {dataUrl && (
              <Button
                variant="ghost"
                size="lg"
                disabled={busy}
                onClick={() => void analyze(dataUrl)}
              >
                <RefreshCw className={cn("h-4 w-4", busy && "animate-spin")} /> Re-analyze
              </Button>
            )}
          </div>

          {error && (
            <p className="relative mt-4 flex items-start gap-2 rounded-xl border border-border px-4 py-3 text-sm text-muted-foreground">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-lime" />
              {error}
            </p>
          )}
        </div>

        {/* Pipeline */}
        <div className="card-surface p-6">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Cpu className="h-4 w-4 text-electric" />
            {stage < 0 ? "Pipeline idle" : result ? "Analysis complete" : "Analyzing product..."}
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
                  <span className="font-mono text-xs text-muted-foreground">0{i + 1}</span>
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

          {analysis && (
            <div className="mt-6 grid gap-2 rounded-2xl border border-border p-4 text-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Vision output
              </p>
              <p className="font-display text-lg font-semibold">{analysis.product}</p>
              <p className="text-muted-foreground">
                {analysis.brandGuess} · {analysis.category} · {analysis.condition}
              </p>
            </div>
          )}
        </div>
      </div>

      {result && analysis && <ResultCard result={result} analysis={analysis} />}
    </Section>
  );
}

function ScanOverlay() {
  return (
    <div className="pointer-events-none absolute inset-0">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-brand animate-scanline" />
      <div className="absolute inset-0 rounded-xl border border-emerald/40" />
    </div>
  );
}

function ResultCard({ result, analysis }: { result: RdeResult; analysis: VisionAnalysis }) {
  const saved = Math.max(0, analysis.replacementCostInr - analysis.repairCostInr);
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
            <Stat label="Product" value={analysis.product} />
            <Stat label="Detected condition" value={analysis.condition} />
            <Stat label="Repairability" value={`${result.score} / 100`} />
            <Stat label="Repair vs replace" value={`${Math.round(result.costRatio * 100)}%`} />
            <Stat label="Estimated repair" value={inr(analysis.repairCostInr)} />
            <Stat label="Estimated money saved" value={inr(saved)} />
            <Stat label="Life extension" value={`${analysis.remainingLifeYears} years`} />
            <Stat label="Estimated age" value={`${analysis.ageYearsEstimate} years`} />
          </dl>

          <div className="mt-6 rounded-2xl border border-border p-4">
            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              <Sparkles className="h-3.5 w-3.5 text-lime" /> Why?
            </p>
            <ul className="mt-3 grid gap-2 text-sm text-muted-foreground">
              {[...result.reasoning, ...(analysis.notes ? [analysis.notes] : [])].map((r) => (
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

        <div className="grid content-start gap-5">
          {analysis.faults.length > 0 && (
            <div className="rounded-2xl border border-border p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Detected faults
              </p>
              <ul className="mt-4 grid gap-2 text-sm">
                {analysis.faults.map((f) => (
                  <li key={f} className="flex gap-2 text-muted-foreground">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gradient-brand" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {analysis.detectedComponents.length > 0 && (
            <div className="rounded-2xl border border-border p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Component plan
              </p>
              <ul className="mt-4 grid gap-2">
                {analysis.detectedComponents.map((c) => (
                  <li
                    key={c.name}
                    className="flex items-center justify-between gap-3 rounded-xl border border-border px-4 py-3 text-sm"
                  >
                    <span className="font-medium">{c.name}</span>
                    <span className="text-right text-emerald">{c.state}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="rounded-xl border border-border p-4 text-sm text-muted-foreground">
            <p>Estimates generated by Gemini Vision from a single photo.</p>
            <p className="mt-1">A Skill Center bench test confirms the final quote.</p>
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
