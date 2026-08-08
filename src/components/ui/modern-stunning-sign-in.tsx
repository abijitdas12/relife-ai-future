"use client";

import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowRight, Eye, EyeOff, Lock, Mail } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { R5Logo } from "@/components/brand";

/**
 * modern-stunning-sign-in — restyled entirely for ReLife AI.
 */
export function SignIn() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-24">
      <div className="pointer-events-none absolute inset-0 grid-bg opacity-70" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[40rem] halo" />
      {Array.from({ length: 14 }).map((_, i) => (
        <motion.span
          key={i}
          className="pointer-events-none absolute h-1 w-1 rounded-full bg-gradient-brand"
          style={{ left: `${(i * 41) % 100}%`, top: `${(i * 61) % 100}%` }}
          animate={{ y: [0, -30, 0], opacity: [0.1, 0.7, 0.1] }}
          transition={{ duration: 7 + (i % 4), repeat: Infinity, delay: i * 0.4 }}
        />
      ))}

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="glass glow-ring relative w-full max-w-md rounded-3xl p-8"
      >
        <div className="flex flex-col items-center gap-3 text-center">
          <R5Logo className="h-12 w-12" />
          <h1 className="font-display text-2xl font-semibold">
            Welcome to ReLife<span className="text-gradient"> AI</span>
          </h1>
          <p className="text-sm text-muted-foreground">
            Sign in to scan products, track cases and reach Skill Centers.
          </p>
        </div>

        <form
          className="mt-8 grid gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            toast.info("Authentication is not wired up in this prototype yet.");
          }}
        >
          <label className="grid gap-2 text-sm">
            <span className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Email</span>
            <span className="relative">
              <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="email"
                required
                placeholder="you@relife.ai"
                className="w-full rounded-xl border border-input bg-transparent py-3 pl-10 pr-4 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-emerald/60"
              />
            </span>
          </label>

          <label className="grid gap-2 text-sm">
            <span className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
              Password
            </span>
            <span className="relative">
              <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type={showPassword ? "text" : "password"}
                required
                placeholder="••••••••"
                className="w-full rounded-xl border border-input bg-transparent py-3 pl-10 pr-11 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-emerald/60"
              />
              <button
                type="button"
                aria-label="Toggle password visibility"
                onClick={() => setShowPassword((s) => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-emerald"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </span>
          </label>

          <Button type="submit" variant="hero" size="lg" className="mt-2 w-full">
            Sign In <ArrowRight className="h-4 w-4" />
          </Button>
        </form>

        <div className="my-6 flex items-center gap-3 text-xs uppercase tracking-[0.16em] text-muted-foreground">
          <span className="h-px flex-1 bg-border" /> or <span className="h-px flex-1 bg-border" />
        </div>

        <Button
          variant="glass"
          size="lg"
          className="w-full"
          onClick={() => toast.info("Google sign-in will be enabled with the auth backend.")}
        >
          <GoogleGlyph /> Continue with Google
        </Button>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          New to ReLife AI?{" "}
          <Link to="/scan" className="text-emerald hover:underline">
            Try a product scan first
          </Link>
        </p>
      </motion.div>
    </div>
  );
}

function GoogleGlyph() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.4a5.5 5.5 0 0 1-2.4 3.6v3h3.9c2.3-2.1 3.6-5.2 3.6-8.8Z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.2 0 5.9-1.1 7.9-2.9l-3.9-3c-1.1.7-2.4 1.1-4 1.1a7 7 0 0 1-6.6-4.8H1.4v3.1A12 12 0 0 0 12 24Z"
      />
      <path fill="#FBBC05" d="M5.4 14.4a7.2 7.2 0 0 1 0-4.8V6.5H1.4a12 12 0 0 0 0 11l4-3.1Z" />
      <path
        fill="#EA4335"
        d="M12 4.8c1.8 0 3.3.6 4.6 1.8l3.4-3.4A12 12 0 0 0 1.4 6.5l4 3.1A7 7 0 0 1 12 4.8Z"
      />
    </svg>
  );
}

export default SignIn;
