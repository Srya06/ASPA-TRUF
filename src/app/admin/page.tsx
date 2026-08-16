import { getCollection } from "@/lib/db/client";
import { formatPrice } from "@/lib/utils";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { DashboardChart } from "@/components/admin/DashboardChart";
export const revalidate = 5;

export default async function AdminDashboardPage() {
  const bookingsCol = await getCollection("bookings");
  const slotsCol = await getCollection("slots");

  const todayStr = new Date().toISOString().split("T")[0];
  const todayDate = new Date();
  todayDate.setHours(0, 0, 0, 0);

  const sixDaysAgo = new Date(todayDate);
  sixDaysAgo.setDate(sixDaysAgo.getDate() - 6);

  // Today Bookings and Revenue
  const todayBookingsAgg = await bookingsCol.aggregate([
    {
      $match: {
        status: "confirmed",
        createdAt: { $gte: todayDate }
      }
    },
    {
      $group: {
        _id: null,
        count: { $sum: 1 },
        total_revenue: { $sum: "$finalAmountPaise" }
      }
    }
  ]).toArray();

  const todayStats = todayBookingsAgg[0] || { count: 0, total_revenue: 0 };

  // Slots
  const slotsAgg = await slotsCol.aggregate([
    {
      $match: {
        slotDate: todayStr
      }
    },
    {
      $group: {
        _id: null,
        available: { $sum: { $cond: [{ $eq: ["$status", "available"] }, 1, 0] } },
        booked: { $sum: { $cond: [{ $eq: ["$status", "booked"] }, 1, 0] } }
      }
    }
  ]).toArray();

  const slotsStats = slotsAgg[0] || { available: 0, booked: 0 };

  // Chart data
  const chartAgg = await bookingsCol.aggregate([
    {
      $match: {
        status: "confirmed",
        createdAt: { $gte: sixDaysAgo }
      }
    },
    {
      $project: {
        createdAt: 1,
        finalAmountPaise: 1,
        dateStr: {
          $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
        },
        dayStr: {
          $dateToString: { format: "%b %d", date: "$createdAt" }
        }
      }
    },
    {
      $group: {
        _id: "$dateStr",
        dayStr: { $first: "$dayStr" },
        revenue: { $sum: "$finalAmountPaise" },
        bookings: { $sum: 1 }
      }
    },
    {
      $sort: { _id: 1 }
    }
  ]).toArray();

  const chartRes = chartAgg.map(item => ({
    date: item.dayStr,
    revenue: item.revenue,
    bookings: item.bookings
  }));

  const stats = {
    todayBookings: todayStats.count,
    todayRevenue: todayStats.total_revenue,
    availableSlots: slotsStats.available,
    bookedSlots: slotsStats.booked,
  };

  return (
    <>
      <AdminHeader title="Dashboard" />
      <div className="p-8 space-y-8">
        <h1 className="text-2xl font-black uppercase tracking-widest text-white">
          Today&apos;s Overview
        </h1>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-white/5 bg-truf-card p-6">
            <p className="text-sm font-medium text-white/50">Revenue</p>
            <p className="mt-2 text-3xl font-black text-truf-lime">
              {formatPrice(stats.todayRevenue)}
            </p>
          </div>
          <div className="rounded-2xl border border-white/5 bg-truf-card p-6">
            <p className="text-sm font-medium text-white/50">Bookings</p>
            <p className="mt-2 text-3xl font-black text-white">
              {stats.todayBookings}
            </p>
          </div>
          <div className="rounded-2xl border border-white/5 bg-truf-card p-6">
            <p className="text-sm font-medium text-white/50">Slots Booked</p>
            <p className="mt-2 text-3xl font-black text-white">
              {stats.bookedSlots}
            </p>
          </div>
          <div className="rounded-2xl border border-white/5 bg-truf-card p-6">
            <p className="text-sm font-medium text-white/50">Slots Available</p>
            <p className="mt-2 text-3xl font-black text-amber-400">
              {stats.availableSlots}
            </p>
          </div>
        </div>

        <div className="pt-4">
          <DashboardChart data={chartRes} />
        </div>
      </div>
    </>
  );
}
