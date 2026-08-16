"use client";

import { useState } from "react";
import { toggleReviewVisibility } from "@/lib/actions/admin-reviews";
import { cn } from "@/lib/utils";

type Review = {
  id: string;
  rating: number;
  comment: string | null;
  is_published: boolean;
  created_at: string;
  customer_name: string;
  sport_name: string;
};

export function ReviewsList({ reviews }: { reviews: Review[] }) {
  const [loadingId, setLoadingId] = useState<string | null>(null);

  async function handleToggle(id: string, currentStatus: boolean) {
    setLoadingId(id);
    await toggleReviewVisibility(id, !currentStatus);
    setLoadingId(null);
  }

  return (
    <div className="space-y-4">
      {reviews.map((r) => (
        <div key={r.id} className="rounded-xl border border-white/5 bg-truf-card p-6 flex flex-col md:flex-row gap-6 md:items-center justify-between">
          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-3">
              <div className="flex text-amber-400">
                {Array.from({ length: 5 }).map((_, i) => (
                  <svg key={i} className={cn("h-4 w-4", i < r.rating ? "text-amber-400" : "text-white/10")} fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <span className="text-sm font-medium text-white">{r.customer_name}</span>
              <span className="text-xs text-white/40">&middot; {r.sport_name}</span>
              <span className="text-xs text-white/40">&middot; {new Date(r.created_at).toLocaleDateString("en-IN")}</span>
            </div>
            {r.comment && (
              <p className="text-sm text-white/80">{r.comment}</p>
            )}
          </div>
          <div className="flex items-center gap-4">
            <span className={cn(
              "inline-flex rounded-full px-2 py-0.5 text-xs font-medium",
              r.is_published ? "bg-truf-lime/10 text-truf-lime" : "bg-red-500/10 text-red-400"
            )}>
              {r.is_published ? "Published" : "Hidden"}
            </span>
            <button
              onClick={() => handleToggle(r.id, r.is_published)}
              disabled={loadingId === r.id}
              className="rounded bg-white/10 px-3 py-1.5 text-xs font-medium text-white hover:bg-white/20 disabled:opacity-50"
            >
              {r.is_published ? "Hide" : "Publish"}
            </button>
          </div>
        </div>
      ))}
      {reviews.length === 0 && (
        <div className="rounded-xl border border-white/5 bg-truf-card p-12 text-center">
          <p className="text-white/50">No reviews found.</p>
        </div>
      )}
    </div>
  );
}
