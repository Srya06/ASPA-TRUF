"use client";

import { SectionReveal } from "@/components/motion/SectionReveal";
import { cn, formatPrice, formatTime12h } from "@/lib/utils";
import type { AvailabilitySlot, SlotStatus, SportSlug } from "@/types";
import Link from "next/link";

const sportLabels: Record<string, string> = {
  football: "Football",
  cricket: "Cricket",
  badminton: "Badminton",
  volleyball: "Volleyball",
};

const statusStyles: Record<
  SlotStatus,
  { bg: string; text: string; label: string }
> = {
  available: {
    bg: "bg-truf-lime/10 border-truf-lime/30 hover:border-truf-lime hover:bg-truf-lime/20",
    text: "text-truf-lime",
    label: "Available",
  },
  locked: {
    bg: "bg-amber-500/10 border-amber-500/30",
    text: "text-amber-400",
    label: "Locked",
  },
  booked: {
    bg: "bg-white/5 border-white/10 opacity-60",
    text: "text-white/40",
    label: "Booked",
  },
  blocked: {
    bg: "bg-red-500/10 border-red-500/20 opacity-50",
    text: "text-red-400/70",
    label: "Blocked",
  },
};

interface SlotChipProps {
  slot: AvailabilitySlot;
}

function SlotChip({ slot }: SlotChipProps) {
  const style = statusStyles[slot.status];
  const isClickable = slot.status === "available";
  
  const content = (
    <>
      <span className={cn("text-sm font-semibold", style.text)}>
        {formatTime12h(slot.startTime)}
      </span>
      <span className="mt-0.5 text-xs text-white/40">{slot.courtName}</span>
      {slot.status === "available" && (
        <span className="mt-1 text-xs font-medium text-white/60">
          {formatPrice(slot.pricePaise)}
        </span>
      )}
    </>
  );

  const className = cn(
    "flex flex-col items-start rounded-xl border px-3 py-2.5 text-left transition-all duration-200",
    style.bg,
    isClickable && "cursor-pointer active:scale-[0.98]",
    !isClickable && "cursor-not-allowed"
  );

  if (isClickable) {
    return (
      <Link href={`/book/${slot.id}`} className={className} aria-label={`${formatTime12h(slot.startTime)} - ${slot.courtName}, ${style.label}`}>
        {content}
      </Link>
    );
  }

  return (
    <button
      type="button"
      disabled
      className={className}
      aria-label={`${formatTime12h(slot.startTime)} - ${slot.courtName}, ${style.label}`}
    >
      {content}
    </button>
  );
}

interface LiveAvailabilityProps {
  slots: AvailabilitySlot[];
  date: string;
  source: "database" | "fallback";
}

export function LiveAvailability({ slots, date, source }: LiveAvailabilityProps) {
  const grouped = slots.reduce<Record<SportSlug, AvailabilitySlot[]>>(
    (acc, slot) => {
      if (!acc[slot.sportSlug]) acc[slot.sportSlug] = [];
      acc[slot.sportSlug].push(slot);
      return acc;
    },
    {} as Record<SportSlug, AvailabilitySlot[]>,
  );

  const availableCount = slots.filter((s) => s.status === "available").length;
  const formattedDate = new Date(date + "T00:00:00").toLocaleDateString(
    "en-IN",
    { weekday: "long", day: "numeric", month: "long" },
  );

  return (
    <section id="availability" className="relative bg-truf-darker py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionReveal className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-truf-lime">
              Live Availability
            </p>
            <h2 className="mt-3 text-4xl font-black tracking-tight text-white sm:text-5xl">
              Today&apos;s slots
            </h2>
            <p className="mt-2 text-white/50">{formattedDate}</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="rounded-xl border border-truf-lime/20 bg-truf-lime/5 px-4 py-3 text-center">
              <p className="text-2xl font-black text-truf-lime">
                {availableCount}
              </p>
              <p className="text-xs text-white/40">open now</p>
            </div>
            {source === "fallback" && (
              <span className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-400">
                Demo data — connect DB for live
              </span>
            )}
          </div>
        </SectionReveal>

        <div className="mt-12 space-y-10">
          {(Object.keys(grouped) as SportSlug[]).map((slug, sectionIdx) => {
            const sportSlots = grouped[slug];
            const sportAvailable = sportSlots.filter(
              (s) => s.status === "available",
            ).length;

            return (
              <SectionReveal key={slug} delay={sectionIdx * 0.08}>
                <div className="rounded-2xl border border-white/5 bg-truf-card/50 p-6 backdrop-blur-sm">
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-xl font-bold text-white capitalize">
                      {sportLabels[slug] || slug}
                    </h3>
                    <span className="text-sm text-white/40">
                      {sportAvailable} of {sportSlots.length} available
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
                    {sportSlots.map((slot) => (
                      <SlotChip key={slot.id} slot={slot} />
                    ))}
                  </div>
                </div>
              </SectionReveal>
            );
          })}

          {slots.length === 0 && (
            <div className="rounded-2xl border border-white/5 bg-truf-card/50 p-12 text-center">
              <p className="text-lg text-white/50">
                No slots scheduled for this date.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
