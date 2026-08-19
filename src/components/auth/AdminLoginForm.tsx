"use client";

import { useState } from "react";
import { adminLoginAction } from "@/lib/actions/admin";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

interface AdminLoginFormProps {
  callbackUrl?: string;
}

export function AdminLoginForm({ callbackUrl }: AdminLoginFormProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email.includes("@") || !password) {
      setError("Please enter valid credentials.");
      return;
    }
    setLoading(true);
    
    const formData = new FormData();
    formData.append("email", email);
    formData.append("password", password);
    
    const res = await adminLoginAction(formData);

    if (!res.success) {
      setError(res.error || "Invalid credentials. Please try again.");
      setLoading(false);
    } else {
      router.push(callbackUrl || "/admin");
      router.refresh();
    }
  };

  return (
    <div className="rounded-2xl border border-white/5 bg-truf-card p-8 shadow-2xl backdrop-blur-sm">
      <div className="mb-8 text-center">
        <h2 className="text-2xl font-black tracking-tight text-white">
          TURF Admin Portal
        </h2>
        <p className="mt-2 text-sm text-white/50">
          Enter your admin credentials to sign in.
        </p>
      </div>

      <form onSubmit={handleLogin} className="flex flex-col gap-4">
        <div>
          <label htmlFor="email" className="sr-only">
            Email Address
          </label>
          <input
            id="email"
            type="email"
            placeholder="admin@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-truf-dark/50 px-4 py-3 text-white placeholder-white/30 focus:border-truf-lime focus:outline-none focus:ring-1 focus:ring-truf-lime"
            disabled={loading}
          />
        </div>
        <div>
          <label htmlFor="password" className="sr-only">
            Password
          </label>
          <input
            id="password"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-truf-dark/50 px-4 py-3 text-white placeholder-white/30 focus:border-truf-lime focus:outline-none focus:ring-1 focus:ring-truf-lime"
            disabled={loading}
          />
        </div>
        {error && <p className="text-sm text-red-400 text-center">{error}</p>}
        <button
          type="submit"
          disabled={loading || !email || !password}
          className={cn(
            "w-full rounded-xl bg-truf-lime py-3 text-sm font-bold text-truf-dark transition-all hover:bg-truf-lime/90 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
          )}
        >
          {loading ? "Signing in..." : "Sign In"}
        </button>
      </form>
    </div>
  );
}
