import { getCollection } from "@/lib/db/client";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { formatPrice, cn } from "@/lib/utils";
import { ObjectId } from "mongodb";
export const dynamic = "force-dynamic";

export default async function AdminPaymentsPage() {
  const paymentsCol = await getCollection("payments");
  const bookingsCol = await getCollection("bookings");

  const paymentsDocs = await paymentsCol.find({}).sort({ createdAt: -1 }).toArray();

  const payments = [];
  for (const p of paymentsDocs) {
    let bookingRef = "Unknown";
    let customerName = "Unknown";
    if (p.bookingId) {
       const booking = await bookingsCol.findOne({ _id: new ObjectId(p.bookingId as string) });
       if (booking) {
           bookingRef = booking.bookingRef as string;
           customerName = booking.customerName as string;
       }
    }

    payments.push({
      id: p._id.toString(),
      booking_ref: bookingRef,
      razorpay_order_id: p.razorpayOrderId as string | null,
      razorpay_payment_id: p.razorpayPaymentId as string | null,
      amount_paise: p.amountPaise as number,
      status: p.status as string,
      customer_name: customerName,
      created_at: (p.createdAt as Date).toISOString()
    });
  }

  return (
    <>
      <AdminHeader title="Payments Log" />
      <div className="p-4 md:p-8 overflow-x-hidden w-full">
        {/* Mobile View: Stacked Cards */}
        <div className="md:hidden space-y-4">
          {payments.length === 0 ? (
            <div className="rounded-xl border border-white/5 bg-truf-card p-8 text-center text-white/50">
              No payments found.
            </div>
          ) : (
            payments.map((p) => (
              <div key={p.id} className="rounded-xl border border-white/5 bg-truf-card p-4 space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-bold text-white text-lg">{p.customer_name}</div>
                    <div className="font-mono text-xs text-truf-lime mb-1">{p.booking_ref}</div>
                  </div>
                  <span className={cn(
                    "inline-flex rounded-full px-2 py-0.5 text-xs font-bold uppercase tracking-wider",
                    p.status === "paid" ? "bg-truf-lime/10 text-truf-lime" :
                    p.status === "pending" ? "bg-amber-500/10 text-amber-400" :
                    p.status === "refunded" ? "bg-blue-500/10 text-blue-400" :
                    "bg-red-500/10 text-red-400"
                  )}>
                    {p.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs border-t border-white/5 pt-3">
                  <div>
                    <div className="text-white/50 mb-0.5">Amount</div>
                    <div className="text-white font-bold">{formatPrice(p.amount_paise)}</div>
                  </div>
                  <div>
                    <div className="text-white/50 mb-0.5">Date</div>
                    <div className="text-white">
                      {new Date(p.created_at).toLocaleString("en-IN", {
                        day: "numeric", month: "short", hour: "numeric", minute: "2-digit"
                      })}
                    </div>
                  </div>
                </div>

                <div className="border-t border-white/5 pt-3">
                  <div className="text-white/50 text-[10px] uppercase mb-0.5">Razorpay ID</div>
                  <div className="font-mono text-xs text-white/70 truncate">{p.razorpay_payment_id || "-"}</div>
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
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Booking Ref</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Razorpay ID</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((p) => (
                <tr key={p.id} className="border-b border-white/5 hover:bg-white/5">
                  <td className="px-4 py-3 text-white/50">
                    {new Date(p.created_at).toLocaleString("en-IN", {
                      day: "numeric", month: "short", hour: "numeric", minute: "2-digit"
                    })}
                  </td>
                  <td className="px-4 py-3 font-mono font-bold text-white">{p.booking_ref}</td>
                  <td className="px-4 py-3 capitalize">{p.customer_name}</td>
                  <td className="px-4 py-3 text-white">{formatPrice(p.amount_paise)}</td>
                  <td className="px-4 py-3">
                    <span className={cn(
                      "inline-flex rounded-full px-2 py-0.5 text-xs font-medium",
                      p.status === "paid" ? "bg-truf-lime/10 text-truf-lime" :
                      p.status === "pending" ? "bg-amber-500/10 text-amber-400" :
                      p.status === "refunded" ? "bg-blue-500/10 text-blue-400" :
                      "bg-red-500/10 text-red-400"
                    )}>
                      {p.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-xs">
                    {p.razorpay_payment_id || <span className="text-white/30">-</span>}
                  </td>
                </tr>
              ))}
              {payments.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-white/50">
                    No payments found.
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
