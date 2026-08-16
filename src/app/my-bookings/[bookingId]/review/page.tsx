import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getCollection } from "@/lib/db/client";
import { ReviewForm } from "@/components/reviews/ReviewForm";
import Link from "next/link";
import { ObjectId } from "mongodb";

export const dynamic = "force-dynamic";

export default async function ReviewPage(props: {
  params: Promise<{ bookingId: string }>;
}) {
  const params = await props.params;
  const session = await auth();

  if (!session?.user?.id) {
    redirect(`/login?callbackUrl=/my-bookings/${params.bookingId}/review`);
  }

  const bookingsCol = await getCollection("bookings");
  const slotsCol = await getCollection("slots");
  const courtsCol = await getCollection("courts");
  const sportsCol = await getCollection("sports");
  const reviewsCol = await getCollection("reviews");

  let queryBookingId: any = params.bookingId;
  if (ObjectId.isValid(params.bookingId) && typeof params.bookingId === 'string' && params.bookingId.length === 24) {
      queryBookingId = new ObjectId(params.bookingId);
  }

  const bookingDoc = await bookingsCol.findOne({ _id: queryBookingId, userId: session.user.id });

  if (!bookingDoc) {
    return (
      <main className="flex min-h-screen items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white">Booking not found</h1>
          <Link href="/my-bookings" className="mt-4 inline-block text-truf-lime hover:underline">
            Back to My Bookings
          </Link>
        </div>
      </main>
    );
  }

  let slotDate = "";
  let sportName = "Unknown";

  if (bookingDoc.slotId) {
     const slot = await slotsCol.findOne({ _id: new ObjectId(bookingDoc.slotId as string) });
     if (slot) {
         slotDate = slot.slotDate as string;
         if (slot.courtId) {
             const court = await courtsCol.findOne({ _id: slot.courtId as any });
             if (court && court.sportId) {
                 const sport = await sportsCol.findOne({ _id: court.sportId as any });
                 if (sport && sport.name) {
                     sportName = sport.name as string;
                 }
             }
         }
     }
  }

  const reviewDoc = await reviewsCol.findOne({ bookingId: params.bookingId });

  // Guard: already reviewed
  if (reviewDoc) {
    return (
      <main className="flex min-h-screen items-center justify-center p-4">
        <div className="max-w-md rounded-2xl border border-white/5 bg-truf-card p-10 text-center">
          <p className="text-4xl mb-4">✅</p>
          <h1 className="text-xl font-bold text-white">Review already submitted</h1>
          <p className="mt-2 text-white/50">Thank you for your feedback!</p>
          <Link href="/my-bookings" className="mt-6 inline-block text-truf-lime hover:underline">
            Back to My Bookings
          </Link>
        </div>
      </main>
    );
  }

  // Guard: slot not yet past
  const parsedSlotDate = new Date(slotDate);
  parsedSlotDate.setHours(23, 59, 59, 999);
  if (parsedSlotDate > new Date()) {
    return (
      <main className="flex min-h-screen items-center justify-center p-4">
        <div className="max-w-md rounded-2xl border border-white/5 bg-truf-card p-10 text-center">
          <p className="text-4xl mb-4">⏳</p>
          <h1 className="text-xl font-bold text-white">Session hasn&apos;t happened yet</h1>
          <p className="mt-2 text-white/50">Come back after your session to leave a review.</p>
          <Link href="/my-bookings" className="mt-6 inline-block text-truf-lime hover:underline">
            Back to My Bookings
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-truf-dark py-16">
      <div className="mx-auto max-w-lg px-4">
        <Link href="/my-bookings" className="text-sm text-white/40 hover:text-white">
          ← Back to My Bookings
        </Link>

        <h1 className="mt-4 text-3xl font-black tracking-tight text-white">
          Leave a Review
        </h1>
        <p className="mt-2 text-white/50">
          Your honest feedback helps other players.
        </p>

        <div className="mt-10 rounded-2xl border border-white/5 bg-truf-card p-8">
          <ReviewForm
            bookingId={params.bookingId}
            userId={session.user.id}
            sportName={sportName}
            slotDate={slotDate}
          />
        </div>
      </div>
    </main>
  );
}
