"use client";

import { useState } from "react";
import { SectionReveal } from "@/components/motion/SectionReveal";
import { cn, formatPrice, formatTime12h } from "@/lib/utils";
import type { AvailabilitySlot, SportSlug } from "@/types";
import { isSlotExpired, getTurfPricing } from "@/lib/pricing";
import { lockAndCreateRazorpayOrder, confirmWizardPayment } from "@/lib/actions/wizard";
import { SessionProvider, useSession } from "next-auth/react";

interface LiveAvailabilityProps {
  slots: AvailabilitySlot[];
  date: string;
  source: "database" | "fallback";
}

// Ensure Razorpay script is loaded
function loadRazorpay() {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

export function LiveAvailabilityContent({ slots, date, source }: LiveAvailabilityProps) {
  const { data: session } = useSession();
  
  // Group slots by Sport -> StartTime
  const groupedBySportAndTime = slots.reduce<
    Record<SportSlug, Record<string, AvailabilitySlot[]>>
  >((acc, slot) => {
    if (!acc[slot.sportSlug]) acc[slot.sportSlug] = {};
    if (!acc[slot.sportSlug][slot.startTime]) acc[slot.sportSlug][slot.startTime] = [];
    acc[slot.sportSlug][slot.startTime].push(slot);
    return acc;
  }, {});

  const [selectedSport, setSelectedSport] = useState<SportSlug | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleTimeClick = (sportSlug: SportSlug, time: string) => {
    if (selectedSport === sportSlug && selectedTime === time) {
      // Toggle off
      setSelectedSport(null);
      setSelectedTime(null);
    } else {
      setSelectedSport(sportSlug);
      setSelectedTime(time);
    }
  };

  const handleCheckout = async (selectedSlotIds: string[], pricePaise: number) => {
    if (!session?.user?.id) {
      window.location.href = "/login?callbackUrl=/";
      return;
    }
    
    setIsProcessing(true);
    try {
      const resLoaded = await loadRazorpay();
      if (!resLoaded) {
        alert("Failed to load Razorpay SDK. Check your connection.");
        setIsProcessing(false);
        return;
      }

      const userId = session.user.id;

      // 1. Lock and create order
      const orderRes = (await lockAndCreateRazorpayOrder(selectedSlotIds, userId, pricePaise)) as any;
      
      if (!orderRes.success) {
        alert(orderRes.error || "Failed to create order");
        setIsProcessing(false);
        return;
      }

      // 2. Open Razorpay
      const options = {
        key: orderRes.key,
        amount: orderRes.amount,
        currency: "INR",
        name: "APSA Sports Arena",
        description: "Turf Booking",
        order_id: orderRes.orderId,
        handler: async function (response: any) {
          try {
            // 3. Confirm Payment
            const confirmRes = (await confirmWizardPayment(
              response.razorpay_order_id,
              response.razorpay_payment_id,
              response.razorpay_signature
            )) as any;

            if (confirmRes.success) {
              window.location.href = `/bookings/${confirmRes.bookingId}`;
            } else {
              alert("Payment confirmation failed: " + confirmRes.error);
            }
          } catch (err) {
            console.error(err);
            alert("An error occurred during confirmation.");
          }
        },
        prefill: orderRes.user,
        theme: {
          color: "#b0fb16",
        },
        modal: {
          ondismiss: function () {
            setIsProcessing(false);
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", function (response: any) {
        alert("Payment Failed: " + response.error.description);
        setIsProcessing(false);
      });
      rzp.open();
    } catch (error) {
      console.error(error);
      setIsProcessing(false);
    }
  };

  return (
    <section id="availability" className="relative bg-truf-darker py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionReveal className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-truf-lime">
              Live Availability
            </p>
            <h2 className="mt-3 text-4xl font-black tracking-tight text-white sm:text-5xl">
              Today&apos;s slots
            </h2>
          </div>
        </SectionReveal>

        <div className="mt-12 space-y-10">
          {(Object.keys(groupedBySportAndTime) as SportSlug[]).map((slug, sectionIdx) => {
            const timeMap = groupedBySportAndTime[slug];
            const sortedTimes = Object.keys(timeMap).sort();

            return (
              <SectionReveal key={slug} delay={sectionIdx * 0.08}>
                <div className="rounded-2xl border border-white/5 bg-truf-card/50 p-6 backdrop-blur-sm">
                  <h3 className="mb-6 text-xl font-bold text-white capitalize">
                    {slug}
                  </h3>
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
                    {sortedTimes.map((time) => {
                      const timeSlots = timeMap[time];
                      
                      // Check if time has passed
                      const isExpired = isSlotExpired(timeSlots[0].slotDate, time);

                      // Available halves
                      const halfA = timeSlots.find((s) => s.courtName.includes("Half Court A") && s.status === "available");
                      const halfB = timeSlots.find((s) => s.courtName.includes("Half Court B") && s.status === "available");

                      const isAvailable = (!isExpired) && (halfA || halfB);
                      const isSelected = selectedSport === slug && selectedTime === time;

                      return (
                        <div key={time} className="relative">
                          <button
                            type="button"
                            disabled={!isAvailable}
                            onClick={() => handleTimeClick(slug, time)}
                            className={cn(
                              "w-full rounded-xl border px-3 py-3 text-center transition-all duration-200",
                              isAvailable
                                ? isSelected
                                  ? "bg-truf-lime border-truf-lime text-truf-dark"
                                  : "bg-truf-lime/10 border-truf-lime/30 text-truf-lime hover:bg-truf-lime/20"
                                : "bg-white/5 border-white/10 text-white/40 cursor-not-allowed"
                            )}
                          >
                            <span className="block text-lg font-semibold">{formatTime12h(time)}</span>
                            <span className="mt-1 block text-xs">
                              {isExpired ? "Expired" : isAvailable ? "Available" : "Booked"}
                            </span>
                          </button>

                          {/* Dropdown Options */}
                          {isSelected && isAvailable && (
                            <div className="absolute z-10 mt-2 w-[280px] rounded-xl border border-white/10 bg-[#1a1a1a] p-3 shadow-2xl">
                              <h4 className="mb-3 text-sm font-bold text-white/70">Select Configuration</h4>
                              
                              <div className="space-y-2">
                                {/* Volleyball is Full Court ONLY */}
                                {slug === "volleyball" && halfA && halfB && (
                                  <button
                                    onClick={() => {
                                      const p = getTurfPricing(parseInt(time.split(":")[0]), "full");
                                      handleCheckout([halfA.realSlotId!, halfB.realSlotId!], p.finalPricePaise);
                                    }}
                                    className="w-full rounded-lg bg-white/5 px-3 py-2 text-left hover:bg-white/10 transition flex justify-between items-center"
                                  >
                                    <span className="text-white text-sm font-medium">Full Court</span>
                                    <div className="flex flex-col items-end">
                                      <span className="text-truf-lime text-sm font-bold">₹{getTurfPricing(parseInt(time.split(":")[0]), "full").finalPricePaise / 100}</span>
                                    </div>
                                  </button>
                                )}

                                {/* Football & Cricket allow Half or Full */}
                                {slug !== "volleyball" && (
                                  <>
                                    {halfA && halfB && (
                                      <button
                                        onClick={() => {
                                          const p = getTurfPricing(parseInt(time.split(":")[0]), "full");
                                          handleCheckout([halfA.realSlotId!, halfB.realSlotId!], p.finalPricePaise);
                                        }}
                                        className="w-full rounded-lg bg-white/5 px-3 py-2 text-left hover:bg-white/10 transition flex justify-between items-center"
                                      >
                                        <span className="text-white text-sm font-medium">Full Court</span>
                                        <div className="flex flex-col items-end">
                                          <span className="text-truf-lime text-sm font-bold">₹{getTurfPricing(parseInt(time.split(":")[0]), "full").finalPricePaise / 100}</span>
                                        </div>
                                      </button>
                                    )}

                                    {halfA && (
                                      <button
                                        onClick={() => {
                                          const p = getTurfPricing(parseInt(time.split(":")[0]), "half");
                                          handleCheckout([halfA.realSlotId!], p.finalPricePaise);
                                        }}
                                        className="w-full rounded-lg bg-white/5 px-3 py-2 text-left hover:bg-white/10 transition flex justify-between items-center"
                                      >
                                        <span className="text-white text-sm font-medium">Half Court A</span>
                                        <div className="flex flex-col items-end">
                                          <span className="text-truf-lime text-sm font-bold">₹{getTurfPricing(parseInt(time.split(":")[0]), "half").finalPricePaise / 100}</span>
                                        </div>
                                      </button>
                                    )}

                                    {halfB && (
                                      <button
                                        onClick={() => {
                                          const p = getTurfPricing(parseInt(time.split(":")[0]), "half");
                                          handleCheckout([halfB.realSlotId!], p.finalPricePaise);
                                        }}
                                        className="w-full rounded-lg bg-white/5 px-3 py-2 text-left hover:bg-white/10 transition flex justify-between items-center"
                                      >
                                        <span className="text-white text-sm font-medium">Half Court B</span>
                                        <div className="flex flex-col items-end">
                                          <span className="text-truf-lime text-sm font-bold">₹{getTurfPricing(parseInt(time.split(":")[0]), "half").finalPricePaise / 100}</span>
                                        </div>
                                      </button>
                                    )}
                                  </>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </SectionReveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export function LiveAvailability(props: LiveAvailabilityProps) {
  return (
    <SessionProvider>
      <LiveAvailabilityContent {...props} />
    </SessionProvider>
  );
}
