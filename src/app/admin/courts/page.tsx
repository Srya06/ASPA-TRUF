import { getCollection } from "@/lib/db/client";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { CourtsList } from "./CourtsList";
export const dynamic = "force-dynamic";

export default async function AdminCourtsPage() {
  const venuesCol = await getCollection("venues");
  const sportsCol = await getCollection("sports");
  const courtsCol = await getCollection("courts");

  const venue = await venuesCol.findOne({});
  const venueId = venue?._id.toString();

  const sportsDocs = await sportsCol.find({ venueId }).sort({ displayOrder: 1 }).toArray();
  const sportsMap = new Map(sportsDocs.map(s => [s._id.toString(), s]));

  const sports = sportsDocs.map(s => ({
    id: s._id.toString(),
    name: s.name as string
  }));

  const courtsDocs = await courtsCol.find({ venueId }).toArray();
  const courts = courtsDocs.map(c => {
    const sport = sportsMap.get(c.sportId as string);
    return {
      id: c._id.toString(),
      name: c.name as string,
      slug: c.slug as string,
      sport_name: sport ? (sport.name as string) : "Unknown",
      capacity: c.capacity as number,
      is_active: c.isActive as boolean,
      _order: sport ? (sport.displayOrder as number) : 999
    };
  });

  courts.sort((a, b) => {
    if (a._order !== b._order) return a._order - b._order;
    return a.name.localeCompare(b.name);
  });

  return (
    <>
      <AdminHeader title="Courts Management" />
      <div className="p-8">
        <CourtsList courts={courts} sports={sports} venueId={venueId || ""} />
      </div>
    </>
  );
}
