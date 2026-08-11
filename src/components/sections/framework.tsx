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
        title="Seven steps from broken to"
        gradientTail="reborn."
        subtitle="A single decision pipeline that runs from the customer's camera to the workshop bench."
      />

      <div className="relative mt-16">
        <div className="absolute left-[1.35rem] top-0 hidden h-full w-px bg-border md:block" />
        <div className="grid gap-4">
          {steps.map((s, i) => (
            <Reveal key={s.n} delay={i * 0.05}>
              <div className="relative flex flex-col gap-4 md:flex-row md:items-stretch">
                <span className="relative z-10 hidden h-11 w-11 shrink-0 place-items-center rounded-full border border-emerald/40 bg-surface md:grid">
                  <s.icon className="h-4 w-4 text-emerald" />
                </span>
                <div className="card-surface lift flex-1 p-6 md:ml-4">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="font-mono text-xs tracking-[0.18em] text-electric">
                      STEP {s.n}
                    </span>
                    <h3 className="font-display text-lg font-semibold">{s.title}</h3>
                  </div>
                  <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">
                    {s.body}
                  </p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
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
        subtitle="Every stage below preserves less value than the one above it. ReLife AI always searches upward first."
      />

      <div className="mt-14 grid gap-4">
        {r5.map((r, i) => (
          <Reveal key={r.code} delay={i * 0.06}>
            <div className="card-surface lift grid items-center gap-5 p-6 md:grid-cols-[auto_1fr_14rem]">
              <div className="flex items-center gap-4">
                <span className="grid h-12 w-12 place-items-center rounded-2xl border border-emerald/40">
                  <r.icon className="h-5 w-5 text-emerald" />
                </span>
                <div>
                  <p className="font-mono text-xs tracking-[0.2em] text-electric">{r.code}</p>
                  <h3 className="font-display text-xl font-semibold">{r.name}</h3>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">{r.body}</p>
              <div>
                <p className="mb-2 text-[0.65rem] uppercase tracking-[0.16em] text-muted-foreground">
                  Value preserved
                </p>
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: `${r.value}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 1, delay: 0.2 }}
                    className="h-full bg-gradient-brand"
                  />
                </div>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
