import { createFileRoute } from "@tanstack/react-router";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { AdminPanel } from "@/components/admin/admin-panel";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin Operations & Control Center — ReLife AI" },
      {
        name: "description",
        content:
          "Admin control panel for ReLife AI: manage door-step pickup requests, job candidate applications, 5R fault rules engine, skill centers and operations records.",
      },
      { property: "og:title", content: "Admin Control Center — ReLife AI" },
      {
        property: "og:description",
        content: "Master operations room & live database control panel.",
      },
    ],
  }),
  component: AdminPage,
});

function AdminPage() {
  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[40rem] halo" />
      <SiteNav />
      <main className="pt-24 mx-auto max-w-7xl px-4 sm:px-6">
        <AdminPanel />
      </main>
      <SiteFooter />
    </div>
  );
}
