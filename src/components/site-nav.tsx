import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Menu, ScanLine, X } from "lucide-react";
import { BrandMark } from "./brand";
import { ThemeToggle } from "./theme-toggle";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type NavLink = {
  label: string;
  to: "/";
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
];

export function SiteNav() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

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

        <ul className="hidden items-center gap-2 lg:flex">
          {links.map((l) => (
            <li key={l.label} className="shrink-0">
              <Link
                to={l.to}
                {...(l.hash ? { hash: l.hash } : {})}
                className="block whitespace-nowrap rounded-full px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                {l.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
            <Link to="/signin">Sign In</Link>
          </Button>
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
            <li>
              <Link
                to="/signin"
                onClick={() => setOpen(false)}
                className="block rounded-xl px-4 py-3 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                Sign In
              </Link>
            </li>
          </ul>
        </div>
      )}
    </header>
  );
}
