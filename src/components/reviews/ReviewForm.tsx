"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { submitReview } from "@/lib/actions/review";
import { cn } from "@/lib/utils";

interface ReviewFormProps {
  bookingId: string;
  userId: string;
  sportName: string;
  slotDate: string;
}

export function ReviewForm({ bookingId, userId, sportName, slotDate }: ReviewFormProps) {
  const router = useRouter();
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      setError("Please select a star rating.");
      return;
    }
    setLoading(true);
    setError("");
    const res = await submitReview(bookingId, userId, rating, comment);
    if (res.success) {
      router.push("/my-bookings");
      router.refresh();
    } else {
      setError(res.error || "Something went wrong");
      setLoading(false);
    }
  };

  const dateStr = new Date(slotDate).toLocaleDateString("en-IN", {
    day: "numeric", month: "long", year: "numeric",
  });

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div>
        <p className="text-sm text-white/50 mb-1">Session</p>
        <p className="font-bold text-white capitalize">{sportName} · {dateStr}</p>
      </div>

      {/* Star rating */}
      <div>
        <p className="text-sm font-medium text-white mb-3">How was your experience?</p>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHovered(star)}
              onMouseLeave={() => setHovered(0)}
              className="text-4xl transition-transform hover:scale-110 active:scale-95"
              aria-label={`${star} stars`}
            >
              <span className={cn(
                "transition-colors",
                star <= (hovered || rating) ? "text-truf-lime" : "text-white/20"
              )}>
                ★
              </span>
            </button>
          ))}
        </div>
        {rating > 0 && (
          <p className="mt-2 text-sm text-white/50">
            {["", "Poor", "Fair", "Good", "Great", "Excellent!"][rating]}
          </p>
        )}
      </div>

      {/* Comment */}
      <div>
        <label htmlFor="comment" className="block text-sm font-medium text-white mb-2">
          Tell us more <span className="text-white/40">(optional)</span>
        </label>
        <textarea
          id="comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          maxLength={1000}
          rows={4}
          placeholder="How was the court, facilities, staff…"
          className="w-full rounded-xl border border-white/10 bg-truf-dark/50 px-4 py-3 text-white placeholder-white/30 focus:border-truf-lime focus:outline-none focus:ring-1 focus:ring-truf-lime resize-none"
          disabled={loading}
        />
        <p className="mt-1 text-right text-xs text-white/30">{comment.length}/1000</p>
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}

      <button
        type="submit"
        disabled={loading || rating === 0}
        className="w-full rounded-xl bg-truf-lime py-3 font-bold text-truf-dark transition-all hover:bg-truf-lime/90 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? "Submitting…" : "Submit Review"}
      </button>
    </form>
  );
}
