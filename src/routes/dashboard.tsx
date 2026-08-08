import { createFileRoute } from "@tanstack/react-router";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { DetectionDashboard, RdeSection } from "@/components/sections/intelligence";
import { ImpactDashboard } from "@/components/sections/network";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Impact Dashboard — ReLife AI Repair Intelligence" },
      {
        name: "description",
        content:
          "Prototype impact metrics from ReLife AI: products repaired, waste avoided, components retrieved, jobs supported and carbon avoided.",
      },
      { property: "og:title", content: "Impact Dashboard — ReLife AI" },
      {
        property: "og:description",
        content: "See what AI sees, and what circular repair saves.",
      },
    ],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[40rem] halo" />
      <SiteNav />
      <main className="pt-24">
        <ImpactDashboard />
        <DetectionDashboard />
        <RdeSection />
      </main>
      <SiteFooter />
    </div>
  );
}
