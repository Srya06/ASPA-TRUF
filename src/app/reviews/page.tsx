import { getCollection } from "@/lib/db/client";
import { SectionReveal } from "@/components/motion/SectionReveal";
import Link from "next/link";
import { ObjectId } from "mongodb";

export const dynamic = "force-dynamic";

interface ReviewRow {
  id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  customer_name: string;
  sport_name: string;
}

interface StatsRow {
  avg_rating: number;
  total: number;
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5 text-truf-lime">
      {[1, 2, 3, 4, 5].map((s) => (
        <span key={s} className={s <= rating ? "text-truf-lime" : "text-white/10"}>
          ★
        </span>
      ))}
    </div>
  );
}

export default async function ReviewsPage() {
  const reviewsCol = await getCollection("reviews");
  const usersCol = await getCollection("users");
  const bookingsCol = await getCollection("bookings");
  const slotsCol = await getCollection("slots");
  const courtsCol = await getCollection("courts");
  const sportsCol = await getCollection("sports");

  const [reviewsDocs, statsAgg] = await Promise.all([
    reviewsCol.find({ isPublished: true, isSeed: { $ne: true } }).sort({ createdAt: -1 }).limit(50).toArray(),
    reviewsCol.aggregate([
      { $match: { isPublished: true, isSeed: { $ne: true } } },
      { $group: { _id: null, avg_rating: { $avg: "$rating" }, total: { $sum: 1 } } }
    ]).toArray()
  ]);

  const reviews: ReviewRow[] = [];

  for (const r of reviewsDocs) {
    let customerName = "Player";
    let sportName = "Unknown";

    if (r.userId) {
      const user = await usersCol.findOne({ _id: new ObjectId(r.userId as string) });
      if (user && user.name) customerName = user.name as string;
    }

    if (r.bookingId) {
      const booking = await bookingsCol.findOne({ _id: new ObjectId(r.bookingId as string) });
      if (booking && booking.slotId) {
        const slot = await slotsCol.findOne({ _id: new ObjectId(booking.slotId as string) });
        if (slot && slot.courtId) {
          const court = await courtsCol.findOne({ _id: slot.courtId });
          if (court && court.sportId) {
            const sport = await sportsCol.findOne({ _id: court.sportId });
            if (sport && sport.name) {
              sportName = sport.name as string;
            }
          }
        }
      }
    }

    reviews.push({
      id: r._id.toString(),
      rating: r.rating as number,
      comment: r.comment as string | null,
      created_at: (r.createdAt as Date).toISOString(),
      customer_name: customerName,
      sport_name: sportName
    });
  }

  const stats = statsAgg[0] ? {
      avg_rating: Math.round((statsAgg[0].avg_rating as number) * 10) / 10,
      total: statsAgg[0].total as number
  } : { avg_rating: 0, total: 0 };

  return (
    <main className="min-h-screen bg-truf-dark py-16">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <SectionReveal>
          <Link href="/" className="text-sm text-white/40 hover:text-white">← Home</Link>
          <h1 className="mt-4 text-4xl font-black tracking-tight text-white sm:text-5xl">
            Player Reviews
          </h1>

          {/* Aggregate stats */}
          {stats.total > 0 ? (
            <div className="mt-6 inline-flex items-center gap-4 rounded-xl border border-white/5 bg-truf-card px-6 py-4">
              <div className="text-center">
                <p className="text-4xl font-black text-truf-lime">{stats.avg_rating}</p>
                <StarRating rating={Math.round(Number(stats.avg_rating))} />
              </div>
              <div className="h-10 w-px bg-white/10" />
              <div>
                <p className="text-2xl font-black text-white">{stats.total.toString()}</p>
                <p className="text-sm text-white/50">verified reviews</p>
              </div>
            </div>
          ) : (
            <p className="mt-4 text-white/50">No reviews yet — be the first!</p>
          )}
        </SectionReveal>

        {/* Review cards */}
        <div className="mt-12 grid gap-4 sm:grid-cols-2">
          {reviews.map((r, i) => (
            <SectionReveal key={r.id} delay={i * 0.04}>
              <div className="rounded-2xl border border-white/5 bg-truf-card p-6 flex flex-col gap-3">
                <div className="flex items-start justify-between gap-2">
                  <StarRating rating={r.rating} />
                  <span className="text-xs text-white/30">
                    {new Date(r.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                  </span>
                </div>

                {r.comment && (
                  <p className="text-sm leading-relaxed text-white/80">
                    &ldquo;{r.comment}&rdquo;
                  </p>
                )}

                <div className="mt-auto flex items-center justify-between">
                  <p className="text-sm font-medium text-white">{r.customer_name}</p>
                  {r.sport_name && (
                    <span className="text-xs text-white/30 capitalize">{r.sport_name}</span>
                  )}
                </div>
              </div>
            </SectionReveal>
          ))}
        </div>

        {reviews.length === 0 && (
          <div className="mt-12 rounded-2xl border border-white/5 bg-truf-card p-12 text-center">
            <p className="text-white/50">No reviews yet. Book a session and be the first to share your experience!</p>
          </div>
        )}
      </div>
    </main>
  );
}
