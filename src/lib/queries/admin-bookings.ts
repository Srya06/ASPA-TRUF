import "server-only";
import { ObjectId } from "mongodb";
import { getCollection } from "@/lib/db/client";

export interface AdminBooking {
  id: string;
  booking_ref: string;
  customer_name: string;
  customer_phone: string;
  status: string;
  sport_name: string;
  court_name: string;
  slot_date: string;
  start_time: string;
  end_time: string;
  final_amount_paise: number;
  created_at: string;
  screenshot_base64?: string;
  slot_id: string;
}

export async function getAdminBookings(limit = 50): Promise<AdminBooking[]> {
  const bookingsCol = await getCollection("bookings");
  const slotsCol = await getCollection("slots");
  const courtsCol = await getCollection("courts");
  const sportsCol = await getCollection("sports");

  const bookingDocs = await bookingsCol.find({}).sort({ createdAt: -1 }).limit(limit).toArray();

  const adminBookings: AdminBooking[] = [];

  for (const bookingDoc of bookingDocs) {
    let slotDoc = null;
    const firstSlotId = bookingDoc.slotIds?.[0] || bookingDoc.slotId;
    if (firstSlotId) {
        let queryId: any = firstSlotId;
        if (ObjectId.isValid(queryId) && (typeof queryId === 'string' && queryId.length === 24)) {
            queryId = new ObjectId(queryId);
        }
        slotDoc = await slotsCol.findOne({ _id: queryId });
    }
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

    adminBookings.push({
      id: bookingDoc._id.toString(),
      booking_ref: bookingDoc.bookingRef as string,
      customer_name: bookingDoc.customerName as string,
      customer_phone: bookingDoc.customerPhone as string,
      status: bookingDoc.status as string,
      sport_name: sportDoc.name as string,
      court_name: courtDoc.name as string,
      slot_date: slotDoc.slotDate as string,
      start_time: slotDoc.startTime as string,
      end_time: slotDoc.endTime as string,
      final_amount_paise: bookingDoc.finalAmountPaise as number,
      created_at: (bookingDoc.createdAt as Date).toISOString(),
      screenshot_base64: bookingDoc.screenshotBase64 as string | undefined,
      slot_id: slotDoc._id.toString(),
    });
  }

  return adminBookings;
}
