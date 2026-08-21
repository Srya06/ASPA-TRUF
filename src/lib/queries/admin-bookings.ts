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

  // Fetch all courts and sports into memory (they are very small collections)
  const allCourts = await courtsCol.find({}).toArray();
  const allSports = await sportsCol.find({}).toArray();
  
  const courtsMap = new Map(allCourts.map(c => [c._id.toString(), c]));
  const sportsMapId = new Map(allSports.map(s => [s._id.toString(), s]));
  const sportsMapSlug = new Map(allSports.map(s => [s.slug as string, s]));
  const defaultSport = allSports.find(s => s.isActive);

  const bookingDocs = await bookingsCol.find({}).sort({ createdAt: -1 }).limit(limit).toArray();

  // Extract all unique slot IDs
  const slotObjectIds: ObjectId[] = [];
  for (const b of bookingDocs) {
    const slotIds = b.slotIds as string[] | undefined;
    const firstSlotId = slotIds?.[0] || b.slotId;
    if (firstSlotId && ObjectId.isValid(firstSlotId as string)) {
        slotObjectIds.push(new ObjectId(firstSlotId as string));
    }
  }

  // Fetch all related slots at once
  const slotDocs = await slotsCol.find({ _id: { $in: slotObjectIds } }).toArray();
  const slotsMap = new Map(slotDocs.map(s => [s._id.toString(), s]));

  const adminBookings: AdminBooking[] = [];

  for (const bookingDoc of bookingDocs) {
    const slotIds = bookingDoc.slotIds as string[] | undefined;
    const firstSlotId = slotIds?.[0] || bookingDoc.slotId;
    if (!firstSlotId) continue;

    const slotDoc = slotsMap.get(firstSlotId as string);
    if (!slotDoc) continue;

    const courtDoc = courtsMap.get((slotDoc.courtId as any)?.toString());
    if (!courtDoc) continue;

    let sportDoc = null;
    if (bookingDoc.sportSlug) {
        sportDoc = sportsMapSlug.get(bookingDoc.sportSlug as string);
    } else if (courtDoc.sportId) {
        sportDoc = sportsMapId.get((courtDoc.sportId as any)?.toString());
    }
    
    if (!sportDoc) {
        sportDoc = defaultSport;
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
