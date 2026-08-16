import { getCollection } from "@/lib/db/client";
import { AdminHeader } from "@/components/admin/AdminHeader";
export const dynamic = "force-dynamic";

export default async function AdminCustomersPage() {
  const usersCol = await getCollection("users");
  const bookingsCol = await getCollection("bookings");

  const users = await usersCol.find({ role: 'customer' }).sort({ createdAt: -1 }).toArray();

  const customers = [];
  for (const u of users) {
    const totalBookings = await bookingsCol.countDocuments({ userId: u._id.toString(), status: 'confirmed' });
    customers.push({
      id: u._id.toString(),
      name: u.name as string | null,
      phone: u.phone as string | null,
      email: u.email as string | null,
      created_at: (u.createdAt as Date)?.toISOString() || new Date().toISOString(),
      total_bookings: totalBookings.toString()
    });
  }

  return (
    <>
      <AdminHeader title="Customers" />
      <div className="p-4 md:p-8 overflow-x-hidden w-full">
        {/* Mobile View: Stacked Cards */}
        <div className="md:hidden space-y-4">
          {customers.length === 0 ? (
            <div className="rounded-xl border border-white/5 bg-truf-card p-8 text-center text-white/50">
              No customers found.
            </div>
          ) : (
            customers.map((c) => (
              <div key={c.id} className="rounded-xl border border-white/5 bg-truf-card p-4 space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-bold text-white text-lg">{c.name || <span className="text-white/30">Unknown</span>}</div>
                    <div className="font-mono text-xs text-truf-lime">{c.phone || "No phone"}</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs border-t border-white/5 pt-3">
                  <div>
                    <div className="text-white/50 mb-0.5">Email</div>
                    <div className="text-white truncate pr-2">{c.email || "-"}</div>
                  </div>
                  <div>
                    <div className="text-white/50 mb-0.5">Joined</div>
                    <div className="text-white">
                      {new Date(c.created_at).toLocaleDateString("en-IN", {
                        day: "numeric", month: "short", year: "numeric",
                      })}
                    </div>
                  </div>
                </div>

                <div className="border-t border-white/5 pt-3 flex justify-between items-center">
                  <span className="text-xs text-white/50">Confirmed Bookings</span>
                  <span className="font-bold text-white text-sm bg-white/5 px-3 py-1 rounded-full">{c.total_bookings}</span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Desktop View: Table */}
        <div className="hidden md:block rounded-xl border border-white/5 bg-truf-card p-4 overflow-x-auto">
          <table className="w-full text-left text-sm text-white/70">
            <thead className="border-b border-white/5 text-white">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Phone</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Confirmed Bookings</th>
                <th className="px-4 py-3 text-right">Joined</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((c) => (
                <tr key={c.id} className="border-b border-white/5 hover:bg-white/5">
                  <td className="px-4 py-3 font-bold text-white">{c.name || <span className="text-white/30">Unknown</span>}</td>
                  <td className="px-4 py-3 font-mono">{c.phone || "-"}</td>
                  <td className="px-4 py-3">{c.email || "-"}</td>
                  <td className="px-4 py-3">{c.total_bookings}</td>
                  <td className="px-4 py-3 text-right text-white/50">
                    {new Date(c.created_at).toLocaleDateString("en-IN", {
                      day: "numeric", month: "short", year: "numeric",
                    })}
                  </td>
                </tr>
              ))}
              {customers.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-white/50">
                    No customers found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
