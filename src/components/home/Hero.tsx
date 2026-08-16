"use client";

import { motion } from "framer-motion";
import { usePrefersReducedMotion } from "@/lib/motion";
import type { VenueInfo } from "@/types";
import { CardStack, CardStackItem } from "@/components/ui/card-stack";
import { TextReveal } from "@/components/ui/cascade-text";
import { LocationMap } from "@/components/ui/expand-map";

const facilities: CardStackItem[] = [
  {
    id: "football",
    title: "Football Turf",
    description: "Full-size FIFA-spec turf, floodlit for night games",
    imageSrc: "https://images.unsplash.com/photo-1459865264687-595d652de67e?w=1200&q=80",
    href: "/book?sport=football",
    tag: "Football",
  },
  {
    id: "cricket",
    title: "Cricket Pitch",
    description: "Practice nets and open pitch, matting and turf options",
    imageSrc: "https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=1200&q=80",
    href: "/book?sport=cricket",
    tag: "Cricket",
  },
  {
    id: "volleyball",
    title: "Volleyball Court",
    description: "Premium synthetic courts for professional and recreational play",
    imageSrc: "https://images.unsplash.com/photo-1592656094267-764a45160876?w=1200&q=80",
    href: "/book?sport=volleyball",
    tag: "Volleyball",
  },
];


interface HeroProps {
  venue: VenueInfo;
  availableCount: number;
}

export function Hero({ venue, availableCount }: HeroProps) {
  const reduced = usePrefersReducedMotion();

  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden pt-16">
      {/* Background layers */}
      <div className="absolute inset-0 bg-truf-dark" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--color-truf-lime)_0%,_transparent_50%)] opacity-20" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--color-truf-emerald)_0%,_transparent_40%)] opacity-30" />
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      <div className="relative z-10 mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div className="text-center lg:text-left flex flex-col lg:items-start items-center">
        <motion.div
          initial={reduced ? { opacity: 0 } : { opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: reduced ? 0.2 : 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-truf-lime/30 bg-truf-lime/10 px-4 py-1.5 text-sm font-medium text-truf-lime">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-truf-lime opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-truf-lime" />
            </span>
            {availableCount} slots open today
            {venue.isSeed && (
              <span className="ml-1 rounded bg-white/10 px-1.5 py-0.5 text-[10px] uppercase tracking-wider text-white/60">
                seed
              </span>
            )}
          </span>
        </motion.div>

        <motion.h1
          className="max-w-4xl text-5xl font-unbounded font-black leading-[1.05] tracking-tight text-white sm:text-6xl lg:text-7xl uppercase"
          initial={reduced ? { opacity: 0 } : { opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: reduced ? 0.2 : 0.8,
            delay: reduced ? 0 : 0.1,
            ease: [0.22, 1, 0.36, 1],
          }}
        >
          ATHLETE PARK{" "}
          <TextReveal 
            text="SPORTS ACADEMY" 
            as="span" 
            color="#CCFF00" 
            hoverColor="#10b981" 
            fontSize="inherit"
            direction="down"
            className="block lg:inline-block"
          />
        </motion.h1>

        <motion.p
          className="mt-6 max-w-2xl text-lg text-white/60 sm:text-xl"
          initial={reduced ? { opacity: 0 } : { opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: reduced ? 0.2 : 0.8,
            delay: reduced ? 0 : 0.2,
            ease: [0.22, 1, 0.36, 1],
          }}
        >
          Premium sports turf in {venue.city}, {venue.state}. Football, Cricket
          &amp; Volleyball — real-time slots, instant booking.
        </motion.p>

        <motion.div
          className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
          initial={reduced ? { opacity: 0 } : { opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: reduced ? 0.2 : 0.8,
            delay: reduced ? 0 : 0.3,
            ease: [0.22, 1, 0.36, 1],
          }}
        >
          <a
            href="#availability"
            className="group relative overflow-hidden rounded-full bg-truf-lime px-8 py-4 text-base font-bold text-truf-dark transition-all hover:shadow-xl hover:shadow-truf-lime/25"
          >
            <span className="relative z-10">Check Live Availability</span>
            <span className="absolute inset-0 -translate-x-full bg-white/20 transition-transform duration-500 group-hover:translate-x-full" />
          </a>
          <a
            href="#sports"
            className="rounded-full border border-white/20 px-8 py-4 text-base font-semibold text-white transition-colors hover:border-truf-lime/50 hover:text-truf-lime"
          >
            Explore Sports
          </a>
        </motion.div>

        <motion.div
          className="mt-12 flex justify-center lg:justify-start"
          initial={reduced ? { opacity: 0 } : { opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: reduced ? 0.2 : 0.8,
            delay: reduced ? 0 : 0.4,
            ease: [0.22, 1, 0.36, 1],
          }}
        >
          <LocationMap 
            location="Hunsur, Karnataka" 
            coordinates="12.3051° N, 76.2897° E"
            href="https://maps.app.goo.gl/GDyPmzcKoiafBjia8?g_st=iw"
          />
        </motion.div>

        <motion.div
          className="mt-12 flex flex-wrap items-center justify-center lg:justify-start gap-8 text-sm text-white/40"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: reduced ? 0 : 0.5, duration: 0.6 }}
        >
          <div className="flex items-center gap-2">
            <FootballIcon className="h-5 w-5 text-truf-lime" />
            <span>Football</span>
          </div>
          <div className="flex items-center gap-2">
            <CricketIcon className="h-5 w-5 text-truf-lime" />
            <span>Cricket</span>
          </div>
          <div className="flex items-center gap-2">
            <VolleyballIcon className="h-5 w-5 text-truf-lime" />
            <span>Volleyball</span>
          </div>
        </motion.div>
        </div>

        {/* Right column: Card Stack */}
        <motion.div
          className="relative hidden lg:flex items-center justify-center"
          initial={reduced ? { opacity: 0 } : { opacity: 0, x: 32 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: reduced ? 0.2 : 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
        >
          <CardStack
            items={facilities}
            initialIndex={0}
            autoAdvance
            intervalMs={3200}
            pauseOnHover
            showDots
            springStiffness={220}
            springDamping={32}
            cardWidth={420}
            cardHeight={280}
          />
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
        animate={reduced ? {} : { y: [0, 8, 0] }}
        transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
        aria-hidden
      >
        <div className="h-10 w-6 rounded-full border-2 border-white/20 p-1">
          <div className="mx-auto h-2 w-1 rounded-full bg-truf-lime" />
        </div>
      </motion.div>
    </section>
  );
}

function FootballIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <path d="M12 4l2 4 4 1-3 3 1 4-4-2-4 2 1-4-3-3 4-1 2-4z" fill="currentColor" opacity="0.8" />
    </svg>
  );
}

function CricketIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M4 20l14-14" strokeLinecap="round" />
      <circle cx="18" cy="6" r="3" />
    </svg>
  );
}

function VolleyballIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
      <path d="M2 12h20" />
    </svg>
  );
}
