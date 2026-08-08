import { cn } from "@/lib/utils";

export function R5Logo({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "relative grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-emerald/40",
        className,
      )}
    >
      <span className="absolute inset-0 rounded-xl bg-gradient-brand opacity-20" />
      <svg viewBox="0 0 32 32" className="relative h-5 w-5" aria-hidden="true">
        <defs>
          <linearGradient id="r5grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="var(--emerald)" />
            <stop offset="60%" stopColor="var(--electric)" />
            <stop offset="100%" stopColor="var(--lime)" />
          </linearGradient>
        </defs>
        <circle
          cx="16"
          cy="16"
          r="13"
          fill="none"
          stroke="url(#r5grad)"
          strokeWidth="2"
          strokeDasharray="58 24"
          strokeLinecap="round"
        />
        <path
          d="M11 22V10h5.2a3.6 3.6 0 0 1 0 7.2H11.6L17 22"
          fill="none"
          stroke="url(#r5grad)"
          strokeWidth="2.1"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path d="M21 11.5h4M21 11.5v3.2h2.2a2.3 2.3 0 1 1-2.2 3" fill="none" stroke="url(#r5grad)" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    </span>
  );
}

export function BrandMark() {
  return (
    <span className="flex items-center gap-2.5">
      <R5Logo />
      <span className="font-display text-[1.05rem] font-semibold tracking-tight">
        ReLife<span className="text-gradient"> AI</span>
      </span>
    </span>
  );
}
