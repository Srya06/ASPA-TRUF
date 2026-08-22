"use client";

import { useState, useEffect } from "react";
import QRCode from "react-qr-code";
import { generateUPIIntent, generateBookingRef, generatePaymentRef } from "@/lib/upi";
import { formatPrice } from "@/lib/utils";
import { ExternalLink } from "lucide-react";

interface UPIPaymentClientProps {
  amountPaise: number;
  onPaymentSubmitted: (utr: string) => void;
  loading?: boolean;
}

export function UPIPaymentClient({ amountPaise, onPaymentSubmitted, loading }: UPIPaymentClientProps) {
  const [upiUrl, setUpiUrl] = useState("");
  const [utr, setUtr] = useState("");
  const [error, setError] = useState("");
  
  const merchantVPA = process.env.NEXT_PUBLIC_TRUF_UPI_ID || "vishwaskinni1-2@oksbi";
  const merchantName = process.env.NEXT_PUBLIC_TRUF_MERCHANT_NAME || "TRUF";

  useEffect(() => {
    // Generate static reference for this session
    const bookingRef = generateBookingRef();
    const paymentRef = generatePaymentRef(bookingRef);
    const amountINR = amountPaise / 100;
    
    const intent = generateUPIIntent(
      merchantVPA,
      merchantName,
      amountINR,
      paymentRef
    );
    setUpiUrl(intent);
  }, [amountPaise, merchantVPA, merchantName]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!utr || utr.length !== 12 || !/^\d+$/.test(utr)) {
      setError("Please enter a valid 12-digit UTR number.");
      return;
    }
    setError("");
    onPaymentSubmitted(utr);
  };

  if (!upiUrl) return null;

  return (
    <div className="flex flex-col gap-8 w-full max-w-md mx-auto">
      {/* Mobile Deep Link */}
      <div className="md:hidden flex flex-col gap-3">
        <a 
          href={upiUrl}
          className="w-full flex items-center justify-center gap-2 rounded-xl bg-truf-lime py-4 text-center font-bold text-truf-dark transition-all hover:bg-truf-lime/90 active:scale-95"
        >
          PAY NOW <ExternalLink size={18} />
        </a>
        <p className="text-center text-xs text-white/50">
          Pay securely using your UPI app (GPay, PhonePe, Paytm, etc.)
        </p>
      </div>

      {/* Desktop OR divider */}
      <div className="md:hidden flex items-center gap-4">
        <div className="h-px flex-1 bg-white/10" />
        <span className="text-xs font-bold text-white/40 uppercase tracking-widest">OR</span>
        <div className="h-px flex-1 bg-white/10" />
      </div>

      {/* Desktop QR & Mobile Fallback */}
      <div className="flex flex-col items-center text-center gap-4">
        <h3 className="hidden md:block text-lg font-bold text-white">Scan to Pay</h3>
        <p className="hidden md:block text-sm text-white/60">Scan this QR code with any UPI app.</p>
        
        <div className="p-4 bg-white rounded-2xl flex items-center justify-center relative">
          <QRCode 
            value={upiUrl}
            size={180}
            bgColor="#ffffff"
            fgColor="#000000"
            level="H"
          />
        </div>
        
        <div className="font-mono text-truf-lime text-sm tracking-widest flex flex-col items-center justify-center">
          <span className="text-white/60 text-xs tracking-normal mb-1">Merchant UPI ID</span>
          {merchantVPA}
        </div>
      </div>

      <div className="h-px w-full border-t border-white/10" />

      {/* UTR Submission */}
      <div className="flex flex-col gap-4">
        <div>
          <h3 className="text-lg font-bold text-white mb-1">Did you complete the payment?</h3>
          <p className="text-sm text-white/60">Enter your 12-digit Bank UTR / Reference Number below to confirm your booking.</p>
        </div>
        
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <input 
              type="text"
              placeholder="e.g. 320145678912"
              maxLength={12}
              value={utr}
              onChange={(e) => setUtr(e.target.value.replace(/\D/g, ''))}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-white/30 focus:border-truf-lime focus:outline-none focus:ring-1 focus:ring-truf-lime font-mono tracking-widest transition-colors"
            />
            {error && <p className="mt-2 text-xs text-red-400 font-medium">{error}</p>}
          </div>

          <button 
            type="submit" 
            disabled={loading || utr.length !== 12}
            className="w-full rounded-xl bg-white/10 py-4 text-center font-bold text-white transition-all hover:bg-white/20 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Verifying..." : "Submit UTR"}
          </button>
        </form>
      </div>
    </div>
  );
}
