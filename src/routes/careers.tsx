import { createFileRoute } from "@tanstack/react-router";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { CareersSection } from "@/components/sections/careers-section";

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
  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[40rem] halo" />
      <SiteNav />
      <main className="relative pt-32">
        <CareersSection />
      </main>
      <SiteFooter />
    </div>
  );
}
