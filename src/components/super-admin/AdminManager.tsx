"use client";

import { useState } from "react";
import { createAdminAction, deleteAdminAction } from "@/lib/actions/admin";
import { cn } from "@/lib/utils";

interface Admin {
  id: string;
  email: string;
  createdAt: string;
}

export function AdminManager({ initialAdmins }: { initialAdmins: Admin[] }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email.includes("@") || password.length < 6) {
      setError("Please enter a valid email and a password (min 6 chars).");
      return;
    }
    
    setLoading(true);
    const formData = new FormData();
    formData.append("email", email);
    formData.append("password", password);
    
    const res = await createAdminAction(formData);
    setLoading(false);

    if (!res.success) {
      setError(res.error || "Failed to create admin.");
    } else {
      setEmail("");
      setPassword("");
    }
  };

  const handleDeleteAdmin = async (id: string) => {
    if (!confirm("Are you sure you want to remove this admin?")) return;
    
    const res = await deleteAdminAction(id);
    if (!res.success) {
      alert("Failed to delete admin: " + res.error);
    }
  };

  return (
    <div className="grid gap-8 md:grid-cols-2">
      {/* List of Admins */}
      <div className="rounded-2xl border border-white/5 bg-truf-card p-6 shadow-xl backdrop-blur-sm">
        <h2 className="mb-4 text-xl font-bold text-white">Current Admins</h2>
        {initialAdmins.length === 0 ? (
          <p className="text-white/50 text-sm">No admins found.</p>
        ) : (
          <ul className="space-y-3">
            {initialAdmins.map((admin) => (
              <li key={admin.id} className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 p-4">
                <div>
                  <p className="font-semibold text-white">{admin.email}</p>
                  <p className="text-xs text-white/40">
                    Added: {new Date(admin.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <button
                  onClick={() => handleDeleteAdmin(admin.id)}
                  className="rounded-lg bg-red-500/10 px-3 py-1.5 text-xs font-medium text-red-400 hover:bg-red-500/20"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Add New Admin */}
      <div className="rounded-2xl border border-white/5 bg-truf-card p-6 shadow-xl backdrop-blur-sm h-fit">
        <h2 className="mb-4 text-xl font-bold text-white">Add New Admin</h2>
        <form onSubmit={handleAddAdmin} className="flex flex-col gap-4">
          <div>
            <label className="mb-1 block text-sm text-white/60">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@truf.in"
              className="w-full rounded-xl border border-white/10 bg-truf-dark/50 px-4 py-3 text-white placeholder-white/30 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
              disabled={loading}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-white/60">Password</label>
            <input
              type="text"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Min 6 characters"
              className="w-full rounded-xl border border-white/10 bg-truf-dark/50 px-4 py-3 text-white placeholder-white/30 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
              disabled={loading}
            />
          </div>
          {error && <p className="text-sm text-red-400">{error}</p>}
          <button
            type="submit"
            disabled={loading || !email || !password}
            className={cn(
              "mt-2 w-full rounded-xl bg-purple-600 py-3 text-sm font-bold text-white transition-all hover:bg-purple-700 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
            )}
          >
            {loading ? "Adding..." : "Add Admin"}
          </button>
        </form>
      </div>
    </div>
  );
}
