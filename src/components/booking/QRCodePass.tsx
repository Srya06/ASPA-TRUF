"use client";

import QRCode from "react-qr-code";
import { formatTime12h } from "@/lib/utils";

interface QRCodePassProps {
  booking: {
    booking_ref: string;
    customer_name: string;
    sport_name: string;
    court_name: string;
    slot_date: string;
    start_time: string;
    end_time: string;
    venue_name: string;
  };
}

export function QRCodePass({ booking }: QRCodePassProps) {
  const dateStr = new Date(booking.slot_date).toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "short",
  });

  return (
    <div className="relative mx-auto w-full max-w-sm overflow-hidden rounded-3xl bg-white shadow-2xl">
      {/* Top half: QR Code */}
      <div className="flex flex-col items-center justify-center bg-white p-8">
        <h3 className="mb-6 text-xl font-black uppercase tracking-widest text-black">TRUF PASS</h3>
        <div className="rounded-xl border-4 border-black p-4">
          <QRCode
            value={booking.booking_ref}
            size={180}
            level="H"
            fgColor="#000000"
            bgColor="#ffffff"
          />
        </div>
        <p className="mt-4 font-mono text-sm tracking-widest text-black/50">
          {booking.booking_ref}
        </p>
      </div>

      {/* Ticket divider */}
      <div className="relative flex items-center bg-truf-dark px-4 py-2">
        <div className="absolute -left-4 h-8 w-8 rounded-full bg-truf-dark shadow-inner" />
        <div className="h-px w-full border-t-2 border-dashed border-white/20" />
        <div className="absolute -right-4 h-8 w-8 rounded-full bg-truf-dark shadow-inner" />
      </div>

      {/* Bottom half: Details */}
      <div className="bg-truf-dark px-8 py-8 text-white">
        <div className="mb-6">
          <p className="text-xs uppercase tracking-wider text-white/50">Player</p>
          <p className="font-bold">{booking.customer_name}</p>
        </div>
        
        <div className="grid grid-cols-2 gap-6">
          <div>
            <p className="text-xs uppercase tracking-wider text-white/50">Sport</p>
            <p className="font-bold capitalize">{booking.sport_name}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wider text-white/50">Court</p>
            <p className="font-bold">{booking.court_name}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wider text-white/50">Date</p>
            <p className="font-bold">{dateStr}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wider text-white/50">Time</p>
            <p className="font-bold">{formatTime12h(booking.start_time)}</p>
          </div>
        </div>

        <div className="mt-6 border-t border-white/10 pt-6">
          <p className="text-xs uppercase tracking-wider text-white/50">Venue</p>
          <p className="font-medium text-truf-lime">{booking.venue_name}</p>
        </div>
      </div>
    </div>
  );
}
