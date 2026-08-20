"use client";

import { useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { GoogleAuthButton } from "./GoogleAuthButton";
import { Loader2 } from "lucide-react";

interface OTPLoginFormProps {
  callbackUrl?: string;
  isAdminLogin?: boolean;
}

export function OTPLoginForm({ callbackUrl, isAdminLogin }: OTPLoginFormProps) {
  const router = useRouter();
  const [step, setStep] = useState<"auth-options" | "otp">("auth-options");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  // Timer state
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes in seconds
  const [isTimerActive, setIsTimerActive] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isTimerActive && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsTimerActive(false);
    }
    return () => clearInterval(timer);
  }, [isTimerActive, timeLeft]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const handleSendOTP = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
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
        const data = await res.json();
        throw new Error(data.error || "Failed to send OTP.");
      }

      setStep("otp");
      setTimeLeft(300);
      setIsTimerActive(true);
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
    if (timeLeft === 0) {
      setError("OTP has expired. Please resend.");
      return;
    }
    setLoading(true);
    
    const res = await signIn("email-otp", {
      redirect: false,
      email,
      otp,
    });

    if (res?.error) {
      setError("Invalid or expired OTP. Please try again.");
      setLoading(false);
    } else {
      router.push(callbackUrl || "/profile");
      router.refresh();
    }
  };

  return (
    <div className="rounded-2xl border border-white/5 bg-truf-card p-8 shadow-2xl backdrop-blur-sm w-full max-w-md mx-auto">
      <div className="mb-8 text-center">
        <h2 className="text-2xl font-black tracking-tight text-white uppercase">
          {isAdminLogin ? "TURF Admin Portal" : "Welcome to TRUF"}
        </h2>
        <p className="mt-2 text-sm text-white/50">
          {step === "auth-options" 
            ? "Sign in to book your game." 
            : `We sent a verification code to ${email}`}
        </p>
      </div>

      <AnimatePresence mode="wait">
        {step === "auth-options" ? (
          <motion.div
            key="auth-options"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="flex flex-col gap-6"
          >
            {!isAdminLogin && (
              <>
                <GoogleAuthButton callbackUrl={callbackUrl} />
                
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-white/10" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-truf-card px-2 text-white/40">Or continue with Email</span>
                  </div>
                </div>
              </>
            )}

            <form onSubmit={handleSendOTP} className="flex flex-col gap-4">
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
                  className="w-full rounded-xl border border-white/10 bg-truf-dark/50 px-4 py-3 text-white placeholder-white/30 focus:border-truf-lime focus:outline-none focus:ring-1 focus:ring-truf-lime transition-colors"
                  disabled={loading}
                />
              </div>
              {error && <p className="text-sm text-red-400">{error}</p>}
              <button
                type="submit"
                disabled={loading || !email.includes("@")}
                className={cn(
                  "flex w-full items-center justify-center gap-2 rounded-xl bg-truf-lime py-3 text-sm font-bold text-truf-dark transition-all hover:bg-truf-lime/90 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
                )}
              >
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                {loading ? "Sending code..." : "Send OTP"}
              </button>
            </form>
          </motion.div>
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
                placeholder="000000"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                className="w-full rounded-xl border border-white/10 bg-truf-dark/50 px-4 py-3 text-center text-3xl tracking-[0.5em] text-white placeholder-white/10 focus:border-truf-lime focus:outline-none focus:ring-1 focus:ring-truf-lime font-mono transition-colors"
                disabled={loading}
              />
            </div>
            {error && <p className="text-sm text-red-400 text-center">{error}</p>}
            
            <div className="text-center mb-2">
              {timeLeft > 0 ? (
                <span className="text-sm text-white/60">
                  Code expires in <span className="font-mono text-truf-lime">{formatTime(timeLeft)}</span>
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => handleSendOTP()}
                  disabled={loading}
                  className="text-sm text-truf-lime hover:underline transition-all"
                >
                  Resend Code
                </button>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || otp.length < 6 || timeLeft === 0}
              className={cn(
                "flex w-full items-center justify-center gap-2 rounded-xl bg-truf-lime py-3 text-sm font-bold text-truf-dark transition-all hover:bg-truf-lime/90 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
              )}
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {loading ? "Verifying..." : "Verify & Sign In"}
            </button>
            <button
              type="button"
              onClick={() => {
                setStep("auth-options");
                setOtp("");
                setError("");
                setIsTimerActive(false);
              }}
              className="mt-2 text-sm text-white/50 hover:text-white transition-colors"
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
