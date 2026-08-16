"use client";

import { useState } from "react";
import { formatTime12h, formatPrice, cn } from "@/lib/utils";
import { blockSlot, unblockSlot, updateSlotPrice } from "@/lib/actions/admin";
import type { AdminSlot } from "@/lib/queries/admin";

interface AdminCalendarProps {
  slots: AdminSlot[];
  view?: string;
}

export function AdminCalendar({ slots, view = "day" }: AdminCalendarProps) {
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleBlock = async (slotId: string, currentStatus: string) => {
    setLoadingId(slotId);
    if (currentStatus === "available") {
      await blockSlot(slotId);
    } else {
      // Force unblock for booked, locked, or blocked slots
      if (confirm(`This slot is currently ${currentStatus}. Force unblocking will make it available again. Are you sure?`)) {
        await unblockSlot(slotId);
      }
    }
    setLoadingId(null);
  };

  const handleEditPrice = async (slotId: string, currentPrice: number) => {
    const newPriceStr = prompt("Enter new price (in ₹):", (currentPrice / 100).toString());
    if (newPriceStr) {
      const newPrice = parseInt(newPriceStr, 10);
      if (!isNaN(newPrice) && newPrice >= 0) {
        setLoadingId(slotId);
        await updateSlotPrice(slotId, newPrice * 100);
        setLoadingId(null);
      }
    }
  };

  const isMultiDay = view === "week" || view === "month";

  return (
    <div className="overflow-x-auto rounded-xl border border-white/5 bg-truf-card p-4">
      <table className="w-full text-left text-sm text-white/70">
        <thead className="border-b border-white/5 text-white">
          <tr>
            {isMultiDay && <th className="px-4 py-3">Date</th>}
            <th className="px-4 py-3">Time</th>
            <th className="px-4 py-3">Court</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Customer</th>
            <th className="px-4 py-3">Price</th>
            <th className="px-4 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {slots.map((slot) => (
            <tr key={slot.id} className="border-b border-white/5 hover:bg-white/5">
              {isMultiDay && (
                <td className="px-4 py-3 text-white/50 whitespace-nowrap">
                  {new Date(slot.slot_date).toLocaleDateString("en-IN", {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                  })}
                </td>
              )}
              <td className="px-4 py-3 font-medium text-white whitespace-nowrap">
                {formatTime12h(slot.start_time)} - {formatTime12h(slot.end_time)}
              </td>
              <td className="px-4 py-3 capitalize">
                {slot.sport_slug} &middot; {slot.court_name}
              </td>
              <td className="px-4 py-3">
                <span className={cn(
                  "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
                  slot.status === "available" && "bg-truf-lime/10 text-truf-lime",
                  slot.status === "booked" && "bg-blue-500/10 text-blue-400",
                  slot.status === "locked" && "bg-amber-500/10 text-amber-400",
                  slot.status === "blocked" && "bg-red-500/10 text-red-400"
                )}>
                  {slot.status}
                </span>
              </td>
              <td className="px-4 py-3">
                {slot.customer_name ? (
                  <span className="text-white">{slot.customer_name}</span>
                ) : (
                  <span className="text-white/30">-</span>
                )}
              </td>
              <td className="px-4 py-3">
                {formatPrice(slot.price_paise)}
              </td>
              <td className="px-4 py-3 text-right">
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => handleEditPrice(slot.id, slot.price_paise)}
                    disabled={loadingId === slot.id || slot.status === 'booked'}
                    className="rounded bg-white/10 px-2 py-1 text-xs font-medium text-white hover:bg-white/20 disabled:opacity-50"
                  >
                    Edit Price
                  </button>
                  <button
                    onClick={() => handleBlock(slot.id, slot.status)}
                    disabled={loadingId === slot.id}
                    className={cn(
                      "rounded px-2 py-1 text-xs font-medium disabled:opacity-50",
                      slot.status !== "available" ? "bg-truf-lime/20 text-truf-lime hover:bg-truf-lime/30" : "bg-red-500/20 text-red-400 hover:bg-red-500/30"
                    )}
                  >
                    {slot.status !== "available" ? "Unblock" : "Block"}
                  </button>
                </div>
              </td>
            </tr>
          ))}
          {slots.length === 0 && (
            <tr>
              <td colSpan={isMultiDay ? 7 : 6} className="px-4 py-8 text-center text-white/50">
                No slots found for this period.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

