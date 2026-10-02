import { createFileRoute } from "@tanstack/react-router";
import { AdminPanel } from "@/components/admin/admin-panel";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "ReLife AI — Admin Operations Dashboard" },
      {
        name: "description",
        content:
          "Standalone Admin Dashboard for ReLife AI: Manage pickups, candidate applications, 5R fault rules engine, skill centers, and site settings.",
      },
      { property: "og:title", content: "ReLife AI Admin Dashboard" },
    ],
  }),
  component: AdminPage,
});

function AdminPage() {
  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-emerald/20 selection:text-emerald">
      <AdminPanel />
    </div>
  );
}
