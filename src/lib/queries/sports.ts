import "server-only";

import { isDatabaseConfigured, getCollection } from "@/lib/db/client";
import {
  FALLBACK_SPORTS,
  warnFallbackUsage,
} from "@/lib/db/fallback-seed";
import type { Sport, SportSlug, SportsResponse, VenueInfo } from "@/types";

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
    // Get courts for this sport
    const courts = await courtsCol.find({ sportId: sportDoc._id, isActive: true }).toArray();
    const courtIds = courts.map(c => c._id);
    
    // Get minimum base price for these courts
    let minBasePrice = 0;
    if (courtIds.length > 0) {
        const pricingRules = await pricingCol.find({ courtId: { $in: courtIds }, isActive: true }).toArray();
        if (pricingRules.length > 0) {
            minBasePrice = Math.min(...pricingRules.map(p => p.basePricePaise as number));
        }
    }

    sports.push({
      id: sportDoc._id.toString(),
      name: sportDoc.name as string,
      slug: sportDoc.slug as SportSlug,
      description: sportDoc.description as string ?? "",
      iconName: sportDoc.iconName as string ?? sportDoc.slug as string,
      imageUrl: sportDoc.imageUrl as string ?? "",
      displayOrder: sportDoc.displayOrder as number,
      basePricePaise: minBasePrice,
      courtCount: courts.length,
      isSeed: sportDoc.isSeed as boolean,
    });
  }

  return { sports, venue, source: "database" };
}
