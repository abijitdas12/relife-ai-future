import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowRight, Boxes, Cpu, Eye, ScanLine } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ContainerScroll } from "@/components/ui/container-scroll-animation";
import { Eyebrow } from "./primitives";

const pipeline = [
  { label: "Broken Product", icon: Boxes },
  { label: "AI Vision", icon: Eye },
  { label: "RDE", icon: Cpu },
  { label: "R5 Decision", icon: ScanLine },
];

export function Hero() {
  return (
    <section className="relative">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[54rem] halo" />
      <div className="pointer-events-none absolute inset-0 grid-bg opacity-70" />
      <Particles />

      <ContainerScroll
        titleComponent={
          <div className="flex flex-col items-center gap-6 px-4">
            <Eyebrow>AI × Circular Economy × R5</Eyebrow>
            <h1 className="text-balance text-5xl font-semibold leading-[0.98] sm:text-6xl md:text-[5.5rem]">
              Don't Replace It.
              <br />
              <span className="text-gradient">ReLife It.</span>
            </h1>
            <p className="max-w-2xl text-pretty text-[1.02rem] leading-relaxed text-muted-foreground md:text-lg">
              AI-powered intelligence that decides whether a broken product should be repaired,
              reused, retrieved, redesigned, or recycled.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Button asChild variant="hero" size="xl">
                <Link to="/scan">
                  Scan a Product <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="glass" size="xl">
                <Link to="/" hash="how-it-works">
                  Explore the System
                </Link>
              </Button>
            </div>
          </div>
        }
      >
        <ScanVisual />
      </ContainerScroll>
    </section>
  );
}

function ScanVisual() {
  return (
    <div className="relative flex h-full w-full flex-col justify-between gap-4 p-5 md:p-8">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-emerald animate-pulse-glow" />
          ReLife AI · live vision stream
        </span>
        <span className="font-mono">RDE v0.9 · prototype</span>
      </div>

      <div className="grid flex-1 gap-4 md:grid-cols-[1.3fr_1fr]">
        <div className="relative overflow-hidden rounded-2xl border border-border">
          <div className="absolute inset-0 grid-bg opacity-60" />
          <motion.div
            animate={{ rotateY: [0, 14, 0, -14, 0], rotateX: [0, 6, 0] }}
            transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-0 grid place-items-center"
            style={{ transformStyle: "preserve-3d" }}
          >
            <DeviceWire />
          </motion.div>

          {[
            { top: "26%", left: "20%", w: "34%", h: "36%", label: "capacitor" },
            { top: "56%", left: "56%", w: "26%", h: "24%", label: "motor coil" },
          ].map((b) => (
            <div
              key={b.label}
              className="absolute rounded-lg border border-emerald/70"
              style={{ top: b.top, left: b.left, width: b.w, height: b.h }}
            >
              <span className="absolute -top-5 left-0 rounded bg-gradient-brand px-1.5 py-0.5 text-[0.55rem] font-semibold uppercase tracking-wider text-primary-foreground">
                {b.label}
              </span>
            </div>
          ))}
          <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-brand animate-scanline" />
        </div>

        <div className="grid content-start gap-3">
          {pipeline.map((p, i) => (
            <motion.div
              key={p.label}
              initial={{ opacity: 0.3 }}
              animate={{ opacity: [0.35, 1, 0.35] }}
              transition={{ duration: 4, repeat: Infinity, delay: i * 0.9 }}
              className="flex items-center gap-3 rounded-xl border border-border px-4 py-3 text-sm"
            >
              <p.icon className="h-4 w-4 text-emerald" />
              <span className="font-medium">{p.label}</span>
              {i < pipeline.length - 1 && (
                <span className="ml-auto font-mono text-xs text-muted-foreground">↓</span>
              )}
            </motion.div>
          ))}
          <div className="mt-1 rounded-xl border border-emerald/40 p-4 glow-ring">
            <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
              Repairability Score
            </p>
            <p className="font-display text-3xl font-semibold text-gradient">92 / 100</p>
            <p className="mt-1 text-xs text-muted-foreground">Recommended action · REPAIR</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function DeviceWire() {
  return (
    <svg viewBox="0 0 200 200" className="h-[70%] w-[70%]" aria-hidden="true">
      <defs>
        <linearGradient id="wire" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="var(--emerald)" />
          <stop offset="100%" stopColor="var(--electric)" />
        </linearGradient>
      </defs>
      <g fill="none" stroke="url(#wire)" strokeWidth="1.4" strokeLinecap="round">
        <circle cx="100" cy="100" r="26" />
        <circle cx="100" cy="100" r="60" strokeDasharray="6 10" className="opacity-60" />
        <path d="M100 74 C130 40 168 44 176 30" />
        <path d="M126 100 C168 118 176 152 190 162" />
        <path d="M74 100 C34 118 24 150 10 162" />
        <rect x="86" y="86" width="28" height="28" rx="6" />
        <path d="M60 40h40M40 60v40" className="opacity-50" />
      </g>
    </svg>
  );
}

function Particles() {
  const dots = Array.from({ length: 22 });
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {dots.map((_, i) => (
        <motion.span
          key={i}
          className="absolute h-1 w-1 rounded-full bg-gradient-brand"
          style={{ left: `${(i * 37) % 100}%`, top: `${(i * 53) % 100}%` }}
          animate={{ y: [0, -40, 0], opacity: [0.1, 0.8, 0.1] }}
          transition={{ duration: 6 + (i % 5), repeat: Infinity, delay: i * 0.3 }}
        />
      ))}
    </div>
  );
}
