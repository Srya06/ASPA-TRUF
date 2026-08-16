"use client";

import { useReducedMotion } from "framer-motion";

export function usePrefersReducedMotion(): boolean {
  return useReducedMotion() ?? false;
}

export const revealVariants = {
  hidden: { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0 },
};

export const reducedRevealVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

export const scaleRevealVariants = {
  hidden: { opacity: 0, scale: 0.96 },
  visible: { opacity: 1, scale: 1 },
};

export const reducedScaleRevealVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};
