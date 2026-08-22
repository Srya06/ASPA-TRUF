"use client";

import { useState } from "react";
import { submitManualBooking } from "@/lib/actions/booking";
import { UPIPaymentClient } from "@/components/booking/UPIPaymentClient";
import { useRouter } from "next/navigation";

interface CheckoutFormProps {
  slotIds: string[];
  pricePaise: number;
  userId: string;
  sportSlug: string;
}

export default function CheckoutForm({ slotIds, pricePaise, userId, sportSlug }: CheckoutFormProps) {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handlePaymentSubmitted = async (utr: string) => {
    if (!phoneNumber || phoneNumber.length < 10) {
      setError("Please enter a valid phone number so we can contact you.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await submitManualBooking(slotIds, userId, pricePaise, utr, sportSlug, phoneNumber);
      
      if (res?.success) {
        router.push(`/booking-success?bookingId=${res.bookingId}`);
      } else {
        setError(res?.error || "Failed to submit booking");
        setLoading(false);
      }
    } catch (err: any) {
      setError(err.message || "An error occurred");
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Phone Number Section */}
      <div>
        <h3 className="text-lg font-bold text-white mb-2">Contact Details</h3>
        <p className="text-sm text-white/60 mb-4">Please provide your phone number so the admin can reach you.</p>
        <input 
          type="tel"
          placeholder="Enter phone number"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          className="w-full bg-truf-dark/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-truf-lime transition-colors"
          required
        />
        {error && <p className="text-sm text-red-400 mt-2">{error}</p>}
      </div>

      <div className="h-px w-full border-t border-white/10 my-2" />

      <UPIPaymentClient 
        amountPaise={pricePaise} 
        onPaymentSubmitted={handlePaymentSubmitted} 
        loading={loading}
      />
    </div>
  );
}
