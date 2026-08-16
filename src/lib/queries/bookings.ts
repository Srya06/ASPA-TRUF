import "server-only";
import { ObjectId } from "mongodb";
import { getCollection } from "@/lib/db/client";

export interface BookingDetails {
  id: string;
  booking_ref: string;
  status: string;
  customer_name: string;
  final_amount_paise: number;
  sport_name: string;
  court_name: string;
  slot_date: string;
  start_time: string;
  end_time: string;
  venue_name: string;
  venue_city: string;
}

export async function getBookingDetails(bookingId: string): Promise<BookingDetails | null> {
  const bookingsCol = await getCollection("bookings");
  const slotsCol = await getCollection("slots");
  const courtsCol = await getCollection("courts");
  const sportsCol = await getCollection("sports");
  const venuesCol = await getCollection("venues");

  // Determine query format based on bookingId
  let queryId: any = bookingId;
  if (ObjectId.isValid(bookingId) && (typeof bookingId === 'string' && bookingId.length === 24)) {
      queryId = new ObjectId(bookingId);
  }

  const bookingDoc = await bookingsCol.findOne({ _id: queryId });
  if (!bookingDoc) return null;

  const slotDoc = await slotsCol.findOne({ _id: new ObjectId(bookingDoc.slotId as string) });
  if (!slotDoc) return null;

  const courtDoc = await courtsCol.findOne({ _id: slotDoc.courtId as any });
  if (!courtDoc) return null;

  const sportDoc = await sportsCol.findOne({ _id: courtDoc.sportId as any });
  if (!sportDoc) return null;

  const venueDoc = await venuesCol.findOne({ _id: courtDoc.venueId as any });
  if (!venueDoc) return null;

  return {
    id: bookingDoc._id.toString(),
    booking_ref: bookingDoc.bookingRef as string,
    status: bookingDoc.status as string,
    customer_name: bookingDoc.customerName as string,
    final_amount_paise: bookingDoc.finalAmountPaise as number,
    sport_name: sportDoc.name as string,
    court_name: courtDoc.name as string,
    slot_date: slotDoc.slotDate as string,
    start_time: slotDoc.startTime as string,
    end_time: slotDoc.endTime as string,
    venue_name: venueDoc.name as string,
    venue_city: venueDoc.city as string,
  };
}
