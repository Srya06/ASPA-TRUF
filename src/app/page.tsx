import { ChooseSport } from "@/components/home/ChooseSport";
import { Hero } from "@/components/home/Hero";
import { LiveAvailability } from "@/components/home/LiveAvailability";
import { getAvailability } from "@/lib/queries/availability";
import { getSports } from "@/lib/queries/sports";
import { ImageAutoSlider } from "@/components/ui/image-auto-slider";

export const revalidate = 5; // Revalidate every 5 seconds

export default async function HomePage() {
  const [{ sports, venue }, availability] = await Promise.all([
    getSports(),
    getAvailability(),
  ]);

  const availableCount = availability.slots.filter(
    (s) => s.status === "available",
  ).length;

  return (
    <main>
      <Hero venue={venue} availableCount={availableCount} />
      <ChooseSport sports={sports} />
      <LiveAvailability
        slots={availability.slots}
        date={availability.date}
        source={availability.source}
      />
      <ImageAutoSlider />

      {/* Phase 1 placeholder footer — remaining sections in Phase 2 */}
      <footer className="border-t border-white/5 bg-truf-darker py-12 text-center text-sm text-white/30">
        <p>
          TRUF Sports Arena · {venue.city}, {venue.state}
        </p>
        <p className="mt-2">
          Phase 1 — Hero, Sports &amp; Live Availability
        </p>
      </footer>
    </main>
  );
}
