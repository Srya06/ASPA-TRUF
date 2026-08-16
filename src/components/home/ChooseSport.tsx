import { SectionReveal } from "@/components/motion/SectionReveal";
import { SportCard } from "@/components/home/SportCard";
import type { Sport } from "@/types";

interface ChooseSportProps {
  sports: Sport[];
}

export function ChooseSport({ sports }: ChooseSportProps) {
  return (
    <section id="sports" className="relative bg-truf-dark py-24 sm:py-32">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-truf-lime/30 to-transparent" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionReveal className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-truf-lime">
            Choose Your Sport
          </p>
          <h2 className="mt-3 text-4xl font-black tracking-tight text-white sm:text-5xl">
            Pick your game
          </h2>
          <p className="mt-4 text-lg text-white/50">
            Three world-class surfaces. One venue in Hunsur. Select a sport to
            see live slot availability.
          </p>
        </SectionReveal>

        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {sports.map((sport, index) => (
            <SportCard key={sport.id} sport={sport} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
