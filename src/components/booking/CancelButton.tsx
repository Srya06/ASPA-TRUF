"use client";

import { useState } from "react";
import { cancelBooking } from "@/lib/actions/cancel";
import { cn } from "@/lib/utils";

interface CancelButtonProps {
  bookingId: string;
  userId: string;
}

export function CancelButton({ bookingId, userId }: CancelButtonProps) {
  const [loading, setLoading] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [error, setError] = useState("");

  const handleCancel = async () => {
    if (!confirmed) {
      setConfirmed(true);
      return;
    }
    setLoading(true);
    setError("");
    const res = await cancelBooking(bookingId, userId);
    if (!res || !res.success) {
      setError((res as any)?.error || "Cancellation failed");
      setConfirmed(false);
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col items-end gap-1">
      {confirmed && !loading && (
        <p className="text-xs text-red-400">Tap again to confirm cancellation</p>
      )}
      {error && <p className="text-xs text-red-400">{error}</p>}
      <button
        onClick={handleCancel}
        disabled={loading}
        className={cn(
          "rounded-lg px-3 py-1.5 text-xs font-medium transition-all active:scale-95 disabled:opacity-50",
          confirmed
            ? "bg-red-500 text-white hover:bg-red-600"
            : "border border-red-500/30 text-red-400 hover:bg-red-500/10"
        )}
      >
        {loading ? "Cancelling…" : confirmed ? "Confirm Cancel" : "Cancel Booking"}
      </button>
    </div>
  );
}
