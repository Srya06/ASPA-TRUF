import "server-only";

import { isDatabaseConfigured, getCollection } from "@/lib/db/client";
import {
  FALLBACK_SPORTS,
  warnFallbackUsage,
} from "@/lib/db/fallback-seed";
import type { Sport, SportSlug, SportsResponse, VenueInfo } from "@/types";
import { getTurfPricing } from "@/lib/pricing";

export async function getSports(): Promise<SportsResponse> {
  if (!isDatabaseConfigured()) {
    warnFallbackUsage("getSports");
    return {
      sports: FALLBACK_SPORTS,
      venue: {
        name: "TRUF Sports Arena",
        city: "Hunsur",
        state: "Karnataka",
        isSeed: true,
      },
      source: "fallback",
    };
  }

  const venuesCol = await getCollection("venues");
  const sportsCol = await getCollection("sports");
  const courtsCol = await getCollection("courts");
  const pricingCol = await getCollection("pricing_rules");

  // Get venue
  const venueDoc = await venuesCol.findOne({});
  const venue: VenueInfo = venueDoc
    ? {
        name: venueDoc.name as string,
        city: venueDoc.city as string,
        state: venueDoc.state as string,
        isSeed: venueDoc.isSeed as boolean,
      }
    : {
        name: "TRUF Sports Arena",
        city: "Hunsur",
        state: "Karnataka",
        isSeed: true,
      };

  // Get active sports
  const activeSports = await sportsCol.find({ isActive: true }).sort({ displayOrder: 1 }).toArray();

  const sports: Sport[] = [];
  for (const sportDoc of activeSports) {
    
    // Football and Cricket allow half-court bookings, Volleyball is full-court only
    const courtType = sportDoc.slug === "volleyball" ? "full" : "half";
    // Get the non-peak price (e.g. 10 AM) as the "starting from" price
    const minBasePrice = getTurfPricing(10, courtType).finalPricePaise;

    sports.push({
      id: sportDoc._id.toString(),
      name: sportDoc.name as string,
      slug: sportDoc.slug as SportSlug,
      description: sportDoc.description as string ?? "",
      iconName: sportDoc.iconName as string ?? sportDoc.slug as string,
      imageUrl: sportDoc.imageUrl as string ?? "",
      displayOrder: sportDoc.displayOrder as number,
      basePricePaise: minBasePrice,
      courtCount: 1, // Single physical turf
      isSeed: sportDoc.isSeed as boolean,
    });
  }

  return { sports, venue, source: "database" };
}
