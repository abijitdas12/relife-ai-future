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
  const [customApiKey, setCustomApiKey] = useState<string>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("relife_gemini_api_key") || "";
    }
    return "";
  });
  const [showKeyInput, setShowKeyInput] = useState(false);
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

  const saveApiKey = (key: string) => {
    setCustomApiKey(key);
    if (typeof window !== "undefined") {
      if (key) {
        localStorage.setItem("relife_gemini_api_key", key);
      } else {
        localStorage.removeItem("relife_gemini_api_key");
      }
    }
  };

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

  const analyze = useCallback(
    async (image: string) => {
      setResult(null);
      setAnalysis(null);
      setError(null);
      setBusy(true);
      setStage(0);

      timers.current.forEach(clearTimeout);
      timers.current = [1, 2, 3].map((i) => setTimeout(() => setStage(i), 900 * i));

      try {
        const vision = await analyzeProductImage({
          data: { image, apiKey: customApiKey.trim() || undefined },
        });
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
    },
    [customApiKey],
  );

  const handleRefine = async (device: string, component: string, condition: string) => {
    if (!analysis) return;
    const { evaluateRuleEngine } = await import("@/lib/rule-engine");
    const newRule = await evaluateRuleEngine({
      device: { name: device, confidence: 0.95 },
      component: { name: component, confidence: 0.92 },
      condition: { name: condition, confidence: 0.90 },
    });

    const updatedVision: VisionAnalysis = {
      ...analysis,
      product: device,
      condition: condition,
      faults: [`${component}: ${condition}`, newRule.fault],
      detectedComponents: [
        {
          name: component,
          state: `${condition} (95% conf)`,
        },
      ],
      ruleResult: newRule,
    };

    setAnalysis(updatedVision);
    const rde = runRde({
      repairCost: updatedVision.repairCostInr,
      replacementCost: updatedVision.replacementCostInr,
      ageYears: updatedVision.ageYearsEstimate,
      repairability: updatedVision.repairability,
      componentAvailability: updatedVision.componentAvailability,
      remainingLife: updatedVision.remainingLifeYears,
      componentValue: updatedVision.componentValue,
    });
    setResult(rde);
  };

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
    stopCamera();
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
            {cameraOpen ? (
              <div className="relative w-full">
                <video
                  ref={videoRef}
                  playsInline
                  muted
                  className="mx-auto max-h-72 w-auto rounded-xl object-contain"
                />
                <div className="mt-4 flex flex-wrap justify-center gap-3">
                  <Button variant="hero" size="lg" onClick={capturePhoto}>
                    <Camera className="h-4 w-4" /> Capture Photo
                  </Button>
                  <Button variant="ghost" size="lg" onClick={stopCamera}>
                    Cancel
                  </Button>
                </div>
              </div>
            ) : preview ? (
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
              disabled={busy || cameraOpen}
              onClick={() => void openCamera()}
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

      {result && analysis && (
        <ResultCard
          result={result}
          analysis={analysis}
          onRefine={handleRefine}
        />
      )}
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

const REFINEMENT_PRESETS = [
  { label: "📱 Smartphone (Screen Crack)", device: "Smartphone", component: "Screen", condition: "Cracked" },
  { label: "📱 Smartphone (Corroded Port)", device: "Smartphone", component: "Charging Port", condition: "Corroded" },
  { label: "💻 Laptop (Swollen Battery)", device: "Laptop", component: "Battery", condition: "Swollen" },
  { label: "💻 Laptop (Dusty Fan)", device: "Laptop", component: "Fan", condition: "Dusty" },
  { label: "⚡ Charger (Frayed Cable)", device: "Charger", component: "Cable", condition: "Frayed" },
  { label: "📟 Circuit Board (Burned IC)", device: "Circuit Board", component: "Board", condition: "Burned" },
  { label: "🖥️ Television (Cracked Screen)", device: "Television", component: "Screen", condition: "Cracked" },
  { label: "🎧 Earphones (Corroded Pin)", device: "Earphones", component: "Plug", condition: "Corroded" },
];

function ResultCard({
  result,
  analysis,
  onRefine,
}: {
  result: RdeResult;
  analysis: VisionAnalysis;
  onRefine: (device: string, component: string, condition: string) => void;
}) {
  const rule = analysis.ruleResult;
  const pred = rule.prediction;
  const saved = Math.max(0, analysis.replacementCostInr - analysis.repairCostInr);

  if (rule.lowConfidence) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card-surface mt-6 p-6 border-amber-500/40 bg-amber-500/10 text-amber-200 rounded-2xl"
      >
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-6 w-6 text-amber-400 shrink-0 mt-0.5" />
          <div className="w-full">
            <h3 className="font-display text-lg font-semibold text-amber-300">
              Low Confidence / Unclear Object Detection
            </h3>
            <p className="mt-1 text-sm text-amber-200/90">{rule.confidenceMessage}</p>
            
            <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-amber-300">
              Select your electronic device & component to run 5R Analysis:
            </p>
            <div className="mt-2.5 flex flex-wrap gap-2">
              {REFINEMENT_PRESETS.map((p) => (
                <button
                  key={p.label}
                  onClick={() => onRefine(p.device, p.component, p.condition)}
                  className="rounded-lg border border-amber-500/40 bg-amber-500/20 px-3 py-1.5 text-xs font-medium text-amber-100 hover:bg-amber-500/30 transition-colors"
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  const get5REmoji = (action: string) => {
    switch (action) {
      case "Recycle":
        return "♻️";
      case "Reuse":
        return "🛠️";
      case "Retrieve":
        return "📦";
      case "Redesign":
        return "📐";
      case "Reduce":
        return "📉";
      default:
        return "⚡";
    }
  };

  const getSeverityBadgeClass = (severity: string) => {
    switch (severity) {
      case "High":
        return "bg-rose-500/20 text-rose-400 border-rose-500/40";
      case "Medium":
        return "bg-amber-500/20 text-amber-400 border-amber-500/40";
      case "Low":
        return "bg-emerald/20 text-emerald border-emerald/40";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7 }}
      className="card-surface mt-6 overflow-hidden rounded-3xl border border-emerald/40 glow-ring"
    >
      <div className="grid gap-8 p-7 md:grid-cols-[1.15fr_1fr]">
        <div>
          {/* Section 1: ML Model Output */}
          <div className="rounded-2xl border border-border bg-background/50 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5" /> 🤖 ML Vision Model Output (Eyes)
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <Stat
                label="Device"
                value={`${pred.device.name}`}
                sub={`${Math.round(pred.device.confidence * 100)}% confidence`}
              />
              <Stat
                label="Component"
                value={`${pred.component.name}`}
                sub={`${Math.round(pred.component.confidence * 100)}% confidence`}
              />
              <Stat
                label="Visible Condition"
                value={`${pred.condition.name}`}
                sub={`${Math.round(pred.condition.confidence * 100)}% confidence`}
              />
            </div>

            <div className="mt-4 border-t border-border/60 pt-3">
              <p className="text-[0.7rem] font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                Refine / Change Device Target:
              </p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {REFINEMENT_PRESETS.map((p) => (
                  <button
                    key={p.label}
                    onClick={() => onRefine(p.device, p.component, p.condition)}
                    className={cn(
                      "rounded-lg border px-2.5 py-1 text-xs transition-all",
                      pred.device.name === p.device && pred.condition.name === p.condition
                        ? "border-emerald bg-emerald/15 text-emerald font-semibold shadow-sm"
                        : "border-border/80 bg-background/60 text-muted-foreground hover:border-emerald/40 hover:text-foreground",
                    )}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Section 2: Database Rule Engine Decision */}
          <div className="mt-6">
            <Eyebrow>🧠 Database Rule Engine Decision</Eyebrow>
            <div className="mt-3 flex items-center gap-3">
              <h2 className="text-3xl font-semibold">
                <span className="text-gradient">
                  {get5REmoji(rule.five_r)} {rule.five_r.toUpperCase()}
                </span>
              </h2>
              <span
                className={cn(
                  "rounded-full border px-3 py-1 text-xs font-mono font-semibold uppercase tracking-wider",
                  getSeverityBadgeClass(rule.severity),
                )}
              >
                {rule.severity} Severity
              </span>
            </div>
            <p className="mt-3 text-sm text-foreground font-medium">
              Potential Fault: <span className="text-emerald">{rule.fault}</span>
            </p>
            <p className="mt-2 text-sm text-muted-foreground">{rule.recommendation}</p>

            {/* Safety Warning */}
            {rule.safety_warning && (
              <div className="mt-4 rounded-xl border border-rose-500/40 bg-rose-500/10 p-3.5 text-xs text-rose-300">
                <p className="font-semibold flex items-center gap-1.5">
                  <AlertTriangle className="h-4 w-4 text-rose-400 shrink-0" /> Safety Precaution
                </p>
                <p className="mt-1">{rule.safety_warning}</p>
              </div>
            )}

            <dl className="mt-6 grid gap-4 sm:grid-cols-2">
              <Stat label="Repairability Score" value={`${result.score} / 100`} />
              <Stat label="Repair vs Replace" value={`${Math.round(result.costRatio * 100)}%`} />
              <Stat label="Estimated Repair Cost" value={inr(analysis.repairCostInr)} />
              <Stat label="Estimated Money Saved" value={inr(saved)} />
            </dl>

            <Button asChild variant="hero" size="lg" className="mt-6 w-full sm:w-auto">
              <Link to="/skill-centers">
                Find ReLife Skill Center <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>

        {/* Right Rail: RDE Details & System Disclaimer */}
        <div className="grid content-start gap-5">
          <div className="rounded-2xl border border-border p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Detected Component Plan
            </p>
            <ul className="mt-4 grid gap-2">
              {analysis.detectedComponents.map((c) => (
                <li
                  key={c.name}
                  className="flex items-center justify-between gap-3 rounded-xl border border-border px-4 py-3 text-sm"
                >
                  <span className="font-medium">{c.name}</span>
                  <span className="text-right text-emerald font-mono text-xs">{c.state}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-border p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Reasoning & RDE Rules
            </p>
            <ul className="mt-3 grid gap-2 text-xs text-muted-foreground">
              {[...result.reasoning, ...(analysis.notes ? [analysis.notes] : [])].map((r) => (
                <li key={r} className="flex gap-2">
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-gradient-brand" />
                  {r}
                </li>
              ))}
            </ul>
          </div>

          {/* Important System Limitation Disclaimer */}
          <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-4 text-xs text-muted-foreground">
            <p className="font-semibold text-amber-400 flex items-center gap-1.5">
              <AlertTriangle className="h-3.5 w-3.5" /> System Limitation Notice
            </p>
            <p className="mt-1.5 leading-relaxed">{rule.disclaimer}</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function Stat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-[0.14em] text-muted-foreground">{label}</dt>
      <dd className="mt-1 font-display text-lg font-semibold">{value}</dd>
      {sub && <p className="text-[0.7rem] text-emerald font-mono">{sub}</p>}
    </div>
  );
}

