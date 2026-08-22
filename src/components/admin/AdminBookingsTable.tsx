"use client";

import { useState } from "react";
import { formatPrice, formatTime12h, cn } from "@/lib/utils";
import type { AdminBooking } from "@/lib/queries/admin-bookings";
import { approveBooking, rejectBooking } from "@/lib/actions/admin-bookings";

const statusStyles: Record<string, string> = {
  confirmed: "bg-truf-lime/10 text-truf-lime",
  pending_verification: "bg-yellow-500/10 text-yellow-400",
  cancelled: "bg-red-500/10 text-red-400",
  completed: "bg-blue-500/10 text-blue-400",
};

export function AdminBookingsTable({ bookings }: { bookings: AdminBooking[] }) {
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [modalImage, setModalImage] = useState<string | null>(null);

  const handleApprove = async (id: string) => {
    setLoadingId(id);
    await approveBooking(id);
    setLoadingId(null);
  };

  const handleReject = async (id: string) => {
    if (confirm("Are you sure you want to reject this booking and unblock the slot?")) {
      setLoadingId(id);
      await rejectBooking(id);
      setLoadingId(null);
    }
  };

  return (
    <>
      {/* Mobile View: Stacked Cards */}
      <div className="md:hidden space-y-4">
        {bookings.length === 0 ? (
          <div className="rounded-xl border border-white/5 bg-truf-card p-8 text-center text-white/50">
            No bookings yet.
          </div>
        ) : (
          bookings.map((b) => (
            <div key={b.id} className="rounded-xl border border-white/5 bg-truf-card p-4 space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-mono text-xs text-truf-lime mb-1">{b.booking_ref}</div>
                  <div className="font-bold text-white text-sm">{b.customer_name}</div>
                  <div className="text-xs text-white/50">{b.customer_phone || "N/A"}</div>
                </div>
                <span className={cn(
                  "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider",
                  statusStyles[b.status] || "bg-white/10 text-white/50"
                )}>
                  {b.status.replace("_", " ")}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <div className="text-white/50 mb-0.5">Sport / Court</div>
                  <div className="text-white font-medium capitalize">{b.sport_name}</div>
                  <div className="text-white/70">{b.court_name}</div>
                </div>
                <div>
                  <div className="text-white/50 mb-0.5">Date & Time</div>
                  <div className="text-white font-medium">
                    {new Date(b.slot_date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                  </div>
                  <div className="text-white/70">
                    {formatTime12h(b.start_time)} - {formatTime12h(b.end_time)}
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center border-t border-white/5 pt-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-white/50">UTR:</span>
                  {b.utr ? (
                    <span className="text-xs font-mono font-bold text-truf-lime">
                      {b.utr}
                    </span>
                  ) : (
                    <span className="text-xs text-white/20">None</span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-white/50">Total:</span>
                  <span className="font-bold text-truf-lime text-sm">
                    {formatPrice(b.final_amount_paise)}
                  </span>
                </div>
              </div>

              {b.status === "pending_verification" && (
                <div className="flex gap-2 pt-1 border-t border-white/5">
                  <button
                    disabled={loadingId === b.id}
                    onClick={() => handleReject(b.id)}
                    className="flex-1 rounded-lg bg-red-500/10 py-2.5 text-xs font-bold text-red-400 hover:bg-red-500/20 transition-colors disabled:opacity-50 mt-2"
                  >
                    {loadingId === b.id ? "..." : "Reject"}
                  </button>
                  <button
                    disabled={loadingId === b.id}
                    onClick={() => handleApprove(b.id)}
                    className="flex-1 rounded-lg bg-truf-lime/10 py-2.5 text-xs font-bold text-truf-lime hover:bg-truf-lime/20 transition-colors disabled:opacity-50 mt-2"
                  >
                    {loadingId === b.id ? "..." : "Approve"}
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Desktop View: Table */}
      <div className="hidden md:block overflow-x-auto rounded-xl border border-white/5 bg-truf-card">
        <table className="w-full text-left text-sm text-white/70">
          <thead className="border-b border-white/5 text-xs uppercase tracking-wider text-white/40">
            <tr>
              <th className="px-4 py-3">Ref</th>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Sport / Court</th>
              <th className="px-4 py-3">Date & Time</th>
              <th className="px-4 py-3">UTR</th>
              <th className="px-4 py-3">Amount</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((b) => (
              <tr key={b.id} className="border-b border-white/5 hover:bg-white/5">
                <td className="px-4 py-3">
                  <span className="font-mono text-xs text-truf-lime">{b.booking_ref}</span>
                </td>
                <td className="px-4 py-3">
                  <p className="font-medium text-white">{b.customer_name}</p>
                  <p className="text-xs text-white/40">{b.customer_phone || "N/A"}</p>
                </td>
                <td className="px-4 py-3 capitalize">
                  <p className="font-medium text-white">{b.sport_name}</p>
                  <p className="text-xs text-white/40">{b.court_name}</p>
                </td>
                <td className="px-4 py-3">
                  <p className="text-white">
                    {new Date(b.slot_date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                  </p>
                  <p className="text-xs text-white/40">
                    {formatTime12h(b.start_time)} – {formatTime12h(b.end_time)}
                  </p>
                </td>
                <td className="px-4 py-3">
                  {b.utr ? (
                    <span className="font-mono text-xs font-bold text-truf-lime bg-truf-lime/10 px-2 py-1 rounded">
                      {b.utr}
                    </span>
                  ) : (
                    <span className="text-xs text-white/20">None</span>
                  )}
                </td>
                <td className="px-4 py-3 font-medium text-white">
                  {formatPrice(b.final_amount_paise)}
                </td>
                <td className="px-4 py-3">
                  <span className={cn(
                    "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
                    statusStyles[b.status] || "bg-white/10 text-white/50"
                  )}>
                    {b.status.replace("_", " ")}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  {b.status === "pending_verification" && (
                    <div className="flex justify-end gap-2">
                      <button
                        disabled={loadingId === b.id}
                        onClick={() => handleApprove(b.id)}
                        className="rounded-md bg-truf-lime/20 px-3 py-1.5 text-xs font-bold text-truf-lime hover:bg-truf-lime/30 transition-colors disabled:opacity-50"
                      >
                        {loadingId === b.id ? "..." : "Approve"}
                      </button>
                      <button
                        disabled={loadingId === b.id}
                        onClick={() => handleReject(b.id)}
                        className="rounded-md bg-red-500/20 px-3 py-1.5 text-xs font-bold text-red-400 hover:bg-red-500/30 transition-colors disabled:opacity-50"
                      >
                        {loadingId === b.id ? "..." : "Reject"}
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
            {bookings.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-12 text-center text-white/40">
                  No bookings yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {modalImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4" onClick={() => setModalImage(null)}>
          <div className="relative max-h-[90vh] max-w-3xl rounded-xl bg-truf-dark p-2 border border-white/10 shadow-2xl">
            <button 
              className="absolute -right-4 -top-4 rounded-full bg-white text-black p-2 font-bold shadow-lg hover:scale-105 transition-transform"
              onClick={() => setModalImage(null)}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
            <img src={modalImage} alt="Payment Proof" className="max-h-[85vh] w-auto rounded-lg object-contain" onClick={(e) => e.stopPropagation()} />
          </div>
        </div>
      )}
    </>
  );
}
