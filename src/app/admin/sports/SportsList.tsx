"use client";

import { useState } from "react";
import { addSport, toggleSportStatus } from "@/lib/actions/admin-sports";
import { cn } from "@/lib/utils";

type Sport = {
  id: string;
  name: string;
  slug: string;
  display_order: number;
  is_active: boolean;
};

export function SportsList({ sports, venueId }: { sports: Sport[]; venueId: string }) {
  const [isAdding, setIsAdding] = useState(false);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  async function handleToggle(id: string, currentStatus: boolean) {
    setLoadingId(id);
    await toggleSportStatus(id, !currentStatus);
    setLoadingId(null);
  }

  async function handleAdd(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const slug = formData.get("slug") as string;
    const displayOrder = parseInt(formData.get("displayOrder") as string, 10) || 0;
    
    if (name && slug) {
      setIsAdding(true);
      await addSport(venueId, name, slug, displayOrder);
      setIsAdding(false);
      (e.target as HTMLFormElement).reset();
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-white/5 bg-truf-card p-4 overflow-x-auto">
        <table className="w-full text-left text-sm text-white/70">
          <thead className="border-b border-white/5 text-white">
            <tr>
              <th className="px-4 py-3">Order</th>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Slug</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {sports.map((sport) => (
              <tr key={sport.id} className="border-b border-white/5 hover:bg-white/5">
                <td className="px-4 py-3 font-medium text-white">{sport.display_order}</td>
                <td className="px-4 py-3 font-bold text-white capitalize">{sport.name}</td>
                <td className="px-4 py-3 font-mono">{sport.slug}</td>
                <td className="px-4 py-3">
                  <span className={cn(
                    "inline-flex rounded-full px-2 py-0.5 text-xs font-medium",
                    sport.is_active ? "bg-truf-lime/10 text-truf-lime" : "bg-red-500/10 text-red-400"
                  )}>
                    {sport.is_active ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => handleToggle(sport.id, sport.is_active)}
                    disabled={loadingId === sport.id}
                    className="rounded bg-white/10 px-3 py-1 text-xs font-medium text-white hover:bg-white/20 disabled:opacity-50"
                  >
                    Toggle Status
                  </button>
                </td>
              </tr>
            ))}
            {sports.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-white/50">
                  No sports found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add New Sport Form */}
      <div className="rounded-xl border border-white/5 bg-truf-card p-6">
        <h3 className="mb-4 text-lg font-bold text-white">Add New Sport</h3>
        <form onSubmit={handleAdd} className="grid gap-4 sm:grid-cols-4">
          <input
            type="text"
            name="name"
            placeholder="Sport Name (e.g. Football)"
            required
            className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white placeholder-white/30 outline-none focus:border-truf-lime"
          />
          <input
            type="text"
            name="slug"
            placeholder="Slug (e.g. football)"
            required
            className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white placeholder-white/30 outline-none focus:border-truf-lime"
          />
          <input
            type="number"
            name="displayOrder"
            placeholder="Display Order (0, 1, 2...)"
            required
            className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white placeholder-white/30 outline-none focus:border-truf-lime"
          />
          <button
            type="submit"
            disabled={isAdding}
            className="rounded-lg bg-truf-lime px-4 py-2 font-bold text-truf-dark hover:bg-truf-lime/90 disabled:opacity-50"
          >
            {isAdding ? "Adding..." : "Add Sport"}
          </button>
        </form>
      </div>
    </div>
  );
}
