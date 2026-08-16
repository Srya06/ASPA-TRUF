"use client";

import { motion, useInView } from "framer-motion";
import { useRef, type ReactNode } from "react";
import {
  reducedRevealVariants,
  revealVariants,
  usePrefersReducedMotion,
} from "@/lib/motion";

interface SectionRevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
}

export function SectionReveal({
  children,
  className,
  delay = 0,
}: SectionRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  const reduced = usePrefersReducedMotion();

  return (
    <motion.div
      ref={ref}
      className={className}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={reduced ? reducedRevealVariants : revealVariants}
      transition={{
        duration: reduced ? 0.2 : 0.65,
        delay: reduced ? 0 : delay,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      {children}
    </motion.div>
  );
}
