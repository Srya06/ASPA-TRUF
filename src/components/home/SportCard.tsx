"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import type { ReactNode } from "react";
import { usePrefersReducedMotion } from "@/lib/motion";
import { formatPrice } from "@/lib/utils";
import type { Sport } from "@/types";

const iconMap: Record<string, ReactNode> = {
  football: (
    <svg viewBox="0 0 24 24" className="h-8 w-8" fill="currentColor">
      <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <path d="M12 4l2 4 4 1-3 3 1 4-4-2-4 2 1-4-3-3 4-1 2-4z" opacity="0.9" />
    </svg>
  ),
  cricket: (
    <svg viewBox="0 0 24 24" className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M4 20l14-14" strokeLinecap="round" />
      <circle cx="18" cy="6" r="3" />
    </svg>
  ),
  volleyball: (
    <svg viewBox="0 0 24 24" className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
      <path d="M2 12h20" />
    </svg>
  ),
};

interface SportCardProps {
  sport: Sport;
  index: number;
}

export function SportCard({ sport, index }: SportCardProps) {
  const reduced = usePrefersReducedMotion();

  return (
    <motion.article
      className="group relative h-[420px] overflow-hidden rounded-2xl bg-truf-card"
      initial={reduced ? { opacity: 0 } : { opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{
        duration: reduced ? 0.2 : 0.6,
        delay: reduced ? 0 : index * 0.12,
        ease: [0.22, 1, 0.36, 1],
      }}
      whileHover={reduced ? {} : { y: -8 }}
    >
      {/* Image with zoom on hover */}
      <div className="absolute inset-0 overflow-hidden">
        <Image
          src={sport.imageUrl}
          alt={sport.name}
          fill
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
          sizes="(max-width: 768px) 100vw, 33vw"
          unoptimized
        />
      </div>

      {/* Gradient overlay — intensifies on hover */}
      <div className="absolute inset-0 bg-gradient-to-t from-truf-dark via-truf-dark/60 to-transparent opacity-80 transition-opacity duration-500 group-hover:opacity-95" />
      <div className="absolute inset-0 bg-gradient-to-br from-truf-lime/0 to-truf-emerald/0 transition-all duration-500 group-hover:from-truf-lime/10 group-hover:to-truf-emerald/20" />

      {/* Content */}
      <div className="relative flex h-full flex-col justify-end p-6">
        {/* Icon — animates on hover */}
        <motion.div
          className="mb-3 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-truf-lime/20 text-truf-lime backdrop-blur-sm"
          whileHover={reduced ? {} : { rotate: [0, -8, 8, 0], scale: 1.1 }}
          transition={{ duration: 0.5 }}
        >
          {iconMap[sport.iconName] ?? iconMap[sport.slug]}
        </motion.div>

        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="text-2xl font-bold text-white">{sport.name}</h3>
            <p className="mt-1 line-clamp-2 text-sm text-white/60">
              {sport.description}
            </p>
          </div>
          {sport.isSeed && (
            <span className="shrink-0 rounded bg-white/10 px-2 py-0.5 text-[10px] uppercase tracking-wider text-white/50">
              seed
            </span>
          )}
        </div>

        <div className="mt-4 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wider text-white/40">
              From
            </p>
            <p className="text-lg font-bold text-truf-lime">
              {formatPrice(sport.basePricePaise)}
              <span className="text-sm font-normal text-white/50">/hr</span>
            </p>
          </div>
          <p className="text-sm text-white/50">
            {sport.courtCount} court{sport.courtCount !== 1 ? "s" : ""}
          </p>
        </div>

        {/* CTA reveal on hover */}
        <motion.div
          className="mt-4 overflow-hidden"
          initial={false}
        >
          <div className="translate-y-4 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
            <a
              href="#availability"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-truf-lime py-3 text-sm font-bold text-truf-dark transition-colors hover:bg-truf-lime/90"
            >
              Book Now
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </a>
          </div>
        </motion.div>
      </div>
    </motion.article>
  );
}
