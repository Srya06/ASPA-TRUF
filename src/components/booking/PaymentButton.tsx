"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

interface PaymentButtonProps {
  slotId: string;
  userId: string;
  couponCode?: string;
}

export function PaymentButton({ slotId, userId, couponCode }: PaymentButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handlePayment = async () => {
    setLoading(true);
    let url = `/book/${slotId}/payment`;
    if (couponCode) {
      url += `?couponCode=${couponCode}`;
    }
    router.push(url);
  };

  return (
    <div className="flex flex-col gap-4">
      {error && <p className="text-sm text-red-400">{error}</p>}
      <button
        onClick={handlePayment}
        disabled={loading}
        className={cn(
          "w-full rounded-xl bg-truf-lime py-4 text-center font-bold text-truf-dark transition-all hover:bg-truf-lime/90 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
        )}
      >
        {loading ? "Processing..." : "Pay Now"}
      </button>
    </div>
  );
}
