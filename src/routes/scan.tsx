import { createFileRoute } from "@tanstack/react-router";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { ScanFlow } from "@/components/scan/scan-flow";

export const Route = createFileRoute("/scan")({
  head: () => ({
    meta: [
      { title: "Scan a Product — ReLife AI Repair Intelligence" },
      {
        name: "description",
        content:
          "Upload a photo of a broken product and let ReLife AI decide whether to repair, reuse, retrieve, redesign or recycle it.",
      },
      { property: "og:title", content: "Scan a Product — ReLife AI" },
      {
        property: "og:description",
        content: "AI Vision + RDE analysis that returns a repairability score and an R5 decision.",
      },
    ],
  }),
  component: ScanPage,
});

function ScanPage() {
  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute inset-0 grid-bg opacity-70" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[40rem] halo" />
      <SiteNav />
      <main className="relative pt-32">
        <ScanFlow />
      </main>
      <SiteFooter />
    </div>
  );
}
