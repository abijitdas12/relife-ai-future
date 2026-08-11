import { motion } from "framer-motion";
import {
  Boxes,
  BrainCircuit,
  Camera,
  ClipboardCheck,
  Cpu,
  Eye,
  Factory,
  Gauge,
  Recycle,
  Repeat,
  Sparkles,
  Wrench,
} from "lucide-react";
import { Reveal, Section, SectionHeading } from "./primitives";

const pillars = [
  {
    icon: Eye,
    title: "AI Vision",
    body: "Computer vision identifies the product, model and visible condition from a single photo.",
  },
  {
    icon: Cpu,
    title: "RDE",
    body: "The ReLife Decision Engine analyses repairability, cost, condition, age and component value.",
  },
  {
    icon: Sparkles,
    title: "R5 Action",
    body: "The system recommends Repair, Reuse, Retrieve, Redesign or Recycle — in that order of value.",
  },
];

const phases = [
  {
    id: "P1",
    label: "Capture & Identify",
    hint: "Seconds · on the customer's phone",
    steps: [
      { n: "01", title: "Scan", icon: Camera, body: "Photo upload or live camera capture of the damaged product." },
      { n: "02", title: "Identify", icon: Eye, body: "AI reads product type, brand, model and visible damage." },
    ],
  },
  {
    id: "P2",
    label: "Decide",
    hint: "Instant · ReLife Decision Engine",
    steps: [
      {
        n: "03",
        title: "Analyze",
        icon: BrainCircuit,
        body: "Age, repair cost, replacement cost, component condition and remaining life are combined.",
      },
      { n: "04", title: "Score", icon: Gauge, body: "The RDE returns a Repairability Score from 0 to 100." },
      { n: "05", title: "R5 Decision", icon: Sparkles, body: "Reduce, Reuse, Retrieve, Redesign or Recycle is selected." },
    ],
  },
  {
    id: "P3",
    label: "ReLife",
    hint: "Days · Skill Center bench",
    steps: [
      { n: "06", title: "Route", icon: Factory, body: "The job is assigned to the nearest ReLife Skill Center." },
      {
        n: "07",
        title: "Product ReLife",
        icon: Wrench,
        body: "A trained technician repairs, refurbishes, retrieves parts or recycles the remainder.",
      },
    ],
  },
];

const r5 = [
  { code: "R1", name: "REDUCE", body: "Prevent unnecessary replacement in the first place.", icon: ClipboardCheck, value: 100 },
  { code: "R2", name: "REUSE", body: "Extend the product's useful life as it is.", icon: Repeat, value: 82 },
  { code: "R3", name: "RETRIEVE", body: "Recover valuable functional components.", icon: Boxes, value: 62 },
  { code: "R4", name: "REDESIGN", body: "Convert recovered parts into useful products.", icon: Wrench, value: 42 },
  { code: "R5", name: "RECYCLE", body: "Recycle only what cannot be reused.", icon: Recycle, value: 20 },
];


export function WhatIs() {
  return (
    <Section id="about">
      <SectionHeading
        eyebrow="What is ReLife AI"
        title="The intelligence layer for a"
        gradientTail="circular economy."
        subtitle="ReLife AI analyses damaged products and recommends the most sustainable action before they become waste — turning disposal decisions into data-driven ones."
      />
      <div className="mt-14 grid gap-5 md:grid-cols-3">
        {pillars.map((p, i) => (
          <Reveal key={p.title} delay={i * 0.1}>
            <div className="card-surface lift group h-full p-7">
              <span className="relative grid h-12 w-12 place-items-center rounded-2xl border border-emerald/40">
                <span className="absolute inset-0 rounded-2xl bg-gradient-brand opacity-15 transition-opacity group-hover:opacity-30" />
                <p.icon className="relative h-5 w-5 text-emerald transition-transform group-hover:scale-110" />
              </span>
              <h3 className="mt-5 font-display text-xl font-semibold">{p.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{p.body}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}

export function HowItWorks() {
  return (
    <Section id="how-it-works">
      <SectionHeading
        eyebrow="How it works"
        title="Three phases, seven steps, one"
        gradientTail="decision pipeline."
        subtitle="Every device follows the same path — from the customer's camera, through the ReLife Decision Engine, to a Skill Center bench."
      />

      <div className="mt-14 grid gap-4 lg:grid-cols-3">
        {phases.map((phase, pi) => (
          <Reveal key={phase.id} delay={pi * 0.08}>
            <div className="card-surface relative flex h-full flex-col p-6">
              <div className="flex items-baseline justify-between gap-3 border-b border-border pb-4">
                <div>
                  <p className="font-mono text-[0.65rem] tracking-[0.22em] text-electric">
                    PHASE {pi + 1} / 3
                  </p>
                  <h3 className="mt-1 font-display text-xl font-semibold">{phase.label}</h3>
                </div>
                <span className="font-mono text-[0.6rem] uppercase tracking-[0.14em] text-muted-foreground">
                  {phase.steps.length} steps
                </span>
              </div>
              <p className="mt-3 text-xs text-muted-foreground">{phase.hint}</p>

              <ol className="relative mt-5 grid gap-3">
                <span className="absolute left-[1.05rem] top-3 bottom-3 w-px bg-border" aria-hidden />
                {phase.steps.map((s) => (
                  <li key={s.n} className="relative flex gap-4 rounded-xl border border-border/60 bg-muted/30 p-4">
                    <span className="relative z-10 grid h-[2.1rem] w-[2.1rem] shrink-0 place-items-center rounded-lg border border-emerald/40 bg-surface">
                      <s.icon className="h-4 w-4 text-emerald" />
                    </span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[0.65rem] tracking-[0.16em] text-lime">
                          {s.n}
                        </span>
                        <h4 className="font-display text-sm font-semibold">{s.title}</h4>
                      </div>
                      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{s.body}</p>
                    </div>
                  </li>
                ))}
              </ol>

              {pi < phases.length - 1 && (
                <ArrowRight className="absolute -right-[1.15rem] top-1/2 hidden h-5 w-5 -translate-y-1/2 text-emerald/70 lg:block" />
              )}
            </div>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}

export function R5Framework() {
  return (
    <Section id="r5">
      <SectionHeading
        eyebrow="R5 Framework"
        title="Recycle is the"
        gradientTail="last resort."
        subtitle="The engine always searches upward first. Each tier below preserves less of the product's original value than the one above it."
      />

      <div className="mt-14 grid gap-6 lg:grid-cols-[auto_1fr]">
        <div className="hidden shrink-0 flex-col items-center justify-between py-2 lg:flex">
          <span className="font-mono text-[0.6rem] uppercase tracking-[0.18em] text-emerald">
            Most value
          </span>
          <span className="my-3 w-px flex-1 bg-gradient-to-b from-emerald via-electric to-muted" />
          <span className="font-mono text-[0.6rem] uppercase tracking-[0.18em] text-muted-foreground">
            Last resort
          </span>
        </div>

        <div className="grid gap-3">
          {r5.map((r, i) => (
            <Reveal key={r.code} delay={i * 0.06}>
              <div className="card-surface lift relative overflow-hidden p-5 sm:p-6">
                <motion.span
                  aria-hidden
                  initial={{ width: 0 }}
                  whileInView={{ width: `${r.value}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.9, delay: 0.1 }}
                  className="absolute inset-y-0 left-0 bg-gradient-brand opacity-[0.09]"
                />
                <div className="relative grid items-center gap-4 sm:grid-cols-[auto_1fr_auto]">
                  <div className="flex items-center gap-4">
                    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-emerald/40">
                      <r.icon className="h-5 w-5 text-emerald" />
                    </span>
                    <div className="sm:w-36">
                      <p className="font-mono text-[0.65rem] tracking-[0.22em] text-electric">
                        TIER {r.code}
                      </p>
                      <h3 className="font-display text-lg font-semibold leading-tight">{r.name}</h3>
                    </div>
                  </div>
                  <p className="text-sm leading-relaxed text-muted-foreground">{r.body}</p>
                  <div className="sm:w-40">
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="text-[0.6rem] uppercase tracking-[0.16em] text-muted-foreground">
                        Value kept
                      </span>
                      <span className="font-mono text-sm text-foreground">{r.value}%</span>
                    </div>
                    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: `${r.value}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.9, delay: 0.2 }}
                        className="h-full bg-gradient-brand"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </Section>
  );

}
