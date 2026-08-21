"use client";

import { useState } from "react";
import { submitManualBooking } from "@/lib/actions/booking";
import { QrCode, Upload } from "lucide-react";

interface CheckoutFormProps {
  slotIds: string[];
  pricePaise: number;
  userId: string;
  sportSlug: string;
}

export default function CheckoutForm({ slotIds, pricePaise, userId, sportSlug }: CheckoutFormProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (!selectedFile.type.startsWith("image/")) {
        setError("Please upload a valid image file.");
        return;
      }
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
      setError("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!phoneNumber || phoneNumber.length < 10) {
      setError("Please enter a valid phone number so we can contact you.");
      return;
    }

    if (!file) {
      setError("Please upload a screenshot of your transaction.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Convert file to base64
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result as string;
        
        const res = await submitManualBooking(slotIds, userId, pricePaise, base64String, sportSlug, phoneNumber);
        
        if (res?.success) {
          window.location.href = `/booking-success?bookingId=${res.bookingId}`;
        } else {
          setError(res?.error || "Failed to submit booking");
          setLoading(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      setError(err.message || "An error occurred");
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      
      {/* QR Code Section */}
      <div className="text-center">
        <h3 className="text-lg font-bold text-white mb-2">Scan & Pay</h3>
        <p className="text-sm text-white/60 mb-4">Scan this QR code with any UPI app to pay.</p>
        
        <div className="mx-auto w-48 h-48 bg-white rounded-2xl p-4 flex items-center justify-center mb-4 relative group">
          {/* Dummy QR placeholder - would be replaced by actual QR image */}
          <QrCode className="w-full h-full text-black/80" strokeWidth={1} />
        </div>
        
        <p className="font-mono text-truf-lime text-sm tracking-widest">apsa.turf@upi</p>
      </div>

      <div className="h-px w-full border-t border-white/10 my-2" />

      {/* Phone Number Section */}
      <div>
        <h3 className="text-lg font-bold text-white mb-2">Contact Details</h3>
        <p className="text-sm text-white/60 mb-4">Please provide your phone number so the admin can confirm your booking.</p>
        <input 
          type="tel"
          placeholder="Enter phone number"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          className="w-full bg-truf-dark/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-truf-lime transition-colors"
          required
        />
      </div>

      <div className="h-px w-full border-t border-white/10 my-2" />

      {/* Upload Section */}
      <div>
        <h3 className="text-lg font-bold text-white mb-2">Upload Transaction Proof</h3>
        <p className="text-sm text-white/60 mb-4">Attach a screenshot of your successful UPI payment.</p>
        
        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-white/10 border-dashed rounded-xl cursor-pointer hover:bg-white/5 transition bg-truf-dark/50 relative overflow-hidden">
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={preview} alt="Preview" className="absolute inset-0 w-full h-full object-cover opacity-60" />
          ) : (
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <Upload className="w-8 h-8 text-white/40 mb-2" />
              <p className="text-sm text-white/60"><span className="font-semibold text-truf-lime">Click to upload</span></p>
            </div>
          )}
          <input 
            type="file" 
            className="hidden" 
            accept="image/*"
            onChange={handleFileChange}
          />
        </label>
      </div>

      {error && <p className="text-sm text-red-400 text-center">{error}</p>}

      <button
        type="submit"
        disabled={loading || !file}
        className="w-full rounded-xl bg-truf-lime py-4 text-center font-bold text-truf-dark transition-all hover:bg-truf-lime/90 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 mt-2"
      >
        {loading ? "Submitting..." : "Submit Payment Proof"}
      </button>
    </form>
  );
}

// Force rebuild to clear client cache 08/19/2026 11:06:12
