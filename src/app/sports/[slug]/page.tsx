import { notFound } from "next/navigation";
import { getAvailability } from "@/lib/queries/availability";
import { getSports } from "@/lib/queries/sports";
import { LiveAvailability } from "@/components/home/LiveAvailability";
import { formatPrice } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";

interface SportPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function SportPage({ params }: SportPageProps) {
  const { slug } = await params;

  // Fetch all sports and availability in parallel
  const [{ sports, venue }, availability] = await Promise.all([
    getSports(),
    getAvailability(),
  ]);

  // Find the requested sport
  const sport = sports.find((s) => s.slug === slug);

  if (!sport) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-truf-dark">
      {/* Header/Hero for the specific sport */}
      <section className="relative h-[50vh] min-h-[400px] w-full overflow-hidden">
        <Image
          src={sport.imageUrl}
          alt={sport.name}
          fill
          className="object-cover"
          priority
          unoptimized
        />
        <div className="absolute inset-0 bg-gradient-to-t from-truf-dark via-truf-dark/60 to-transparent" />
        
        <div className="absolute inset-0 flex flex-col items-center justify-end pb-12 pt-24">
          <Link href="/" className="absolute top-24 left-8 flex items-center gap-2 text-white/70 hover:text-white transition-colors z-10">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Home
          </Link>
          <div className="text-center px-4">
            <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight uppercase italic">{sport.name}</h1>
            <p className="mt-4 max-w-2xl text-lg text-white/80 mx-auto">{sport.description}</p>
            <div className="mt-6 inline-flex items-center gap-4 bg-black/40 backdrop-blur-md px-6 py-3 rounded-full border border-white/10">
              <div className="flex flex-col items-start">
                <span className="text-xs uppercase tracking-widest text-white/50">Starting From</span>
                <span className="text-xl font-bold text-truf-lime">{formatPrice(sport.basePricePaise)}<span className="text-sm font-normal text-white/60">/hr</span></span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Booking Section */}
      <section className="py-12 bg-truf-dark">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center mb-8">
          <h2 className="text-3xl font-bold text-white tracking-tight">Today's Slots</h2>
          <p className="text-white/60 mt-2">Select your preferred time below</p>
        </div>
        
        <LiveAvailability
          slots={availability.slots}
          date={availability.date}
          source={availability.source}
          filterSportSlug={sport.slug}
        />
      </section>
    </main>
  );
}
