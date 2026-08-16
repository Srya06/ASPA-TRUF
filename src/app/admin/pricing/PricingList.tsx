"use client";

import { useState } from "react";
import { updatePricingRule } from "@/lib/actions/admin-pricing";
import { formatPrice } from "@/lib/utils";

type CourtPricing = {
  court_id: string;
  court_name: string;
  sport_name: string;
  base_price_paise: number | null;
  peak_multiplier: number | null;
};

export function PricingList({ pricing }: { pricing: CourtPricing[] }) {
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [editId, setEditId] = useState<string | null>(null);

  async function handleUpdate(e: React.FormEvent<HTMLFormElement>, courtId: string) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const basePriceStr = formData.get("basePrice") as string;
    const peakStr = formData.get("peakMultiplier") as string;
    
    if (basePriceStr && peakStr) {
      setLoadingId(courtId);
      await updatePricingRule(
        courtId, 
        parseInt(basePriceStr, 10) * 100, // convert to paise
        parseFloat(peakStr)
      );
      setLoadingId(null);
      setEditId(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-white/5 bg-truf-card p-4 overflow-x-auto">
        <table className="w-full text-left text-sm text-white/70">
          <thead className="border-b border-white/5 text-white">
            <tr>
              <th className="px-4 py-3">Sport</th>
              <th className="px-4 py-3">Court Name</th>
              <th className="px-4 py-3">Base Price</th>
              <th className="px-4 py-3">Peak Multiplier</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {pricing.map((p) => (
              <tr key={p.court_id} className="border-b border-white/5 hover:bg-white/5">
                <td className="px-4 py-3 font-medium text-white capitalize">{p.sport_name}</td>
                <td className="px-4 py-3 font-bold text-white">{p.court_name}</td>
                
                {editId === p.court_id ? (
                  <td colSpan={3} className="px-4 py-2">
                    <form onSubmit={(e) => handleUpdate(e, p.court_id)} className="flex items-center justify-end gap-3">
                      <div className="flex items-center gap-2">
                        <span className="text-white/50">₹</span>
                        <input
                          type="number"
                          name="basePrice"
                          defaultValue={p.base_price_paise ? p.base_price_paise / 100 : ""}
                          required
                          className="w-24 rounded border border-white/10 bg-white/5 px-2 py-1 text-white outline-none focus:border-truf-lime"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-white/50">×</span>
                        <input
                          type="number"
                          name="peakMultiplier"
                          step="0.1"
                          defaultValue={p.peak_multiplier || "1.0"}
                          required
                          className="w-20 rounded border border-white/10 bg-white/5 px-2 py-1 text-white outline-none focus:border-truf-lime"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => setEditId(null)}
                        className="rounded px-3 py-1 text-xs font-medium text-white/50 hover:text-white"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={loadingId === p.court_id}
                        className="rounded bg-truf-lime px-3 py-1 text-xs font-bold text-truf-dark hover:bg-truf-lime/90 disabled:opacity-50"
                      >
                        {loadingId === p.court_id ? "Saving..." : "Save"}
                      </button>
                    </form>
                  </td>
                ) : (
                  <>
                    <td className="px-4 py-3">
                      {p.base_price_paise !== null ? formatPrice(p.base_price_paise) : <span className="text-white/30">Not set</span>}
                    </td>
                    <td className="px-4 py-3">
                      {p.peak_multiplier !== null ? `${p.peak_multiplier}x` : <span className="text-white/30">Not set</span>}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => setEditId(p.court_id)}
                        className="rounded bg-white/10 px-3 py-1 text-xs font-medium text-white hover:bg-white/20"
                      >
                        Edit
                      </button>
                    </td>
                  </>
                )}
              </tr>
            ))}
            {pricing.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-white/50">
                  No courts found to price.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
