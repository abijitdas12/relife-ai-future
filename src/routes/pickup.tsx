import { createFileRoute } from "@tanstack/react-router";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { PickupFlow } from "@/components/pickup/pickup-flow";

export const Route = createFileRoute("/pickup")({
  head: () => ({
    meta: [
      { title: "Doorstep Pickup & AI Repair Quote — ReLife AI" },
      {
        name: "description",
        content:
          "Book a doorstep pickup: our collection partner takes your broken device to a ReLife Skill Center, AI quotes the repair price, and you pay by UPI, card, wallet or cash.",
      },
      { property: "og:title", content: "Doorstep Pickup & AI Repair Quote — ReLife AI" },
      {
        property: "og:description",
        content: "Address in, device collected, AI-priced repair, then pay your way.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PickupPage,
});

function PickupPage() {
  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <div className="pointer-events-none absolute inset-0 grid-bg opacity-60" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[40rem] halo" />
      <SiteNav />
      <main className="relative pt-32">
        <PickupFlow />
      </main>
      <SiteFooter />
    </div>
  );
}
