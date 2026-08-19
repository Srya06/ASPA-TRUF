import "server-only";
import { ObjectId } from "mongodb";
import { getCollection } from "@/lib/db/client";

export interface MyBooking {
  id: string;
  booking_ref: string;
  status: string;
  customer_name: string;
  final_amount_paise: number;
  sport_name: string;
  sport_slug: string;
  court_name: string;
  slot_date: string;
  start_time: string;
  end_time: string;
  venue_name: string;
  venue_city: string;
  confirmed_at: string | null;
  created_at: string;
  has_review: boolean;
  screenshot_base64?: string;
}

export async function getMyBookings(userId: string): Promise<MyBooking[]> {
  const bookingsCol = await getCollection("bookings");
  const slotsCol = await getCollection("slots");
  const courtsCol = await getCollection("courts");
  const sportsCol = await getCollection("sports");
  const venuesCol = await getCollection("venues");
  const reviewsCol = await getCollection("reviews");

  const bookingDocs = await bookingsCol.find({ userId }).sort({ createdAt: -1 }).toArray();

  const myBookings: MyBooking[] = [];

  for (const bookingDoc of bookingDocs) {
    const firstSlotId = bookingDoc.slotIds?.[0] || bookingDoc.slotId;
    if (!firstSlotId) continue;
    
    let querySlotId: any = firstSlotId;
    if (ObjectId.isValid(querySlotId) && typeof querySlotId === 'string' && querySlotId.length === 24) {
        querySlotId = new ObjectId(querySlotId);
    }

    const slotDoc = await slotsCol.findOne({ _id: querySlotId });
    if (!slotDoc) continue;

    const courtDoc = await courtsCol.findOne({ _id: slotDoc.courtId as any });
    if (!courtDoc) continue;

    // Handle generic courts by using the sportSlug saved in the booking
    let sportDoc = null;
    if (bookingDoc.sportSlug) {
        sportDoc = await sportsCol.findOne({ slug: bookingDoc.sportSlug as string });
    } else if (courtDoc.sportId) {
        sportDoc = await sportsCol.findOne({ _id: courtDoc.sportId as any });
    }
    
    if (!sportDoc) {
        sportDoc = await sportsCol.findOne({ isActive: true }); // Legacy fallback
    }
    if (!sportDoc) continue;

    const venueDoc = await venuesCol.findOne({ _id: courtDoc.venueId as any });
    if (!venueDoc) continue;

    const reviewDoc = await reviewsCol.findOne({ bookingId: bookingDoc._id.toString() });

    myBookings.push({
      id: bookingDoc._id.toString(),
      booking_ref: bookingDoc.bookingRef as string,
      status: bookingDoc.status as string,
      customer_name: bookingDoc.customerName as string,
      final_amount_paise: bookingDoc.finalAmountPaise as number,
      sport_name: sportDoc.name as string,
      sport_slug: sportDoc.slug as string,
      court_name: courtDoc.name as string,
      slot_date: slotDoc.slotDate as string,
      start_time: slotDoc.startTime as string,
      end_time: slotDoc.endTime as string,
      venue_name: venueDoc.name as string,
      venue_city: venueDoc.city as string,
      confirmed_at: bookingDoc.confirmedAt ? (bookingDoc.confirmedAt as Date).toISOString() : null,
      created_at: (bookingDoc.createdAt as Date).toISOString(),
      has_review: !!reviewDoc,
      screenshot_base64: bookingDoc.screenshotBase64 as string | undefined,
    });
  }

  return myBookings;
}
