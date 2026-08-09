import { Link } from "@tanstack/react-router";
import { Github, Instagram, Linkedin, Twitter, Youtube } from "lucide-react";
import { BrandLockup } from "./brand";

const columns: { title: string; links: { label: string; to: "/" | "/scan" | "/skill-centers" | "/dashboard" | "/signin"; hash?: string }[] }[] = [
  {
    title: "Product",
    links: [
      { label: "Scan Product", to: "/scan" },
      { label: "AI Dashboard", to: "/dashboard" },
      { label: "Sign In", to: "/signin" },
    ],
  },
  {
    title: "Platform",
    links: [
      { label: "How It Works", to: "/", hash: "how-it-works" },
      { label: "R5 Framework", to: "/", hash: "r5" },
      { label: "RDE Engine", to: "/", hash: "rde" },
    ],
  },
  {
    title: "Network",
    links: [
      { label: "Skill Centers", to: "/skill-centers" },
      { label: "Impact", to: "/dashboard" },
      { label: "About", to: "/", hash: "about" },
    ],
  },
];

const socials = [Twitter, Linkedin, Instagram, Youtube, Github];

export function SiteFooter() {
  return (
    <footer className="relative mt-20 border-t border-border">
      <div className="mx-auto grid max-w-7xl gap-12 px-5 py-16 md:grid-cols-[1.4fr_repeat(3,1fr)]">
        <div className="flex flex-col gap-4">
          <BrandLockup />
          <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">
            Repair More. Waste Less. Building a sustainable India through AI-driven circular repair
            intelligence.
          </p>
          <div className="mt-2 flex gap-2">
            {socials.map((Icon, i) => (
              <span
                key={i}
                className="grid h-9 w-9 cursor-pointer place-items-center rounded-full border border-border text-muted-foreground transition-all hover:border-emerald/50 hover:text-emerald"
              >
                <Icon className="h-4 w-4" />
              </span>
            ))}
          </div>
        </div>

        {columns.map((col) => (
          <div key={col.title} className="flex flex-col gap-3">
            <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              {col.title}
            </h3>
            {col.links.map((l) => (
              <Link
                key={l.label}
                to={l.to}
                {...(l.hash ? { hash: l.hash } : {})}
                className="text-sm text-foreground/80 transition-colors hover:text-emerald"
              >
                {l.label}
              </Link>
            ))}
          </div>
        ))}
      </div>

      <div className="mx-auto flex max-w-7xl flex-col gap-2 border-t border-border px-5 py-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <p>© 2026 ReLife AI. All rights reserved.</p>
        <p>Don't Replace It. ReLife It.</p>
      </div>
    </footer>
  );
}
