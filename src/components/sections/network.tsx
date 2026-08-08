import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { motion, useInView } from "framer-motion";
import {
  Award,
  Banknote,
  Building2,
  Cpu,
  GraduationCap,
  HardHat,
  Handshake,
  Headphones,
  Database,
  PackageSearch,
  Repeat,
  ScanSearch,
  ShieldCheck,
  ShoppingBag,
  Truck,
  Wrench,
  Leaf,
  Users,
  Recycle,
  IndianRupee,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Reveal, Section, SectionHeading } from "./primitives";

export const jobs = [
  { title: "Repair Technician", icon: Wrench },
  { title: "Electronics Technician", icon: Cpu },
  { title: "Refurbishment Technician", icon: Repeat },
  { title: "AI Operator", icon: ScanSearch },
  { title: "Component Recovery Specialist", icon: PackageSearch },
  { title: "Collection Executive", icon: Truck },
  { title: "Quality Inspector", icon: ShieldCheck },
  { title: "Customer Support", icon: Headphones },
  { title: "Data Operator", icon: Database },
  { title: "Skill Development Trainer", icon: GraduationCap },
];

const revenue = [
  { title: "Repair service charges", icon: Wrench },
  { title: "Refurbished product sales", icon: ShoppingBag },
  { title: "Spare component sales", icon: PackageSearch },
  { title: "AI software subscriptions", icon: Cpu },
  { title: "AMC contracts", icon: ShieldCheck },
  { title: "Corporate repair contracts", icon: Building2 },
  { title: "Technician training", icon: GraduationCap },
  { title: "Certification", icon: Award },
  { title: "Skill Center franchise", icon: HardHat },
  { title: "Government & industrial projects", icon: Handshake },
];

const metrics = [
  { label: "Products Repaired", value: 12480, suffix: "", icon: Wrench },
  { label: "Waste Avoided", value: 96, suffix: " t", icon: Recycle },
  { label: "Components Retrieved", value: 38200, suffix: "", icon: PackageSearch },
  { label: "Jobs Supported", value: 420, suffix: "", icon: Users },
  { label: "Money Saved", value: 74, suffix: " Cr", icon: IndianRupee },
  { label: "Carbon Avoided", value: 1830, suffix: " tCO₂e", icon: Leaf },
];

const cities = [
  { name: "Delhi", x: 38, y: 24 },
  { name: "Jaipur", x: 30, y: 31 },
  { name: "Ahmedabad", x: 22, y: 44 },
  { name: "Mumbai", x: 24, y: 55 },
  { name: "Pune", x: 28, y: 59 },
  { name: "Hyderabad", x: 40, y: 62 },
  { name: "Bengaluru", x: 37, y: 74 },
  { name: "Chennai", x: 46, y: 76 },
  { name: "Kolkata", x: 64, y: 44 },
  { name: "Lucknow", x: 46, y: 30 },
  { name: "Guwahati", x: 78, y: 34 },
  { name: "Bhopal", x: 37, y: 43 },
];

export function SkillCentersSection() {
  return (
    <Section id="skill-centers">
      <SectionHeading
        eyebrow="ReLife Skill Centers"
        title="Every repair decision can"
        gradientTail="create a job."
        subtitle="ReLife AI connects repairable products with ReLife Skill Centers, where trained workers repair, refurbish and recover components."
      />

      <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {jobs.map((j, i) => (
          <Reveal key={j.title} delay={i * 0.04}>
            <div className="card-surface lift group h-full p-5">
              <span className="grid h-10 w-10 place-items-center rounded-xl border border-emerald/40">
                <j.icon className="h-4 w-4 text-emerald transition-transform group-hover:scale-110" />
              </span>
              <h3 className="mt-4 text-sm font-semibold leading-snug">{j.title}</h3>
            </div>
          </Reveal>
        ))}
      </div>

      <Reveal delay={0.1}>
        <div className="card-surface glow-ring mt-8 flex flex-col items-center gap-4 p-10 text-center">
          <h3 className="text-balance font-display text-2xl font-semibold sm:text-3xl">
            AI identifies the work. <span className="text-gradient">Skilled people do the work.</span>
          </h3>
          <Button asChild variant="glass" size="lg">
            <Link to="/skill-centers">
              Explore the network <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </Reveal>
    </Section>
  );
}

export function NationalNetwork() {
  return (
    <Section id="network">
      <SectionHeading
        eyebrow="National Network"
        title="Building India's"
        gradientTail="Circular Repair Network"
        subtitle="City → ReLife Skill Center → Technicians → Customers. The long-term vision is a nationwide mesh of repair centers, technicians, refurbishers, component recovery facilities and recycling partners."
      />

      <div className="mt-14 grid gap-6 lg:grid-cols-[1.3fr_1fr]">
        <Reveal>
          <div className="card-surface relative aspect-4/5 overflow-hidden p-4 sm:aspect-4/3">
            <div className="absolute inset-0 grid-bg opacity-60" />
            <svg viewBox="0 0 100 100" className="relative h-full w-full">
              <defs>
                <linearGradient id="netgrad" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="var(--emerald)" />
                  <stop offset="100%" stopColor="var(--electric)" />
                </linearGradient>
              </defs>
              <path
                d="M32 12 L44 10 L52 16 L62 14 L72 20 L80 30 L74 36 L66 34 L62 42 L68 48 L60 52 L54 62 L50 74 L44 84 L38 74 L34 62 L26 56 L22 46 L26 36 L24 26 Z"
                fill="none"
                stroke="url(#netgrad)"
                strokeWidth="0.5"
                className="opacity-60"
              />
              {cities.map((c, i) =>
                cities.slice(i + 1, i + 3).map((d) => (
                  <line
                    key={`${c.name}-${d.name}`}
                    x1={c.x}
                    y1={c.y}
                    x2={d.x}
                    y2={d.y}
                    stroke="url(#netgrad)"
                    strokeWidth="0.28"
                    strokeDasharray="2 3"
                    className="animate-dash opacity-70"
                  />
                )),
              )}
              {cities.map((c, i) => (
                <g key={c.name}>
                  <motion.circle
                    cx={c.x}
                    cy={c.y}
                    r="2.4"
                    fill="url(#netgrad)"
                    animate={{ opacity: [0.25, 1, 0.25], r: [1.8, 2.8, 1.8] }}
                    transition={{ duration: 3, repeat: Infinity, delay: i * 0.25 }}
                  />
                  <text
                    x={c.x + 3.4}
                    y={c.y + 1}
                    fontSize="2.4"
                    fill="currentColor"
                    className="text-muted-foreground"
                  >
                    {c.name}
                  </text>
                </g>
              ))}
            </svg>
          </div>
        </Reveal>

        <div className="grid content-start gap-4">
          {[
            { t: "City", d: "Demand is detected wherever a customer scans a broken product." },
            { t: "ReLife Skill Center", d: "The nearest center receives the case with a full RDE report." },
            { t: "Technicians", d: "Trained workers execute repair, refurbishment or recovery." },
            { t: "Customers", d: "The product returns with extended life and a verified record." },
          ].map((n, i) => (
            <Reveal key={n.t} delay={i * 0.08}>
              <div className="card-surface lift p-6">
                <p className="font-mono text-xs tracking-[0.18em] text-electric">
                  NODE 0{i + 1}
                </p>
                <h3 className="mt-1 font-display text-lg font-semibold">{n.t}</h3>
                <p className="mt-1.5 text-sm text-muted-foreground">{n.d}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </Section>
  );
}

export function BusinessModel() {
  return (
    <Section id="business">
      <SectionHeading
        eyebrow="Business Model"
        title="How ReLife AI can become"
        gradientTail="self-sustaining"
        subtitle="Circular repair works only if the economics work. Ten revenue streams across services, hardware, software and skills."
      />
      <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {revenue.map((r, i) => (
          <Reveal key={r.title} delay={i * 0.04}>
            <div className="card-surface lift group h-full p-5">
              <span className="grid h-10 w-10 place-items-center rounded-xl border border-electric/40">
                <r.icon className="h-4 w-4 text-electric transition-transform group-hover:scale-110" />
              </span>
              <h3 className="mt-4 text-sm font-semibold leading-snug">{r.title}</h3>
            </div>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}

function Counter({ value, suffix }: { value: number; suffix: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const [n, setN] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const start = performance.now();
    const dur = 1600;
    let raf = 0;
    const tick = (now: number) => {
      const p = Math.min((now - start) / dur, 1);
      setN(Math.round(value * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, value]);

  return (
    <span ref={ref} className="font-display text-4xl font-semibold text-gradient sm:text-5xl">
      {n.toLocaleString("en-IN")}
      {suffix}
    </span>
  );
}

export function ImpactDashboard() {
  return (
    <Section id="impact">
      <SectionHeading
        eyebrow="Impact · prototype metrics"
        title="Measured in products saved, not"
        gradientTail="products sold."
        subtitle="These figures are demo values for the prototype and will be replaced by live Skill Center data once centers are operational."
      />

      <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {metrics.map((m, i) => (
          <Reveal key={m.label} delay={i * 0.06}>
            <div className="card-surface lift relative overflow-hidden p-7">
              <div className="pointer-events-none absolute inset-0 halo opacity-60" />
              <div className="relative flex items-center justify-between">
                <span className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                  {m.label}
                </span>
                <m.icon className="h-4 w-4 text-emerald" />
              </div>
              <div className="relative mt-4">
                <Counter value={m.value} suffix={m.suffix} />
              </div>
              <p className="relative mt-2 text-xs text-muted-foreground">demo / prototype metric</p>
            </div>
          </Reveal>
        ))}
      </div>

      <Reveal delay={0.1}>
        <div className="card-surface mt-8 flex flex-col items-center gap-4 p-10 text-center">
          <Banknote className="h-6 w-6 text-lime" />
          <h3 className="text-balance font-display text-2xl font-semibold sm:text-3xl">
            Repair More. Waste Less. <span className="text-gradient">Build a Sustainable India.</span>
          </h3>
          <Button asChild variant="hero" size="xl">
            <Link to="/scan">
              Scan a Product <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </Reveal>
    </Section>
  );
}
