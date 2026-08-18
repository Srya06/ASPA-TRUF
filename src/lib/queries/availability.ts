import "server-only";

import { isDatabaseConfigured, getCollection } from "@/lib/db/client";
import {
  FALLBACK_AVAILABILITY,
  warnFallbackUsage,
} from "@/lib/db/fallback-seed";
import type { AvailabilityResponse, AvailabilitySlot, SportSlug } from "@/types";

function formatTime(time: string): string {
  return time.slice(0, 5);
}

function formatDate(date: string | Date): string {
  if (date instanceof Date) {
    return date.toISOString().slice(0, 10);
  }
  return String(date).slice(0, 10);
}

export async function getAvailability(
  date?: string,
): Promise<AvailabilityResponse> {
  const targetDate = date ?? new Date().toISOString().slice(0, 10);

  if (!isDatabaseConfigured()) {
    warnFallbackUsage("getAvailability");
    return {
      slots: FALLBACK_AVAILABILITY.filter((s) => s.slotDate === targetDate),
      date: targetDate,
      source: "fallback",
    };
  }

  const slotsCol = await getCollection("slots");
  const sportsCol = await getCollection("sports");
  const courtsCol = await getCollection("courts");
  
  // MongoDB doesn't have joins natively, so we'll fetch the necessary related data
  // Since sports and courts are small, we can fetch them all and map in memory
  const allSports = await sportsCol.find({ isActive: true }).toArray();
  const allCourts = await courtsCol.find({ isActive: true }).toArray();
  
  const sportMap = new Map(allSports.map(s => [s._id.toString(), s]));
  const courtMap = new Map(allCourts.map(c => [c._id.toString(), c]));

  // Find slots for the target date
  const slotDocs = await slotsCol.find({ slotDate: targetDate }).toArray();

  const slots: AvailabilitySlot[] = [];
  
  for (const slotDoc of slotDocs) {
    const court = courtMap.get(slotDoc.courtId as string);
    if (!court) continue; // Skip if court is inactive or missing
    
    // Duplicate this slot for every active sport since courts are shared
    for (const sport of sportMap.values()) {
      slots.push({
        id: slotDoc._id.toString() + "_" + sport.slug, // unique key for React
        realSlotId: slotDoc._id.toString(), // actual DB ID
        sportSlug: sport.slug as SportSlug,
        courtName: court.name as string,
        slotDate: formatDate(slotDoc.slotDate as string),
        startTime: formatTime(slotDoc.startTime as string),
        endTime: formatTime(slotDoc.endTime as string),
        status: slotDoc.status as AvailabilitySlot["status"],
        pricePaise: (sport.startingPricePaise as number) || 69900,
        isSeed: slotDoc.isSeed as boolean,
      });
    }
  }
  
  // Sort by sport display order, then court name, then start time
  slots.sort((a, b) => {
      const sportA = Array.from(sportMap.values()).find(s => s.slug === a.sportSlug);
      const sportB = Array.from(sportMap.values()).find(s => s.slug === b.sportSlug);
      const orderA = sportA ? (sportA.displayOrder as number) : 999;
      const orderB = sportB ? (sportB.displayOrder as number) : 999;
      
      if (orderA !== orderB) return orderA - orderB;
      if (a.courtName !== b.courtName) return a.courtName.localeCompare(b.courtName);
      return a.startTime.localeCompare(b.startTime);
  });

  return { slots, date: targetDate, source: "database" };
}

export async function countAvailableToday(): Promise<number> {
  const { slots } = await getAvailability();
  return slots.filter((s) => s.status === "available").length;
}
