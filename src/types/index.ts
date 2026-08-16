export type SportSlug = "football" | "cricket" | "badminton" | "volleyball" | string;

export type SlotStatus = "available" | "locked" | "booked" | "blocked";

export interface Sport {
  id: string;
  name: string;
  slug: SportSlug;
  description: string;
  iconName: string;
  imageUrl: string;
  displayOrder: number;
  basePricePaise: number;
  courtCount: number;
  isSeed: boolean;
}

export interface AvailabilitySlot {
  id: string;
  sportSlug: SportSlug;
  courtName: string;
  slotDate: string;
  startTime: string;
  endTime: string;
  status: SlotStatus;
  pricePaise: number;
  isSeed: boolean;
}

export interface VenueInfo {
  name: string;
  city: string;
  state: string;
  isSeed: boolean;
}

export interface SportsResponse {
  sports: Sport[];
  venue: VenueInfo;
  source: "database" | "fallback";
}

export interface AvailabilityResponse {
  slots: AvailabilitySlot[];
  date: string;
  source: "database" | "fallback";
}
