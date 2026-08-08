import { motion } from "framer-motion";
import { Cpu, Gauge, Layers, Sparkles } from "lucide-react";
import scanFan from "@/assets/scan-fan.jpg";
import { Reveal, Section, SectionHeading } from "./primitives";

const detection = [
  { label: "Product Detected", value: "Electric Fan" },
  { label: "Model", value: "Generic 1200mm Ceiling Fan" },
  { label: "Detected Issue", value: "Possible capacitor failure" },
  { label: "Estimated Repair", value: "₹120 – ₹250" },
  { label: "Estimated Replacement", value: "₹1,800 – ₹2,500" },
  { label: "Estimated Life Extension", value: "2 – 4 years" },
];

const inputs = [
  "AI Vision results",
  "Product age",
  "Fault information",
  "Repair cost",
  "Replacement cost",
  "Component condition",
  "Estimated remaining life",
  "Spare parts availability",
  "Repair history",
];

export function DetectionDashboard() {
  return (
    <Section id="detection">
      <SectionHeading
        eyebrow="AI Detection"
        title="See what"
        gradientTail="AI sees."
        subtitle="A live look at the vision layer: bounding boxes, component hypotheses and cost reasoning rendered in real time."
      />

      <Reveal>
        <div className="card-surface mt-14 grid gap-0 overflow-hidden lg:grid-cols-[1.15fr_1fr]">
          <div className="relative min-h-[22rem] overflow-hidden border-b border-border lg:border-b-0 lg:border-r">
            <img
              src={scanFan}
              alt="Ceiling fan motor housing being analysed by ReLife AI computer vision"
              loading="lazy"
              width={1280}
              height={960}
              className="h-full w-full object-cover"
            />
            <div className="pointer-events-none absolute inset-0">
              {[
                { top: "38%", left: "8%", w: "30%", h: "34%", label: "motor housing 0.97" },
                { top: "20%", left: "48%", w: "44%", h: "48%", label: "blade 0.93" },
                { top: "62%", left: "34%", w: "16%", h: "16%", label: "capacitor 0.88" },
              ].map((b, i) => (
                <motion.div
                  key={b.label}
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 + i * 0.2 }}
                  className="absolute rounded-lg border border-emerald"
                  style={{ top: b.top, left: b.left, width: b.w, height: b.h }}
                >
                  <span className="absolute -top-5 left-0 whitespace-nowrap rounded bg-gradient-brand px-1.5 py-0.5 text-[0.55rem] font-semibold uppercase tracking-wider text-primary-foreground">
                    {b.label}
                  </span>
                </motion.div>
              ))}
              <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-brand animate-scanline" />
            </div>
          </div>

          <div className="p-7">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-xs uppercase tracking-[0.16em] text-muted-foreground">
                <Layers className="h-3.5 w-3.5 text-electric" /> Vision output
              </span>
              <span className="font-mono text-xs text-muted-foreground">demo data</span>
            </div>

            <dl className="mt-6 grid gap-5 sm:grid-cols-2">
              {detection.map((d) => (
                <div key={d.label}>
                  <dt className="text-[0.68rem] uppercase tracking-[0.14em] text-muted-foreground">
                    {d.label}
                  </dt>
                  <dd className="mt-1 font-display text-[0.98rem] font-semibold">{d.value}</dd>
                </div>
              ))}
            </dl>

            <div className="mt-7 rounded-2xl border border-emerald/40 p-5 glow-ring">
              <p className="text-[0.68rem] uppercase tracking-[0.14em] text-muted-foreground">
                Repairability Score
              </p>
              <div className="mt-1 flex items-end gap-3">
                <p className="font-display text-4xl font-semibold text-gradient">92</p>
                <span className="pb-1 text-sm text-muted-foreground">/ 100</span>
              </div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
                <motion.div
                  initial={{ width: 0 }}
                  whileInView={{ width: "92%" }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.2 }}
                  className="h-full bg-gradient-brand"
                />
              </div>
              <p className="mt-4 flex items-center gap-2 font-display text-lg font-semibold text-emerald">
                <Sparkles className="h-4 w-4" /> Recommended action · REPAIR
              </p>
            </div>
          </div>
        </div>
      </Reveal>
    </Section>
  );
}

export function RdeSection() {
  return (
    <Section id="rde">
      <SectionHeading
        eyebrow="ReLife Decision Engine"
        title="Meet RDE. The brain behind"
        gradientTail="ReLife AI."
        subtitle="RDE fuses vision output with economics and material reality, then explains its recommendation instead of hiding it."
      />

      <div className="mt-14 grid gap-5 lg:grid-cols-[1fr_auto_1fr] lg:items-center">
        <Reveal>
          <div className="card-surface p-6">
            <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Inputs</p>
            <ul className="mt-4 grid gap-2">
              {inputs.map((i) => (
                <li
                  key={i}
                  className="flex items-center gap-3 rounded-xl border border-border px-4 py-2.5 text-sm text-muted-foreground transition-colors hover:border-electric/50 hover:text-foreground"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-gradient-brand" />
                  {i}
                </li>
              ))}
            </ul>
          </div>
        </Reveal>

        <Reveal delay={0.15}>
          <div className="relative mx-auto grid h-44 w-44 place-items-center rounded-full border border-emerald/40 glow-ring">
            <motion.span
              className="absolute inset-2 rounded-full border border-electric/40"
              animate={{ rotate: 360 }}
              transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
            />
            <motion.span
              className="absolute inset-8 rounded-full bg-gradient-brand opacity-20"
              animate={{ scale: [1, 1.12, 1], opacity: [0.15, 0.35, 0.15] }}
              transition={{ duration: 3.5, repeat: Infinity }}
            />
            <div className="relative text-center">
              <Cpu className="mx-auto h-6 w-6 text-emerald" />
              <p className="mt-2 font-display text-xl font-semibold">RDE</p>
              <p className="text-[0.65rem] uppercase tracking-[0.16em] text-muted-foreground">
                decision core
              </p>
            </div>
          </div>
        </Reveal>

        <Reveal delay={0.25}>
          <div className="card-surface p-6">
            <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Decision</p>
            <div className="mt-4 rounded-2xl border border-border p-5">
              <p className="flex items-center gap-2 text-[0.68rem] uppercase tracking-[0.14em] text-muted-foreground">
                <Gauge className="h-3.5 w-3.5 text-emerald" /> Repairability Score
              </p>
              <p className="mt-1 font-display text-3xl font-semibold text-gradient">0 – 100</p>
            </div>
            <ul className="mt-4 grid gap-2">
              {["REPAIR", "REUSE", "RETRIEVE", "REDESIGN", "RECYCLE"].map((a, i) => (
                <li
                  key={a}
                  className="flex items-center justify-between rounded-xl border border-border px-4 py-2.5 text-sm"
                >
                  <span className="font-medium">{a}</span>
                  <span className="font-mono text-xs text-muted-foreground">R{i + 1}</span>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-xs text-muted-foreground">
              Recycle is only returned when repair, reuse, retrieval and redesign are all
              impractical.
            </p>
          </div>
        </Reveal>
      </div>
    </Section>
  );
}
