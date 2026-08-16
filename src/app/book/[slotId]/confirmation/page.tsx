import Link from "next/link";
import { auth } from "@/auth";
import { getSlotDetails } from "@/lib/queries/slots";

export const dynamic = "force-dynamic";

export default async function ConfirmationPage(props: { params: Promise<{ slotId: string }> }) {
  const params = await props.params;
  const session = await auth();

  const slot = await getSlotDetails(params.slotId);

  return (
    <main className="flex min-h-screen items-center justify-center bg-truf-dark p-4">
      <div className="text-center max-w-md rounded-2xl border border-white/5 bg-truf-card p-8 shadow-xl">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-truf-lime/20 mb-6">
          <svg className="h-8 w-8 text-truf-lime" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        
        <h1 className="text-3xl font-black text-white mb-2">Booking Submitted!</h1>
        <p className="text-white/60 mb-8">
          We have received your booking request and payment screenshot for {slot ? slot.sport_name : "the slot"}. 
          Your slot is currently pending verification. We will confirm your booking shortly.
        </p>

        <div className="flex flex-col gap-3">
          <Link 
            href="/" 
            className="w-full rounded-xl bg-truf-lime py-3 text-center font-bold text-truf-dark hover:bg-truf-lime/90 transition-colors"
          >
            Return to Home
          </Link>
          <Link 
            href="/profile" 
            className="w-full rounded-xl border border-white/10 bg-white/5 py-3 text-center font-semibold text-white hover:bg-white/10 transition-colors"
          >
            View My Bookings
          </Link>
        </div>
      </div>
    </main>
  );
}
