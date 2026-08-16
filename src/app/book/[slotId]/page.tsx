import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getSlotDetails } from "@/lib/queries/slots";
import { BookingSummary } from "@/components/booking/BookingSummary";
import { formatPrice, formatTime12h } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function CheckoutPage(props: { params: Promise<{ slotId: string }> }) {
  const params = await props.params;
  const session = await auth();

  if (!session?.user?.id) {
    redirect(`/login?callbackUrl=/book/${params.slotId}`);
  }

  const slot = await getSlotDetails(params.slotId);
  
  if (!slot) {
    return (
      <main className="flex min-h-screen items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Slot not found</h1>
          <p className="mt-2 text-white/50">It may have been removed.</p>
        </div>
      </main>
    );
  }

  if (slot.status !== "available") {
    return (
      <main className="flex min-h-screen items-center justify-center p-4">
        <div className="text-center max-w-md rounded-xl border border-amber-500/20 bg-amber-500/10 p-8">
          <h1 className="text-2xl font-bold text-white">Slot Unavailable</h1>
          <p className="mt-2 text-amber-400">This slot is currently {slot.status.replace("_", " ")}.</p>
          <a href="/" className="mt-6 inline-block rounded-lg bg-white/10 px-6 py-2 font-medium text-white hover:bg-white/20">
            Back to Home
          </a>
        </div>
      </main>
    );
  }

  const basePrice = slot.price_paise;
  const fees = 0;
  const tax = 0;
  const total = basePrice + fees + tax;

  const dateStr = new Date(slot.slot_date).toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <main className="min-h-screen bg-truf-dark py-12 sm:py-24">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <a href="/" className="text-sm font-medium text-white/50 hover:text-white flex items-center gap-2 w-fit">
            &larr; Back
          </a>
          <h1 className="mt-4 text-3xl font-black tracking-tight text-white sm:text-4xl">
            Complete your booking
          </h1>
        </div>

        <div className="grid gap-8 lg:grid-cols-12">
          <div className="lg:col-span-7 space-y-6">
            
            <div className="rounded-2xl border border-white/5 bg-truf-card p-6">
              <h2 className="text-xl font-bold text-white">Slot Details</h2>
              <div className="mt-4 space-y-4">
                <div className="flex justify-between border-b border-white/5 pb-4">
                  <span className="text-white/50">Sport</span>
                  <span className="font-medium text-white capitalize">{slot.sport_name}</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-4">
                  <span className="text-white/50">Court</span>
                  <span className="font-medium text-white">{slot.court_name}</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-4">
                  <span className="text-white/50">Date</span>
                  <span className="font-medium text-white">{dateStr}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/50">Time</span>
                  <span className="font-medium text-white">
                    {formatTime12h(slot.start_time)} - {formatTime12h(slot.end_time)}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="rounded-2xl border border-white/5 bg-truf-card p-6">
              <h2 className="text-xl font-bold text-white">Player Details</h2>
              <div className="mt-4 space-y-2">
                <p className="text-white/80">{session.user.name || "Customer"}</p>
                <p className="text-white/50">{session.user.email}</p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5">
            <BookingSummary 
              basePrice={basePrice} 
              fees={fees} 
              tax={tax} 
              slotId={params.slotId} 
              userId={session.user.id} 
            />
          </div>
        </div>
      </div>
    </main>
  );
}
