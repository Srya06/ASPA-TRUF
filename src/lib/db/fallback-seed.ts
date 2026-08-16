import type { Sport, AvailabilitySlot, SportSlug } from "@/types";

/** In-memory fallback when DATABASE_URL is unset — UI preview only. */
export const FALLBACK_SPORTS: Sport[] = [
  {
    id: "b1000000-0000-4000-8000-000000000001",
    name: "Football",
    slug: "football",
    description:
      "Full-size 7-a-side turf with FIFA-quality artificial grass.",
    iconName: "football",
    imageUrl:
      "https://images.unsplash.com/photo-1574629810360-7abbc94d50a5?w=800&q=80",
    displayOrder: 1,
    basePricePaise: 150000,
    courtCount: 1,
    isSeed: true,
  },
  {
    id: "b1000000-0000-4000-8000-000000000002",
    name: "Cricket",
    slug: "cricket",
    description:
      "Box cricket nets with bowling machine available on request.",
    iconName: "cricket",
    imageUrl:
      "https://images.unsplash.com/photo-1531419140115-29d9249d319c?w=800&q=80",
    displayOrder: 2,
    basePricePaise: 120000,
    courtCount: 1,
    isSeed: true,
  },
  {
    id: "b1000000-0000-4000-8000-000000000003",
    name: "Badminton",
    slug: "badminton",
    description: "Indoor synthetic courts with professional lighting.",
    iconName: "badminton",
    imageUrl:
      "https://images.unsplash.com/photo-1626224583764-f87db7ac2ed9?w=800&q=80",
    displayOrder: 3,
    basePricePaise: 40000,
    courtCount: 2,
    isSeed: true,
  },
];

function generateFallbackSlots(): AvailabilitySlot[] {
  const slots: AvailabilitySlot[] = [];
  const sports: { slug: SportSlug; court: string }[] = [
    { slug: "football", court: "Turf A" },
    { slug: "cricket", court: "Net 1" },
    { slug: "badminton", court: "Court 1" },
    { slug: "badminton", court: "Court 2" },
  ];

  const today = new Date().toISOString().slice(0, 10);
  const hours = [6, 8, 10, 14, 16, 18, 20];

  sports.forEach(({ slug, court }, courtIdx) => {
    hours.forEach((hour, hourIdx) => {
      const seed = (courtIdx * 7 + hourIdx) % 10;
      let status: AvailabilitySlot["status"] = "available";
      if (seed >= 6 && seed < 8) status = "booked";
      if (seed >= 8) status = "blocked";

      slots.push({
        id: `fallback-${slug}-${court}-${hour}`,
        sportSlug: slug,
        courtName: court,
        slotDate: today,
        startTime: `${String(hour).padStart(2, "0")}:00`,
        endTime: `${String(hour + 1).padStart(2, "0")}:00`,
        status,
        pricePaise:
          slug === "football" ? 150000 : slug === "cricket" ? 120000 : 40000,
        isSeed: true,
      });
    });
  });

  return slots;
}

export const FALLBACK_AVAILABILITY = generateFallbackSlots();

export function warnFallbackUsage(context: string): void {
  if (process.env.NODE_ENV === "development") {
    console.warn(
      `[TRUF] ${context}: DATABASE_URL not set — using in-memory seed fallback. See SANDBOX.md to connect a real database.`,
    );
  }
}
