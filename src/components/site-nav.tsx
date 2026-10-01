import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Menu, ScanLine, X, User, LogOut, LayoutDashboard } from "lucide-react";
import { toast } from "sonner";
import { BrandMark } from "./brand";
import { ThemeToggle } from "./theme-toggle";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";

type NavLink = {
  label: string;
  to: "/" | "/dashboard";
  hash?: string;
};

// Ordered to match the exact top-to-bottom order of sections on the homepage.
const links: NavLink[] = [
  { label: "How It Works", to: "/", hash: "how-it-works" },
  { label: "R5 Framework", to: "/", hash: "r5" },
  { label: "RDE Engine", to: "/", hash: "rde" },
  { label: "Skill Centers", to: "/", hash: "skill-centers" },
  { label: "Pickup", to: "/", hash: "pickup" },
  { label: "Careers", to: "/", hash: "careers" },
  { label: "Impact", to: "/", hash: "impact" },
  { label: "Dashboard", to: "/dashboard" },
];

export function SiteNav() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user, signOut } = useAuth();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleSignOut = async () => {
    await signOut();
    toast.success("Signed out successfully");
    setOpen(false);
  };

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-5">
      <nav
        className={cn(
          "mx-auto flex max-w-7xl items-center justify-between rounded-2xl px-4 py-2.5 transition-all duration-500",
          scrolled ? "glass" : "border border-transparent",
        )}
      >
        <Link to="/" onClick={() => setOpen(false)}>
          <BrandMark />
        </Link>

        <ul className="hidden items-center gap-1 lg:flex">
          {links.map((l) => (
            <li key={l.label} className="shrink-0">
              <Link
                to={l.to}
                {...(l.hash ? { hash: l.hash } : {})}
                className="block whitespace-nowrap rounded-full px-2.5 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                {l.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          
          {user ? (
            <div className="hidden sm:flex items-center gap-2">
              <Button asChild variant="ghost" size="sm" className="gap-1.5">
                <Link to="/dashboard">
                  <LayoutDashboard className="h-3.5 w-3.5 text-emerald" />
                  <span className="max-w-[120px] truncate">{user.email?.split("@")[0]}</span>
                </Link>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleSignOut}
                title="Sign Out"
                className="h-8 w-8 p-0"
              >
                <LogOut className="h-3.5 w-3.5" />
              </Button>
            </div>
          ) : (
            <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
              <Link to="/signin">Sign In</Link>
            </Button>
          )}

          <Button asChild variant="hero" size="sm">
            <Link to="/scan">
              <ScanLine className="h-4 w-4" /> Scan Product
            </Link>
          </Button>

          <button
            type="button"
            aria-label="Toggle menu"
            onClick={() => setOpen((o) => !o)}
            className="grid h-9 w-9 place-items-center rounded-full border border-border lg:hidden"
          >
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </nav>

      {open && (
        <div className="glass mx-auto mt-2 max-w-7xl animate-fade-in rounded-2xl p-3 lg:hidden">
          <ul className="grid gap-1">
            {links.map((l) => (
              <li key={l.label}>
                <Link
                  to={l.to}
                  {...(l.hash ? { hash: l.hash } : {})}
                  onClick={() => setOpen(false)}
                  className="block rounded-xl px-4 py-3 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  {l.label}
                </Link>
              </li>
            ))}
            {user ? (
              <li>
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="flex w-full items-center justify-between rounded-xl px-4 py-3 text-sm text-destructive hover:bg-destructive/10"
                >
                  <span>Sign Out ({user.email})</span>
                  <LogOut className="h-4 w-4" />
                </button>
              </li>
            ) : (
              <li>
                <Link
                  to="/signin"
                  onClick={() => setOpen(false)}
                  className="block rounded-xl px-4 py-3 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  Sign In
                </Link>
              </li>
            )}
          </ul>
        </div>
      )}
    </header>
  );
}

