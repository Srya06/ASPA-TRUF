import { getCollection } from "@/lib/db/client";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { SportsList } from "./SportsList";
export const dynamic = "force-dynamic";

export default async function AdminSportsPage() {
  const venuesCol = await getCollection("venues");
  const sportsCol = await getCollection("sports");

  const venue = await venuesCol.findOne({});
  const venueId = venue?._id.toString();

  const sportsDocs = await sportsCol.find({ venueId }).sort({ displayOrder: 1 }).toArray();
  const sports = sportsDocs.map(s => ({
    id: s._id.toString(),
    name: s.name as string,
    slug: s.slug as string,
    display_order: s.displayOrder as number,
    is_active: s.isActive as boolean,
  }));

  return (
    <>
      <AdminHeader title="Sports Management" />
      <div className="p-8">
        <SportsList sports={sports} venueId={venueId || ""} />
      </div>
    </>
  );
}
