"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

interface OTPLoginFormProps {
  callbackUrl?: string;
  isAdminLogin?: boolean;
}

export function OTPLoginForm({ callbackUrl, isAdminLogin }: OTPLoginFormProps) {
  const router = useRouter();
  const [step, setStep] = useState<"email" | "otp">("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) {
        throw new Error("Failed to send OTP.");
      }

      setStep("otp");
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (otp.length < 6) {
      setError("Please enter the 6-digit OTP.");
      return;
    }
    setLoading(true);
    
    const res = await signIn("credentials", {
      redirect: false,
      email,
      otp,
    });

    if (res?.error) {
      setError("Invalid or expired OTP. Please try again.");
      setLoading(false);
    } else {
      router.push(callbackUrl || "/");
      router.refresh();
    }
  };

  return (
    <div className="rounded-2xl border border-white/5 bg-truf-card p-8 shadow-2xl backdrop-blur-sm">
      <div className="mb-8 text-center">
        <h2 className="text-2xl font-black tracking-tight text-white">
          {isAdminLogin ? "TRUF Admin Portal" : "Welcome to TRUF"}
        </h2>
        <p className="mt-2 text-sm text-white/50">
          {step === "email" 
            ? isAdminLogin 
              ? "Enter your admin email to sign in." 
              : "Enter your email address to sign in or create an account." 
            : `Enter the code sent to ${email}`}
        </p>
      </div>

      <AnimatePresence mode="wait">
        {step === "email" ? (
          <motion.form
            key="email-form"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            onSubmit={handleSendOTP}
            className="flex flex-col gap-4"
          >
            <div>
              <label htmlFor="email" className="sr-only">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-truf-dark/50 px-4 py-3 text-white placeholder-white/30 focus:border-truf-lime focus:outline-none focus:ring-1 focus:ring-truf-lime"
                disabled={loading}
              />
            </div>
            {error && <p className="text-sm text-red-400">{error}</p>}
            <button
              type="submit"
              disabled={loading || !email.includes("@")}
              className={cn(
                "w-full rounded-xl bg-truf-lime py-3 text-sm font-bold text-truf-dark transition-all hover:bg-truf-lime/90 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
              )}
            >
              {loading ? "Sending..." : "Send OTP"}
            </button>
          </motion.form>
        ) : (
          <motion.form
            key="otp-form"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            onSubmit={handleVerifyOTP}
            className="flex flex-col gap-4"
          >
            <div>
              <label htmlFor="otp" className="sr-only">
                OTP
              </label>
              <input
                id="otp"
                type="text"
                placeholder="6-digit OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                className="w-full rounded-xl border border-white/10 bg-truf-dark/50 px-4 py-3 text-center text-2xl tracking-widest text-white placeholder-white/30 focus:border-truf-lime focus:outline-none focus:ring-1 focus:ring-truf-lime"
                disabled={loading}
              />
            </div>
            {error && <p className="text-sm text-red-400 text-center">{error}</p>}
            <button
              type="submit"
              disabled={loading || otp.length < 6}
              className={cn(
                "w-full rounded-xl bg-truf-lime py-3 text-sm font-bold text-truf-dark transition-all hover:bg-truf-lime/90 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
              )}
            >
              {loading ? "Verifying..." : "Verify & Sign In"}
            </button>
            <button
              type="button"
              onClick={() => {
                setStep("email");
                setOtp("");
                setError("");
              }}
              className="mt-2 text-sm text-white/50 hover:text-white"
              disabled={loading}
            >
              Change email address
            </button>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}
