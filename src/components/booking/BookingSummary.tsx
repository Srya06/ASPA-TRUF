"use client";

import { useState } from "react";
import { formatPrice } from "@/lib/utils";
import { PaymentButton } from "./PaymentButton";
import { validateCoupon } from "@/lib/actions/booking";

interface BookingSummaryProps {
  basePrice: number;
  fees: number;
  tax: number;
  slotId: string;
  userId: string;
}

export function BookingSummary({ basePrice, fees, tax, slotId, userId }: BookingSummaryProps) {
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState("");
  const [discount, setDiscount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const total = basePrice + fees + tax - discount;

  const handleApplyCoupon = async () => {
    if (!couponCode) return;
    setLoading(true);
    setError("");

    const res = await validateCoupon(couponCode, basePrice);
    if (res.valid) {
      setDiscount(res.discountPaise || 0);
      setAppliedCoupon(couponCode);
      setError("");
    } else {
      setError(res.error || "Invalid coupon");
      setDiscount(0);
      setAppliedCoupon("");
    }
    setLoading(false);
  };

  const handleRemoveCoupon = () => {
    setCouponCode("");
    setAppliedCoupon("");
    setDiscount(0);
    setError("");
  };

  return (
    <div className="sticky top-8 rounded-2xl border border-white/5 bg-truf-card p-6">
      <h2 className="text-xl font-bold text-white mb-6">Price Summary</h2>
      
      <div className="space-y-4 text-sm">
        <div className="flex justify-between text-white/70">
          <span>Base Price</span>
          <span>{formatPrice(basePrice)}</span>
        </div>
        
        {/* Coupon Input */}
        <div className="py-2">
          {!appliedCoupon ? (
            <div className="flex gap-2">
              <input 
                type="text" 
                placeholder="Got a coupon code?" 
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                className="flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/30 focus:border-truf-lime focus:outline-none"
              />
              <button 
                onClick={handleApplyCoupon}
                disabled={loading || !couponCode}
                className="rounded-lg bg-white/10 px-4 py-2 font-medium text-white hover:bg-white/20 disabled:opacity-50"
              >
                Apply
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between rounded-lg border border-truf-lime/20 bg-truf-lime/10 px-3 py-2">
              <div>
                <span className="text-xs font-bold text-truf-lime uppercase">{appliedCoupon}</span>
                <span className="ml-2 text-xs text-white/70">Applied</span>
              </div>
              <button onClick={handleRemoveCoupon} className="text-xs text-white/50 hover:text-white">
                Remove
              </button>
            </div>
          )}
          {error && <p className="mt-2 text-xs text-red-400">{error}</p>}
        </div>

        {discount > 0 && (
          <div className="flex justify-between text-truf-lime">
            <span>Discount</span>
            <span>-{formatPrice(discount)}</span>
          </div>
        )}
        
        <div className="flex justify-between text-white/70">
          <span>Platform Fee</span>
          <span>{formatPrice(fees)}</span>
        </div>
        <div className="flex justify-between text-white/70">
          <span>Taxes</span>
          <span>{formatPrice(tax)}</span>
        </div>
        
        <div className="border-t border-white/10 pt-4 flex justify-between font-bold text-lg text-white">
          <span>Total Amount</span>
          <span className="text-truf-lime">{formatPrice(total)}</span>
        </div>
      </div>

      <div className="mt-8">
        <PaymentButton slotId={slotId} userId={userId} couponCode={appliedCoupon} />
      </div>
    </div>
  );
}
