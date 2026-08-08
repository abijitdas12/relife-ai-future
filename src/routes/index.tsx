import { createFileRoute } from "@tanstack/react-router";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { Hero } from "@/components/sections/hero";
import { HowItWorks, R5Framework, WhatIs } from "@/components/sections/framework";
import { DetectionDashboard, RdeSection } from "@/components/sections/intelligence";
import {
  BusinessModel,
  ImpactDashboard,
  NationalNetwork,
  SkillCentersSection,
} from "@/components/sections/network";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ReLife AI — Don't Replace It. ReLife It." },
      {
        name: "description",
        content:
          "AI Vision, the ReLife Decision Engine and the R5 Framework decide whether a broken product should be repaired, reused, retrieved, redesigned or recycled.",
      },
      { property: "og:title", content: "ReLife AI — Don't Replace It. ReLife It." },
      {
        property: "og:description",
        content:
          "Circular repair intelligence for India: repairability scores, R5 decisions and a national Skill Center network.",
      },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <SiteNav />
      <main>
        <Hero />
        <WhatIs />
        <HowItWorks />
        <R5Framework />
        <DetectionDashboard />
        <RdeSection />
        <SkillCentersSection />
        <NationalNetwork />
        <BusinessModel />
        <ImpactDashboard />
      </main>
      <SiteFooter />
    </div>
  );
}
