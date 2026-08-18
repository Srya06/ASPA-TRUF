export type CourtType = "half" | "full" | "full-turf";

// By default, let's assume inaugural offer is active globally for now.
// In a real system, this would be an environment variable or database flag.
export const IS_INAUGURAL_OFFER = true;

/**
 * Calculates the dynamic price for Football Turf based on time and court type.
 * @param hour The hour of the day (0-23)
 * @param courtType The type of court selected
 * @param isInauguralOffer Whether the inaugural offer pricing should apply
 * @returns The price in paise
 */
export function getTurfPricing(hour: number, courtType: CourtType) {
  // Peak: 7:00 AM - 9:00 AM (hour 7, 8) and 6:00 PM - 11:00 PM (hour 18, 19, 20, 21, 22)
  const isPeak = (hour >= 7 && hour < 9) || (hour >= 18 && hour < 23);
  
  // Normal prices
  let regularPrice = 0;
  if (isPeak) {
    regularPrice = courtType === "half" ? 699 : 999;
  } else {
    regularPrice = courtType === "half" ? 499 : 799;
  }

  return {
    regularPricePaise: regularPrice * 100,
    isOfferActive: false,
    finalPricePaise: regularPrice * 100,
  };
}

/**
 * Validates whether a time slot has expired compared to current IST time.
 * @param slotDate Format YYYY-MM-DD
 * @param startTime Format HH:MM (24-hour)
 */
export function isSlotExpired(slotDate: string, startTime: string): boolean {
  // Parse slot date and time
  const [year, month, day] = slotDate.split('-').map(Number);
  const [hours, minutes] = startTime.split(':').map(Number);
  
  // Construct the exact slot time in IST
  // By using string format with +05:30 we ensure it represents the absolute time
  const slotDateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}T${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00+05:30`;
  const slotTimeMs = new Date(slotDateStr).getTime();
  
  const nowMs = Date.now();
  
  return slotTimeMs < nowMs;
}
