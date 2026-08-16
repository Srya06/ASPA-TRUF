import { getCollection } from "@/lib/db/client";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { ReviewsList } from "./ReviewsList";
import { ObjectId } from "mongodb";
export const dynamic = "force-dynamic";

export default async function AdminReviewsPage() {
  const reviewsCol = await getCollection("reviews");
  const usersCol = await getCollection("users");
  const bookingsCol = await getCollection("bookings");
  const slotsCol = await getCollection("slots");
  const courtsCol = await getCollection("courts");
  const sportsCol = await getCollection("sports");

  const reviewsDocs = await reviewsCol.find({}).sort({ createdAt: -1 }).toArray();

  const reviews = [];

  for (const r of reviewsDocs) {
    let customerName = "Unknown";
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
      is_published: r.isPublished as boolean,
      created_at: (r.createdAt as Date).toISOString(),
      customer_name: customerName,
      sport_name: sportName
    });
  }

  return (
    <>
      <AdminHeader title="Reviews Moderation" />
      <div className="p-8">
        <ReviewsList reviews={reviews} />
      </div>
    </>
  );
}
