import { ChooseSport } from "@/components/home/ChooseSport";
import { Hero } from "@/components/home/Hero";
import { getSports } from "@/lib/queries/sports";
import { ImageAutoSlider } from "@/components/ui/image-auto-slider";

export const revalidate = 5; // Revalidate every 5 seconds

export default async function HomePage() {
  const { sports, venue } = await getSports();

  const availableCount = 42; // Placeholder for now, could be calculated if we fetch availability

  return (
    <main>
      <Hero venue={venue} availableCount={availableCount} />
      <ChooseSport sports={sports} />
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
