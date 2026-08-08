"use client";

import { useRef, type ReactNode } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

/**
 * ContainerScroll — cinematic scroll-driven device frame.
 * Restyled for ReLife AI (glass + emerald/electric glow).
 */
export function ContainerScroll({
  titleComponent,
  children,
}: {
  titleComponent: ReactNode;
  children: ReactNode;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: containerRef });

  const rotate = useTransform(scrollYProgress, [0, 1], [22, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [1.02, 0.94]);
  const translate = useTransform(scrollYProgress, [0, 1], [0, -110]);
  const opacity = useTransform(scrollYProgress, [0, 0.35], [0.35, 1]);

  return (
    <div
      ref={containerRef}
      className="relative flex h-[62rem] items-center justify-center p-2 md:h-[78rem] md:p-16"
    >
      <div className="relative w-full py-10 md:py-24" style={{ perspective: "1000px" }}>
        <motion.div style={{ translateY: translate }} className="mx-auto max-w-5xl text-center">
          {titleComponent}
        </motion.div>

        <motion.div
          style={{ rotateX: rotate, scale, opacity }}
          className="mx-auto mt-10 h-[26rem] w-full max-w-6xl rounded-[2rem] border border-glass p-2 shadow-lift md:h-[38rem] md:p-4"
        >
          <div className="glass relative h-full w-full overflow-hidden rounded-[1.6rem]">
            <div className="pointer-events-none absolute inset-0 halo" />
            <div className="relative h-full w-full overflow-hidden">{children}</div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default ContainerScroll;
