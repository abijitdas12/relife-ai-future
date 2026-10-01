import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { DetectionDashboard, RdeSection } from "@/components/sections/intelligence";
import { ImpactDashboard } from "@/components/sections/network";
import { useAuth } from "@/hooks/use-auth";
import { UserCheck, LogIn, ArrowRight, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

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
  const { user, loading } = useAuth();

  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[40rem] halo" />
      <SiteNav />
      <main className="pt-24">
        {/* User Workspace Header */}
        <section className="mx-auto max-w-7xl px-4 pt-4 sm:px-6">
          <div className="glass glow-ring rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-emerald">
                <ShieldCheck className="h-4 w-4" /> Live Backend Connected
              </div>
              <h1 className="mt-2 font-display text-2xl sm:text-3xl font-semibold">
                {user ? (
                  <>
                    Welcome Back, <span className="text-gradient">{user.email?.split("@")[0]}</span>
                  </>
                ) : (
                  <>
                    Circular Intelligence <span className="text-gradient">Dashboard</span>
                  </>
                )}
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                {user
                  ? `Signed in as ${user.email} · ReLife AI Repair Workspace`
                  : "Sign in to manage your doorstep pickups, repair history and RDE scan logs."}
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              {user ? (
                <div className="flex items-center gap-2 rounded-xl border border-emerald/40 bg-emerald/10 px-4 py-2 text-xs font-medium text-emerald">
                  <UserCheck className="h-4 w-4" /> Verified Session
                </div>
              ) : (
                <Button asChild variant="hero" size="sm">
                  <Link to="/signin">
                    <LogIn className="h-4 w-4" /> Sign In to Account <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </section>

        <ImpactDashboard />
        <DetectionDashboard />
        <RdeSection />
      </main>
      <SiteFooter />
    </div>
  );
}

