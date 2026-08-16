"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { submitManualPayment } from "@/lib/actions/booking";
import { formatPrice } from "@/lib/utils";

interface PaymentFormProps {
  slotId: string;
  userId: string;
  couponCode?: string;
  finalAmount: number;
}

export function PaymentForm({ slotId, userId, couponCode, finalAmount }: PaymentFormProps) {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      if (selected.size > 5 * 1024 * 1024) {
        setError("File size must be less than 5MB");
        return;
      }
      setFile(selected);
      setError("");
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(selected);
    }
  };

  const handleSubmit = async () => {
    if (!preview) {
      setError("Please upload a payment screenshot");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await submitManualPayment(slotId, userId, couponCode, preview);
      if (!res || !res.success) {
        throw new Error(res?.error || "Payment submission failed");
      }
      
      router.push(`/book/${slotId}/confirmation`);
    } catch (err: any) {
      setError(err.message || "Something went wrong");
      setLoading(false);
    }
  };

  return (
    <div className="rounded-2xl border border-white/5 bg-truf-card p-6 md:p-8">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">Amount to Pay</h2>
        <div className="text-4xl font-black text-truf-lime">
          {formatPrice(finalAmount)}
        </div>
      </div>

      <div className="flex flex-col items-center justify-center mb-8">
        <div className="bg-white p-4 rounded-xl mb-4">
          {/* Placeholder QR Code - user can replace this with actual QR */}
          <div className="w-48 h-48 bg-gray-200 flex items-center justify-center text-gray-500 font-mono text-center p-4 border-4 border-dashed border-gray-400">
            APSA UPI QR CODE
            <br/><br/>
            (Replace public/qr.png)
          </div>
        </div>
        <p className="text-white/60 text-sm text-center max-w-sm">
          Scan the QR code using any UPI app (GPay, PhonePe, Paytm) to complete the payment.
        </p>
      </div>

      <div className="space-y-4">
        <label className="block text-sm font-medium text-white/80">
          Upload Payment Screenshot
        </label>
        
        <div 
          onClick={() => fileInputRef.current?.click()}
          className={`relative flex min-h-[120px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed transition-colors ${
            preview ? 'border-truf-lime/50 bg-truf-lime/5' : 'border-white/20 bg-white/5 hover:border-white/40 hover:bg-white/10'
          }`}
        >
          {preview ? (
            <div className="absolute inset-0 p-2 flex justify-center">
               <img src={preview} alt="Screenshot preview" className="h-full object-contain rounded-lg" />
            </div>
          ) : (
            <div className="text-center p-6">
              <svg className="mx-auto h-8 w-8 text-white/40 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              <p className="text-sm text-white/60">Click to upload screenshot</p>
              <p className="text-xs text-white/40 mt-1">PNG, JPG up to 5MB</p>
            </div>
          )}
          <input 
            ref={fileInputRef}
            type="file" 
            accept="image/*"
            className="hidden" 
            onChange={handleFileChange}
          />
        </div>
        
        {preview && (
          <button 
            onClick={() => { setFile(null); setPreview(null); }}
            className="text-sm text-red-400 hover:text-red-300 transition-colors"
          >
            Remove image
          </button>
        )}

        {error && <p className="text-sm text-red-400">{error}</p>}
        
        <button
          onClick={handleSubmit}
          disabled={loading || !preview}
          className="w-full mt-6 rounded-xl bg-truf-lime py-4 text-center font-bold text-truf-dark transition-all hover:bg-truf-lime/90 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Submitting..." : "Submit Payment"}
        </button>
      </div>
    </div>
  );
}
