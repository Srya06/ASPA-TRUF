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
      {/* Mobile View: Stacked Cards */}
      <div className="md:hidden space-y-4">
        {pricing.length === 0 ? (
          <div className="rounded-xl border border-white/5 bg-truf-card p-8 text-center text-white/50">
            No courts found to price.
          </div>
        ) : (
          pricing.map((p) => (
            <div key={p.court_id} className="rounded-xl border border-white/5 bg-truf-card p-4 space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-bold text-white text-lg">{p.court_name}</div>
                  <div className="text-xs text-white/50 capitalize">{p.sport_name}</div>
                </div>
              </div>

              {editId === p.court_id ? (
                <form onSubmit={(e) => handleUpdate(e, p.court_id)} className="flex flex-col gap-3 border-t border-white/5 pt-3">
                  <div className="flex flex-col gap-1">
                    <span className="text-white/50 text-xs">Base Price (,1)</span>
                    <input
                      type="number"
                      name="basePrice"
                      defaultValue={p.base_price_paise ? p.base_price_paise / 100 : ""}
                      required
                      className="w-full rounded border border-white/10 bg-white/5 px-3 py-2 text-white outline-none focus:border-truf-lime"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-white/50 text-xs">Peak Multiplier (e.g. 1.2)</span>
                    <input
                      type="number"
                      name="peakMultiplier"
                      step="0.1"
                      defaultValue={p.peak_multiplier || "1.0"}
                      required
                      className="w-full rounded border border-white/10 bg-white/5 px-3 py-2 text-white outline-none focus:border-truf-lime"
                    />
                  </div>
                  <div className="flex gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setEditId(null)}
                      className="flex-1 rounded bg-white/5 px-3 py-2 text-xs font-medium text-white hover:bg-white/10"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loadingId === p.court_id}
                      className="flex-1 rounded bg-truf-lime px-3 py-2 text-xs font-bold text-truf-dark hover:bg-truf-lime/90 disabled:opacity-50"
                    >
                      {loadingId === p.court_id ? "Saving..." : "Save"}
                    </button>
                  </div>
                </form>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-4 text-xs border-t border-white/5 pt-3">
                    <div>
                      <div className="text-white/50 mb-0.5">Base Price</div>
                      <div className="text-white font-medium">
                        {p.base_price_paise !== null ? formatPrice(p.base_price_paise) : <span className="text-white/30">Not set</span>}
                      </div>
                    </div>
                    <div>
                      <div className="text-white/50 mb-0.5">Peak Multiplier</div>
                      <div className="text-white font-medium">
                        {p.peak_multiplier !== null ? `${p.peak_multiplier}x` : <span className="text-white/30">Not set</span>}
                      </div>
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      onClick={() => setEditId(p.court_id)}
                      className="w-full rounded bg-white/5 py-2 text-xs font-bold text-white hover:bg-white/10 transition-colors"
                    >
                      Edit Pricing
                    </button>
                  </div>
                </>
              )}
            </div>
          ))
        )}
      </div>

      {/* Desktop View: Table */}
      <div className="hidden md:block rounded-xl border border-white/5 bg-truf-card overflow-x-auto">
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
