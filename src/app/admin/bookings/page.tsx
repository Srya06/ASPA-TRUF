import { getAdminBookings } from "@/lib/queries/admin-bookings";
import { formatPrice, formatTime12h, cn } from "@/lib/utils";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { AdminBookingsTable } from "@/components/admin/AdminBookingsTable";
import { ExportButton } from "@/components/admin/ExportButton";

export const dynamic = "force-dynamic";

export default async function AdminBookingsPage() {
  const bookings = await getAdminBookings(50);

  return (
    <>
      <AdminHeader title="Bookings" />
      <div className="p-8">
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black uppercase tracking-widest text-white">
              Bookings
            </h1>
            <p className="text-sm text-white/50">{bookings.length} most recent</p>
          </div>
          <ExportButton />
        </div>

        <AdminBookingsTable bookings={bookings} />
      </div>
    </>
  );
}
