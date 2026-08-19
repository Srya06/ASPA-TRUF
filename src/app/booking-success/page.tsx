import Link from "next/link";
import { CheckCircle2 } from "lucide-react";

export default async function BookingSuccessPage(props: {
  searchParams: Promise<{ bookingId?: string }>;
}) {
  const searchParams = await props.searchParams;
  const bookingId = searchParams.bookingId;

  return (
    <main className="min-h-screen bg-truf-dark flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-truf-card border border-white/10 rounded-3xl p-8 text-center shadow-2xl">
        <div className="mx-auto w-20 h-20 bg-truf-lime/20 rounded-full flex items-center justify-center mb-6">
          <CheckCircle2 className="w-12 h-12 text-truf-lime" />
        </div>
        
        <h1 className="text-3xl font-black text-white tracking-tight uppercase italic mb-2">Booking Confirmed!</h1>
        <p className="text-white/60 mb-8">
          Your turf slot has been successfully booked. You can view your booking details in your profile.
        </p>

        {bookingId && (
          <div className="bg-black/30 rounded-xl p-4 mb-8 border border-white/5">
            <span className="text-xs uppercase tracking-widest text-white/40 block mb-1">Booking Reference</span>
            <span className="font-mono text-lg text-truf-lime font-bold">{bookingId}</span>
          </div>
        )}

        <div className="flex flex-col gap-3">
          <Link 
            href="/my-bookings" 
            className="w-full bg-truf-lime hover:bg-truf-lime/90 text-truf-dark font-bold py-3 rounded-xl transition-colors"
          >
            View My Bookings
          </Link>
          <Link 
            href="/" 
            className="w-full bg-white/5 hover:bg-white/10 text-white font-medium py-3 rounded-xl transition-colors border border-white/5"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </main>
  );
}
