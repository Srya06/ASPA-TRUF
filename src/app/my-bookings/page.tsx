import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getMyBookings } from "@/lib/queries/my-bookings";
import { QRCodePass } from "@/components/booking/QRCodePass";
import { CancelButton } from "@/components/booking/CancelButton";
import { formatPrice, formatTime12h, cn } from "@/lib/utils";
import Link from "next/link";

export const dynamic = "force-dynamic";

const statusStyles: Record<string, { pill: string; label: string }> = {
  confirmed:      { pill: "bg-truf-lime/10 text-truf-lime",      label: "Confirmed" },
  pending_payment:{ pill: "bg-amber-500/10 text-amber-400",       label: "Pending Payment" },
  cancelled:      { pill: "bg-red-500/10 text-red-400",           label: "Cancelled" },
  completed:      { pill: "bg-blue-500/10 text-blue-400",         label: "Completed" },
};

export default async function MyBookingsPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/my-bookings");
  }

  const bookings = await getMyBookings(session.user.id);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (
    <main className="min-h-screen bg-truf-dark py-16">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-10 flex items-center justify-between">
          <div>
            <Link href="/" className="text-sm text-white/40 hover:text-white">← Home</Link>
            <h1 className="mt-3 text-3xl font-black tracking-tight text-white sm:text-4xl">
              My Bookings
            </h1>
          </div>
          <Link
            href="/#availability"
            className="rounded-xl bg-truf-lime px-5 py-2.5 text-sm font-bold text-truf-dark hover:bg-truf-lime/90"
          >
            Book Again
          </Link>
        </div>

        {/* Empty state */}
        {bookings.length === 0 && (
          <div className="rounded-2xl border border-white/5 bg-truf-card p-16 text-center">
            <p className="text-2xl font-bold text-white">No bookings yet</p>
            <p className="mt-2 text-white/50">Book your first session and it'll appear here.</p>
            <Link href="/#availability" className="mt-6 inline-block rounded-xl bg-truf-lime px-6 py-3 font-bold text-truf-dark hover:bg-truf-lime/90">
              View Available Slots
            </Link>
          </div>
        )}

        {/* Booking cards */}
        <div className="space-y-6">
          {bookings.map((b) => {
            const slotDate = new Date(b.slot_date);
            slotDate.setHours(0, 0, 0, 0);
            const isFuture = slotDate > today;
            const isPast = slotDate < today;
            const style = statusStyles[b.status] ?? { pill: "bg-white/10 text-white/50", label: b.status };

            return (
              <div
                key={b.id}
                className="rounded-2xl border border-white/5 bg-truf-card overflow-hidden"
              >
                {/* Card header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
                  <div className="flex items-center gap-3">
                    <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-medium", style.pill)}>
                      {style.label}
                    </span>
                    <span className="font-mono text-xs text-white/30">{b.booking_ref}</span>
                  </div>
                  <span className="text-sm font-bold text-truf-lime">{formatPrice(b.final_amount_paise)}</span>
                </div>

                <div className="grid gap-6 p-6 sm:grid-cols-2">
                  {/* Left: Details */}
                  <div className="space-y-4">
                    <div>
                      <p className="text-xs uppercase tracking-wider text-white/40">Sport / Court</p>
                      <p className="mt-1 font-bold text-white capitalize">{b.sport_name} · {b.court_name}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wider text-white/40">Date</p>
                      <p className="mt-1 font-bold text-white">
                        {new Date(b.slot_date).toLocaleDateString("en-IN", {
                          weekday: "short", day: "numeric", month: "long", year: "numeric",
                        })}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wider text-white/40">Time</p>
                      <p className="mt-1 font-bold text-white">
                        {formatTime12h(b.start_time)} – {formatTime12h(b.end_time)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wider text-white/40">Venue</p>
                      <p className="mt-1 text-sm text-white/70">{b.venue_name}, {b.venue_city}</p>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap gap-3 pt-2">
                      {b.status === "confirmed" && isFuture && (
                        <CancelButton bookingId={b.id} userId={session.user.id} />
                      )}
                      {b.status === "confirmed" && isPast && !b.has_review && (
                        <Link
                          href={`/my-bookings/${b.id}/review`}
                          className="rounded-lg border border-truf-lime/30 px-3 py-1.5 text-xs font-medium text-truf-lime hover:bg-truf-lime/10"
                        >
                          Leave a Review ★
                        </Link>
                      )}
                      {b.has_review && (
                        <span className="text-xs text-white/30 italic">Review submitted ✓</span>
                      )}
                    </div>
                  </div>

                  {/* Right: QR Pass (only for confirmed) */}
                  {b.status === "confirmed" && (
                    <div className="flex items-start justify-center sm:justify-end">
                      <div className="scale-75 origin-top-right">
                        <QRCodePass booking={{
                          booking_ref: b.booking_ref,
                          customer_name: b.customer_name,
                          sport_name: b.sport_name,
                          court_name: b.court_name,
                          slot_date: b.slot_date,
                          start_time: b.start_time,
                          end_time: b.end_time,
                          venue_name: b.venue_name,
                        }} />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}
