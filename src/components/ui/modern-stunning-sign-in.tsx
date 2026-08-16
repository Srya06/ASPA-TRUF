"use client" 

import * as React from "react"
import { signIn } from "next-auth/react"

interface SignIn1Props {
  callbackUrl?: string;
}

const SignIn1 = ({ callbackUrl }: SignIn1Props) => {
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [error, setError] = React.useState("");
  const [loading, setLoading] = React.useState(false);
 
  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };
 
  const handleSignIn = async () => {
    if (!name || !email || !phone) {
      setError("Please fill in all fields.");
      return;
    }
    if (!validateEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    if (phone.length < 10) {
      setError("Please enter a valid phone number.");
      return;
    }
    
    setError("");
    setLoading(true);

    try {
      const res = await signIn("customer", {
        name,
        email,
        phone,
        redirect: false,
      });

      if (res?.error) {
        setError("Sign in failed. Please try again.");
        setLoading(false);
      } else {
        window.location.href = callbackUrl || "/";
      }
    } catch (err) {
      setError("An unexpected error occurred.");
      setLoading(false);
    }
  };
 
  return (
    <div className="flex flex-col items-center justify-center relative overflow-hidden w-full rounded-xl">
      {/* Centered glass card */}
      <div className="relative z-10 w-full max-w-sm rounded-3xl bg-gradient-to-r from-white/10 to-transparent backdrop-blur-md border border-white/5 shadow-2xl p-8 flex flex-col items-center">
        {/* Logo */}
        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-truf-lime/20 mb-6 shadow-lg border border-truf-lime/30">
          <svg className="w-6 h-6 text-truf-lime" fill="none" viewBox="0 0 24 24" stroke="currentColor">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
        {/* Title */}
        <h2 className="text-2xl font-black tracking-widest text-white mb-6 text-center uppercase">
          APSA Sign In
        </h2>
        {/* Form */}
        <div className="flex flex-col w-full gap-4">
          <div className="w-full flex flex-col gap-3">
            <input
              placeholder="Full Name"
              type="text"
              value={name}
              className="w-full px-5 py-3 rounded-xl bg-white/10 text-white placeholder-white/40 text-sm focus:outline-none focus:ring-2 focus:ring-truf-lime border border-white/5 transition-all"
              onChange={(e) => setName(e.target.value)}
            />
            <input
              placeholder="Email Address"
              type="email"
              value={email}
              className="w-full px-5 py-3 rounded-xl bg-white/10 text-white placeholder-white/40 text-sm focus:outline-none focus:ring-2 focus:ring-truf-lime border border-white/5 transition-all"
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              placeholder="Phone Number (10 digits)"
              type="tel"
              value={phone}
              className="w-full px-5 py-3 rounded-xl bg-white/10 text-white placeholder-white/40 text-sm focus:outline-none focus:ring-2 focus:ring-truf-lime border border-white/5 transition-all"
              onChange={(e) => setPhone(e.target.value)}
            />
            {error && (
              <div className="text-sm font-medium text-red-400 text-left">{error}</div>
            )}
          </div>
          <hr className="opacity-10 border-white" />
          <div>
            <button
              onClick={handleSignIn}
              disabled={loading}
              className="w-full bg-truf-lime text-truf-dark font-bold px-5 py-3 rounded-full shadow-lg hover:brightness-110 transition disabled:opacity-50 text-sm tracking-wide"
            >
              {loading ? "Signing in..." : "Continue"}
            </button>
            <div className="w-full text-center mt-4">
              <span className="text-xs text-white/50">
                Your details are securely saved for your bookings.
              </span>
            </div>
          </div>
        </div>
      </div>
      {/* User count and avatars */}
      <div className="relative z-10 mt-12 flex flex-col items-center text-center">
        <p className="text-white/50 text-sm mb-3">
          Join <span className="font-bold text-truf-lime">thousands</span> of
          sports enthusiasts on APSA.
        </p>
        <div className="flex -space-x-3 mb-6">
          <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=64&h=64&fit=crop" alt="user" className="w-8 h-8 rounded-full border-2 border-truf-dark object-cover" />
          <img src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=64&h=64&fit=crop" alt="user" className="w-8 h-8 rounded-full border-2 border-truf-dark object-cover" />
          <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=64&h=64&fit=crop" alt="user" className="w-8 h-8 rounded-full border-2 border-truf-dark object-cover" />
          <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=64&h=64&fit=crop" alt="user" className="w-8 h-8 rounded-full border-2 border-truf-dark object-cover" />
        </div>
        
        <a href="/admin-login" className="mt-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-semibold text-white/50 transition-colors hover:bg-white/10 hover:text-white">
          Admin Login
        </a>
      </div>
    </div>
  );
};
 
export { SignIn1 };
