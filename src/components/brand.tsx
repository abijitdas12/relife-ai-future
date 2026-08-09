import { cn } from "@/lib/utils";
import markAsset from "@/assets/relife-mark.png.asset.json";
import logoAsset from "@/assets/relife-logo.png.asset.json";

export function R5Logo({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "relative grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-emerald/40",
        className,
      )}
    >
      <span className="absolute inset-0 rounded-xl bg-gradient-brand opacity-20" />
      <img
        src={markAsset.url}
        alt="Re-Life AI logo"
        className="relative h-[76%] w-[76%] object-contain"
      />
    </span>
  );
}

export function BrandMark() {
  return (
    <span className="flex items-center gap-2.5">
      <R5Logo />
      <span className="flex flex-col leading-none">
        <span className="font-display text-[1.05rem] font-semibold tracking-tight">
          Re-Life<span className="text-gradient"> AI</span>
        </span>
        <span className="mt-0.5 hidden text-[0.6rem] font-medium uppercase tracking-[0.16em] text-muted-foreground sm:block">
          Don't Replace It. ReLife It.
        </span>
      </span>
    </span>
  );
}

export function BrandLockup({ className }: { className?: string }) {
  return (
    <img
      src={logoAsset.url}
      alt="Re-Life AI — Don't Replace It. ReLife It."
      className={cn("w-56 max-w-full object-contain", className)}
    />
  );
}
