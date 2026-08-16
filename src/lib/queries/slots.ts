import "server-only";
import { ObjectId } from "mongodb";
import { isDatabaseConfigured, getCollection } from "@/lib/db/client";
import { FALLBACK_AVAILABILITY, warnFallbackUsage } from "@/lib/db/fallback-seed";

export interface SlotDetails {
  id: string;
  sport_name: string;
  court_name: string;
  slot_date: string;
  start_time: string;
  end_time: string;
  status: string;
  price_paise: number;
}

export async function getSlotDetails(slotId: string): Promise<SlotDetails | null> {
  if (!isDatabaseConfigured()) {
    warnFallbackUsage("getSlotDetails");
    // Find from fallback availability
    const slot = FALLBACK_AVAILABILITY.find((s) => s.id === slotId);
    if (!slot) return null;
    return {
      id: slot.id,
      sport_name: slot.sportSlug.charAt(0).toUpperCase() + slot.sportSlug.slice(1),
      court_name: slot.courtName,
      slot_date: slot.slotDate,
      start_time: slot.startTime,
      end_time: slot.endTime,
      status: slot.status,
      price_paise: slot.pricePaise,
    };
  }

  const slotsCol = await getCollection("slots");
  const courtsCol = await getCollection("courts");
  const sportsCol = await getCollection("sports");

  // Determine query format based on slotId
  let queryId: any = slotId;
  if (ObjectId.isValid(slotId) && (typeof slotId === 'string' && slotId.length === 24)) {
      queryId = new ObjectId(slotId);
  }

  const slotDoc = await slotsCol.findOne({ _id: queryId });
  if (!slotDoc) return null;

  const courtDoc = await courtsCol.findOne({ _id: slotDoc.courtId as any });
  if (!courtDoc) return null;

  const sportDoc = await sportsCol.findOne({ _id: courtDoc.sportId as any });
  if (!sportDoc) return null;

  return {
    id: slotDoc._id.toString(),
    sport_name: sportDoc.name as string,
    court_name: courtDoc.name as string,
    slot_date: slotDoc.slotDate as string,
    start_time: slotDoc.startTime as string,
    end_time: slotDoc.endTime as string,
    status: slotDoc.status as string,
    price_paise: slotDoc.pricePaise as number,
  };
}

export async function getSlotLock(slotId: string) {
  if (!isDatabaseConfigured()) return null;
  
  const locksCol = await getCollection("slot_locks");
  
  let queryId: any = slotId;
  if (ObjectId.isValid(slotId) && (typeof slotId === 'string' && slotId.length === 24)) {
      queryId = new ObjectId(slotId);
  }

  const lockDoc = await locksCol.findOne({ slotId: queryId });
  if (!lockDoc) return null;
  
  return {
    expires_at: lockDoc.expiresAt as Date,
    user_id: lockDoc.userId as string
  };
}
