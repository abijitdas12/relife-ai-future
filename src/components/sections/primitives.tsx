import { type ReactNode } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <span className="glass inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-[0.7rem] font-medium uppercase tracking-[0.18em] text-muted-foreground">
      <span className="h-1.5 w-1.5 rounded-full bg-gradient-brand animate-pulse-glow" />
      {children}
    </span>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  gradientTail,
  subtitle,
  align = "center",
}: {
  eyebrow?: string;
  title: string;
  gradientTail?: string;
  subtitle?: string;
  align?: "center" | "left";
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4",
        align === "center" ? "mx-auto max-w-3xl items-center text-center" : "items-start text-left",
      )}
    >
      {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
      <h2 className="text-balance text-3xl font-semibold leading-[1.08] sm:text-4xl md:text-[3.1rem]">
        {title} {gradientTail && <span className="text-gradient">{gradientTail}</span>}
      </h2>
      {subtitle && (
        <p className="max-w-2xl text-[0.98rem] leading-relaxed text-muted-foreground">{subtitle}</p>
      )}
    </div>
  );
}

export function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 26 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.7, delay, ease: [0.2, 0.8, 0.2, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function Section({
  id,
  children,
  className,
}: {
  id?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      id={id}
      className={cn("relative mx-auto w-full max-w-7xl px-5 py-24 md:py-32", className)}
    >
      {children}
    </section>
  );
}
