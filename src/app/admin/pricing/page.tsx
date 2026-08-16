import { getCollection } from "@/lib/db/client";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { PricingList } from "./PricingList";
export const dynamic = "force-dynamic";

export default async function AdminPricingPage() {
  const venuesCol = await getCollection("venues");
  const sportsCol = await getCollection("sports");
  const courtsCol = await getCollection("courts");
  const pricingCol = await getCollection("pricing_rules");

  const venue = await venuesCol.findOne({});
  const venueId = venue?._id.toString();

  const sportsDocs = await sportsCol.find({ venueId }).sort({ displayOrder: 1 }).toArray();
  const sportsMap = new Map(sportsDocs.map(s => [s._id.toString(), s]));

  const courtsDocs = await courtsCol.find({ venueId }).toArray();
  
  const pricing = [];
  
  for (const c of courtsDocs) {
    const sport = sportsMap.get(c.sportId as string);
    if (!sport) continue;

    const pricingRule = await pricingCol.findOne({ courtId: c._id.toString(), isActive: true });

    pricing.push({
      court_id: c._id.toString(),
      court_name: c.name as string,
      sport_name: sport.name as string,
      base_price_paise: pricingRule ? (pricingRule.basePricePaise as number) : null,
      peak_multiplier: pricingRule ? (pricingRule.peakMultiplier as number) : null,
      _order: sport.displayOrder as number
    });
  }

  pricing.sort((a, b) => {
    if (a._order !== b._order) return a._order - b._order;
    return a.court_name.localeCompare(b.court_name);
  });

  return (
    <>
      <AdminHeader title="Pricing Rules" />
      <div className="p-4 md:p-8 overflow-x-hidden w-full">
        <PricingList pricing={pricing} />
      </div>
    </>
  );
}
