import { createFileRoute, Link } from "@tanstack/react-router";
import { MapPin, Wrench } from "lucide-react";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { Button } from "@/components/ui/button";
import { Reveal, Section, SectionHeading } from "@/components/sections/primitives";
import { NationalNetwork, SkillCentersSection } from "@/components/sections/network";

const centers = [
  { city: "Pune", zone: "West", bench: 14, focus: "Home appliances · fans, mixers, geysers" },
  { city: "Bengaluru", zone: "South", bench: 22, focus: "Laptops, phones, board-level repair" },
  { city: "Delhi NCR", zone: "North", bench: 18, focus: "Refurbishment & component recovery" },
  { city: "Kolkata", zone: "East", bench: 11, focus: "Motors, pumps, small industrial units" },
  { city: "Ahmedabad", zone: "West", bench: 9, focus: "Redesign workshop & spare marketplace" },
  { city: "Chennai", zone: "South", bench: 16, focus: "Electronics recovery & recycling partners" },
];

export const Route = createFileRoute("/skill-centers")({
  head: () => ({
    meta: [
      { title: "ReLife Skill Centers — Repair Jobs Across India" },
      {
        name: "description",
        content:
          "ReLife Skill Centers turn AI repair decisions into local jobs: technicians, refurbishers, component recovery specialists and trainers.",
      },
      { property: "og:title", content: "ReLife Skill Centers — Repair Jobs Across India" },
      {
        property: "og:description",
        content: "AI identifies the work. Skilled people do the work.",
      },
    ],
  }),
  component: SkillCentersPage,
});

function SkillCentersPage() {
  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[40rem] halo" />
      <SiteNav />
      <main className="pt-32">
        <Section className="py-10">
          <SectionHeading
            eyebrow="Network"
            title="ReLife"
            gradientTail="Skill Centers"
            subtitle="Each center is a bench, a trained team and a data link back into the ReLife Decision Engine."
          />
          <div className="mt-14 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {centers.map((c, i) => (
              <Reveal key={c.city} delay={i * 0.06}>
                <div className="card-surface lift h-full p-6">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 font-display text-lg font-semibold">
                      <MapPin className="h-4 w-4 text-emerald" /> {c.city}
                    </span>
                    <span className="font-mono text-xs text-muted-foreground">{c.zone}</span>
                  </div>
                  <p className="mt-3 text-sm text-muted-foreground">{c.focus}</p>
                  <p className="mt-4 flex items-center gap-2 text-sm">
                    <Wrench className="h-4 w-4 text-electric" />
                    <span className="font-semibold">{c.bench}</span>
                    <span className="text-muted-foreground">technicians on bench</span>
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
          <p className="mt-6 text-xs text-muted-foreground">
            Illustrative prototype network — centers shown are planned, not yet operational.
          </p>
          <Button asChild variant="hero" size="lg" className="mt-8">
            <Link to="/scan">Route a product to a center</Link>
          </Button>
        </Section>

        <SkillCentersSection />
        <NationalNetwork />
      </main>
      <SiteFooter />
    </div>
  );
}
