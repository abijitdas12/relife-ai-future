import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowRight, Briefcase, GraduationCap, MapPin, Search, Send, X } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Eyebrow, Reveal, Section, SectionHeading } from "@/components/sections/primitives";
import { cn } from "@/lib/utils";

type Job = {
  title: string;
  track: "Repair" | "Recovery" | "Logistics" | "Quality" | "AI & Ops" | "People";
  level: string;
  pay: string;
  locations: string;
  blurb: string;
};

const JOBS: Job[] = [
  {
    title: "Repair Technician",
    track: "Repair",
    level: "Entry – Mid",
    pay: "₹18,000 – ₹32,000 / month",
    locations: "Pune · Bengaluru · Delhi NCR",
    blurb: "Diagnose and repair household and personal devices on the ReLife bench.",
  },
  {
    title: "Electronics Technician",
    track: "Repair",
    level: "Mid",
    pay: "₹22,000 – ₹38,000 / month",
    locations: "Bengaluru · Chennai",
    blurb: "Board-level fault finding, soldering, power and motor circuit repair.",
  },
  {
    title: "Computer / Laptop Technician",
    track: "Repair",
    level: "Mid",
    pay: "₹24,000 – ₹42,000 / month",
    locations: "Bengaluru · Delhi NCR · Pune",
    blurb: "Chip-level laptop repair, storage recovery, display and battery replacement.",
  },
  {
    title: "Refurbishment Technician",
    track: "Repair",
    level: "Entry – Mid",
    pay: "₹18,000 – ₹30,000 / month",
    locations: "Delhi NCR · Ahmedabad",
    blurb: "Restore repaired units to resale-grade condition and document their history.",
  },
  {
    title: "Component Recovery Specialist",
    track: "Recovery",
    level: "Mid",
    pay: "₹20,000 – ₹34,000 / month",
    locations: "Chennai · Ahmedabad",
    blurb: "Harvest reusable parts safely and grade them for the spare marketplace.",
  },
  {
    title: "Quality Testing Technician",
    track: "Quality",
    level: "Mid",
    pay: "₹22,000 – ₹36,000 / month",
    locations: "Pune · Bengaluru",
    blurb: "Run post-repair test protocols and sign off warranty-ready devices.",
  },
  {
    title: "Parts & Inventory Executive",
    track: "Logistics",
    level: "Entry – Mid",
    pay: "₹18,000 – ₹28,000 / month",
    locations: "All centers",
    blurb: "Own spare stock, vendor orders and part traceability across jobs.",
  },
  {
    title: "Collection & Logistics Worker",
    track: "Logistics",
    level: "Entry",
    pay: "₹15,000 – ₹24,000 / month + incentives",
    locations: "All pickup cities",
    blurb: "Collect devices from customer doorsteps and deliver them to Skill Centers.",
  },
  {
    title: "Material Sorting Worker",
    track: "Recovery",
    level: "Entry",
    pay: "₹14,000 – ₹22,000 / month",
    locations: "Chennai · Kolkata",
    blurb: "Segregate recyclable material streams safely for certified recyclers.",
  },
  {
    title: "Repair Skills Trainer",
    track: "People",
    level: "Senior",
    pay: "₹35,000 – ₹60,000 / month",
    locations: "Pune · Delhi NCR",
    blurb: "Train new technicians on ReLife repair standards and R5 decision-making.",
  },
  {
    title: "ReLife AI Operator",
    track: "AI & Ops",
    level: "Mid",
    pay: "₹26,000 – ₹45,000 / month",
    locations: "Bengaluru · remote-friendly",
    blurb: "Run AI scans, validate detections and feed corrections back into the engine.",
  },
  {
    title: "Customer Support Executive",
    track: "People",
    level: "Entry – Mid",
    pay: "₹18,000 – ₹30,000 / month",
    locations: "Pune · remote-friendly",
    blurb: "Guide customers through pickups, estimates, approvals and returns.",
  },
  {
    title: "Skill Center Manager",
    track: "AI & Ops",
    level: "Senior",
    pay: "₹45,000 – ₹80,000 / month",
    locations: "One per city center",
    blurb: "Own bench throughput, team performance and center-level circular impact.",
  },
];

const TRACKS = ["All", "Repair", "Recovery", "Logistics", "Quality", "AI & Ops", "People"] as const;

export const Route = createFileRoute("/careers")({
  head: () => ({
    meta: [
      { title: "Careers & Repair Jobs — Apply at ReLife AI Skill Centers" },
      {
        name: "description",
        content:
          "Apply for repair, refurbishment, component recovery, logistics, quality, training and AI operations roles at ReLife AI Skill Centers across India.",
      },
      { property: "og:title", content: "Careers & Repair Jobs — ReLife AI" },
      {
        property: "og:description",
        content: "AI finds the work. Skilled people do the work. Apply to a ReLife Skill Center.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CareersPage,
});

function CareersPage() {
  const [track, setTrack] = useState<(typeof TRACKS)[number]>("All");
  const [q, setQ] = useState("");
  const [applyFor, setApplyFor] = useState<Job | null>(null);

  const jobs = useMemo(
    () =>
      JOBS.filter(
        (j) =>
          (track === "All" || j.track === track) &&
          (q.trim() === "" ||
            `${j.title} ${j.blurb} ${j.locations}`.toLowerCase().includes(q.toLowerCase())),
      ),
    [track, q],
  );

  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[40rem] halo" />
      <SiteNav />
      <main className="relative pt-32">
        <Section className="py-10">
          <div className="flex flex-col items-center gap-4 text-center">
            <Eyebrow>Careers at ReLife AI</Eyebrow>
            <h1 className="text-4xl font-semibold sm:text-5xl md:text-6xl">
              Build the <span className="text-gradient">Repair Economy</span>
            </h1>
            <p className="max-w-2xl text-muted-foreground">
              Every device we keep alive needs skilled hands. Apply to a ReLife Skill Center role —
              training is provided for entry-level tracks, no prior certification required.
            </p>
          </div>

          <div className="mt-12 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-wrap gap-2">
              {TRACKS.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTrack(t)}
                  className={cn(
                    "rounded-full border border-border px-4 py-2 text-sm transition-colors",
                    track === t
                      ? "border-emerald/60 bg-muted text-foreground"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {t}
                </button>
              ))}
            </div>
            <div className="relative w-full md:w-72">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={q}
                maxLength={60}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search roles or cities"
                className="pl-9"
              />
            </div>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {jobs.map((j, i) => (
              <Reveal key={j.title} delay={Math.min(i * 0.04, 0.3)}>
                <div className="card-surface lift flex h-full flex-col p-6">
                  <div className="flex items-start justify-between gap-3">
                    <h2 className="font-display text-lg font-semibold">{j.title}</h2>
                    <span className="shrink-0 rounded-full border border-border px-2.5 py-1 font-mono text-[0.6rem] uppercase tracking-wider text-muted-foreground">
                      {j.track}
                    </span>
                  </div>
                  <p className="mt-3 text-sm text-muted-foreground">{j.blurb}</p>
                  <ul className="mt-4 grid gap-2 text-xs text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <GraduationCap className="h-3.5 w-3.5 text-electric" /> {j.level}
                    </li>
                    <li className="flex items-center gap-2">
                      <Briefcase className="h-3.5 w-3.5 text-lime" /> {j.pay}
                    </li>
                    <li className="flex items-center gap-2">
                      <MapPin className="h-3.5 w-3.5 text-emerald" /> {j.locations}
                    </li>
                  </ul>
                  <Button
                    variant="hero"
                    size="sm"
                    className="mt-6 self-start"
                    onClick={() => setApplyFor(j)}
                  >
                    Apply now <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </Reveal>
            ))}
          </div>
          {jobs.length === 0 && (
            <p className="mt-10 text-center text-sm text-muted-foreground">
              No roles match that search yet — try another track or city.
            </p>
          )}
          <p className="mt-8 text-xs text-muted-foreground">
            Prototype careers board — openings are illustrative and applications are not stored.
          </p>
        </Section>

        <Section className="pt-0">
          <SectionHeading
            eyebrow="Hiring process"
            title="Four steps from"
            gradientTail="application to bench"
            subtitle="Skill-first, certificate-optional. We test what you can fix."
          />
          <div className="mt-12 grid gap-4 md:grid-cols-4">
            {[
              ["Apply", "Send the short form — no résumé needed for entry tracks."],
              ["Skill check", "A practical fault-finding task at your nearest center."],
              ["Training", "2–6 weeks paid ReLife repair standards training."],
              ["Bench", "Join a Skill Center team with AI-assisted job routing."],
            ].map(([t, d], i) => (
              <Reveal key={t} delay={i * 0.07}>
                <div className="card-surface h-full p-6">
                  <span className="font-mono text-xs text-muted-foreground">0{i + 1}</span>
                  <h3 className="mt-2 font-display text-base font-semibold">{t}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{d}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </Section>
      </main>
      <SiteFooter />

      {applyFor && <ApplyDialog job={applyFor} onClose={() => setApplyFor(null)} />}
    </div>
  );
}

function ApplyDialog({ job, onClose }: { job: Job; onClose: () => void }) {
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    city: "",
    experience: "0–1 years",
    skills: "",
  });

  const submit = async () => {
    if (form.name.trim().length < 2 || !/^[6-9]\d{9}$/.test(form.phone.trim())) {
      toast.error("Enter your name and a valid 10-digit mobile number.");
      return;
    }
    setSaving(true);
    const { error } = await supabase.from("job_applications").insert({
      job_title: job.title,
      track: job.track,
      applicant_name: form.name.trim(),
      phone: form.phone.trim(),
      email: form.email.trim() || null,
      city: form.city.trim() || null,
      experience: form.experience,
      skills: form.skills.trim() || null,
    });
    setSaving(false);
    if (error) {
      toast.error("Could not submit your application. Please try again.");
      return;
    }
    toast.success(`Application received for ${job.title}. Our team will call you for a skill check.`);
    onClose();
  };


  return (
    <div className="fixed inset-0 z-[60] grid place-items-center p-4">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className="glass glow-ring relative w-full max-w-lg overflow-y-auto rounded-2xl p-6"
        style={{ maxHeight: "88vh" }}
      >
        <button
          type="button"
          aria-label="Close application form"
          onClick={onClose}
          className="absolute right-4 top-4 grid h-8 w-8 place-items-center rounded-full border border-border"
        >
          <X className="h-4 w-4" />
        </button>
        <Eyebrow>Job application</Eyebrow>
        <h2 className="mt-4 font-display text-xl font-semibold">
          Apply — <span className="text-gradient">{job.title}</span>
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {job.locations} · {job.pay}
        </p>

        <div className="mt-6 grid gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Row label="Full name">
              <Input
                value={form.name}
                maxLength={80}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Aarav Sharma"
              />
            </Row>
            <Row label="Mobile number">
              <Input
                value={form.phone}
                inputMode="numeric"
                maxLength={10}
                onChange={(e) => setForm({ ...form, phone: e.target.value.replace(/\D/g, "") })}
                placeholder="98765 43210"
              />
            </Row>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Row label="Email (optional)">
              <Input
                value={form.email}
                type="email"
                maxLength={120}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="you@example.com"
              />
            </Row>
            <Row label="Preferred city">
              <Input
                value={form.city}
                maxLength={60}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                placeholder="Pune"
              />
            </Row>
          </div>
          <Row label="Experience">
            <div className="flex flex-wrap gap-2">
              {["Fresher", "0–1 years", "1–3 years", "3–7 years", "7+ years"].map((x) => (
                <button
                  key={x}
                  type="button"
                  onClick={() => setForm({ ...form, experience: x })}
                  className={cn(
                    "rounded-full border border-border px-3.5 py-1.5 text-xs transition-colors",
                    form.experience === x
                      ? "border-emerald/60 bg-muted text-foreground"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {x}
                </button>
              ))}
            </div>
          </Row>
          <Row label="What can you already fix?">
            <Textarea
              value={form.skills}
              rows={3}
              maxLength={500}
              onChange={(e) => setForm({ ...form, skills: e.target.value })}
              placeholder="Fans and mixers, basic soldering, laptop RAM/SSD swaps…"
            />
          </Row>
          <Button variant="hero" size="lg" onClick={submit}>
            Submit application <Send className="h-4 w-4" />
          </Button>
          <p className="text-xs text-muted-foreground">
            Prototype form — nothing is submitted or stored yet.
          </p>
        </div>
      </motion.div>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-2">
      <Label className="text-xs uppercase tracking-[0.14em] text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}
