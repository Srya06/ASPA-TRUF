import "server-only";
import { getCollection } from "@/lib/db/client";

export interface AdminSlot {
  id: string;
  sport_slug: string;
  court_name: string;
  slot_date: string;
  start_time: string;
  end_time: string;
  status: string;
  price_paise: number;
  booking_ref?: string;
  customer_name?: string;
}

export async function getAdminSlots(startDate: string, endDate: string): Promise<AdminSlot[]> {
  const slotsCol = await getCollection("slots");
  const courtsCol = await getCollection("courts");
  const sportsCol = await getCollection("sports");
  const bookingsCol = await getCollection("bookings");

  const allSports = await sportsCol.find({ isActive: true }).toArray();
  const allCourts = await courtsCol.find({ isActive: true }).toArray();
  
  const sportMap = new Map(allSports.map(s => [s._id.toString(), s]));
  const courtMap = new Map(allCourts.map(c => [c._id.toString(), c]));

  const slotDocs = await slotsCol.find({
    slotDate: { $gte: startDate, $lte: endDate }
  }).toArray();

  const adminSlots: AdminSlot[] = [];

  for (const slotDoc of slotDocs) {
    const court = courtMap.get(slotDoc.courtId as string);
    if (!court) continue;
    
    const sport = sportMap.get(court.sportId as string);
    if (!sport) continue;

    let bookingRef;
    let customerName;

    if (slotDoc.status === "booked") {
       const booking = await bookingsCol.findOne({ slotId: slotDoc._id.toString(), status: 'confirmed' });
       if (booking) {
           bookingRef = booking.bookingRef as string;
           customerName = booking.customerName as string;
       }
    }

    adminSlots.push({
      id: slotDoc._id.toString(),
      sport_slug: sport.slug as string,
      court_name: court.name as string,
      slot_date: slotDoc.slotDate as string,
      start_time: slotDoc.startTime as string,
      end_time: slotDoc.endTime as string,
      status: slotDoc.status as string,
      price_paise: slotDoc.pricePaise as number,
      booking_ref: bookingRef,
      customer_name: customerName,
    });
  }

  adminSlots.sort((a, b) => {
      if (a.slot_date !== b.slot_date) return a.slot_date.localeCompare(b.slot_date);
      
      const sportA = Array.from(sportMap.values()).find(s => s.slug === a.sport_slug);
      const sportB = Array.from(sportMap.values()).find(s => s.slug === b.sport_slug);
      const orderA = sportA ? (sportA.displayOrder as number) : 999;
      const orderB = sportB ? (sportB.displayOrder as number) : 999;
      
      if (orderA !== orderB) return orderA - orderB;
      if (a.court_name !== b.court_name) return a.court_name.localeCompare(b.court_name);
      return a.start_time.localeCompare(b.start_time);
  });

  return adminSlots;
}
