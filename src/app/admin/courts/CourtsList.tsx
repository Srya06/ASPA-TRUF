"use client";

import { useState } from "react";
import { addCourt, toggleCourtStatus } from "@/lib/actions/admin-courts";
import { cn } from "@/lib/utils";

type Court = {
  id: string;
  name: string;
  slug: string;
  sport_name: string;
  capacity: number;
  is_active: boolean;
};

type Sport = {
  id: string;
  name: string;
};

export function CourtsList({ courts, sports, venueId }: { courts: Court[]; sports: Sport[]; venueId: string }) {
  const [isAdding, setIsAdding] = useState(false);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  async function handleToggle(id: string, currentStatus: boolean) {
    setLoadingId(id);
    await toggleCourtStatus(id, !currentStatus);
    setLoadingId(null);
  }

  async function handleAdd(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const slug = formData.get("slug") as string;
    const sportId = formData.get("sportId") as string;
    const capacity = parseInt(formData.get("capacity") as string, 10) || 0;
    
    if (name && slug && sportId) {
      setIsAdding(true);
      await addCourt(venueId, sportId, name, slug, capacity);
      setIsAdding(false);
      (e.target as HTMLFormElement).reset();
    }
  }

  return (
    <div className="space-y-6">
      {/* Mobile View: Stacked Cards */}
      <div className="md:hidden space-y-4">
        {courts.length === 0 ? (
          <div className="rounded-xl border border-white/5 bg-truf-card p-8 text-center text-white/50">
            No courts found.
          </div>
        ) : (
          courts.map((court) => (
            <div key={court.id} className="rounded-xl border border-white/5 bg-truf-card p-4 space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-bold text-white text-lg">{court.name}</div>
                  <div className="text-xs text-white/50 capitalize">{court.sport_name}</div>
                </div>
                <span className={cn(
                  "inline-flex rounded-full px-2 py-0.5 text-xs font-bold uppercase tracking-wider",
                  court.is_active ? "bg-truf-lime/10 text-truf-lime" : "bg-red-500/10 text-red-400"
                )}>
                  {court.is_active ? "Active" : "Inactive"}
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-xs border-t border-white/5 pt-3">
                <div>
                  <div className="text-white/50 mb-0.5">Slug</div>
                  <div className="text-white font-mono">{court.slug}</div>
                </div>
                <div>
                  <div className="text-white/50 mb-0.5">Capacity</div>
                  <div className="text-white font-medium">{court.capacity}</div>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => handleToggle(court.id, court.is_active)}
                  disabled={loadingId === court.id}
                  className="w-full rounded bg-white/5 py-2 text-xs font-bold text-white hover:bg-white/10 disabled:opacity-50 transition-colors"
                >
                  Toggle Status
                </button>
              </div>
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
              <th className="px-4 py-3">Slug</th>
              <th className="px-4 py-3">Capacity</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {courts.map((court) => (
              <tr key={court.id} className="border-b border-white/5 hover:bg-white/5">
                <td className="px-4 py-3 font-medium text-white capitalize">{court.sport_name}</td>
                <td className="px-4 py-3 font-bold text-white">{court.name}</td>
                <td className="px-4 py-3 font-mono">{court.slug}</td>
                <td className="px-4 py-3">{court.capacity}</td>
                <td className="px-4 py-3">
                  <span className={cn(
                    "inline-flex rounded-full px-2 py-0.5 text-xs font-medium",
                    court.is_active ? "bg-truf-lime/10 text-truf-lime" : "bg-red-500/10 text-red-400"
                  )}>
                    {court.is_active ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => handleToggle(court.id, court.is_active)}
                    disabled={loadingId === court.id}
                    className="rounded bg-white/10 px-3 py-1 text-xs font-medium text-white hover:bg-white/20 disabled:opacity-50"
                  >
                    Toggle Status
                  </button>
                </td>
              </tr>
            ))}
            {courts.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-white/50">
                  No courts found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add New Court Form */}
      <div className="rounded-xl border border-white/5 bg-truf-card p-4 md:p-6">
        <h3 className="mb-4 text-lg font-bold text-white">Add New Court</h3>
        <form onSubmit={handleAdd} className="grid gap-3 sm:grid-cols-2 md:grid-cols-5">
          <select
            name="sportId"
            required
            className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white outline-none focus:border-truf-lime appearance-none w-full"
          >
            <option value="">Select Sport...</option>
            {sports.map((s) => (
              <option key={s.id} value={s.id} className="bg-truf-dark">
                {s.name}
              </option>
            ))}
          </select>
          <input
            type="text"
            name="name"
            placeholder="Court Name (e.g. Court A)"
            required
            className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white placeholder-white/30 outline-none focus:border-truf-lime w-full"
          />
          <input
            type="text"
            name="slug"
            placeholder="Slug (e.g. court-a)"
            required
            className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white placeholder-white/30 outline-none focus:border-truf-lime w-full"
          />
          <input
            type="number"
            name="capacity"
            placeholder="Capacity (e.g. 14)"
            required
            className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white placeholder-white/30 outline-none focus:border-truf-lime w-full"
          />
          <button
            type="submit"
            disabled={isAdding}
            className="sm:col-span-2 md:col-span-1 rounded-lg bg-truf-lime px-4 py-2 font-bold text-truf-dark hover:bg-truf-lime/90 disabled:opacity-50 w-full"
          >
            {isAdding ? "Adding..." : "Add Court"}
          </button>
        </form>
      </div>
    </div>
  );
}
