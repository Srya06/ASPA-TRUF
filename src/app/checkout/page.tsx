import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/admin-auth";
import CheckoutForm from "./CheckoutForm";
import { getCollection } from "@/lib/db/client";
import { ObjectId } from "mongodb";
import { formatPrice, formatTime12h } from "@/lib/utils";
import { auth } from "@/auth";

export default async function CheckoutPage(props: {
  searchParams: Promise<{ slots?: string; price?: string; sport?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/checkout");
  }

  const searchParams = await props.searchParams;
  const slotIds = searchParams.slots ? searchParams.slots.split(",") : [];
  const pricePaise = searchParams.price ? parseInt(searchParams.price, 10) : 0;
  const sportSlug = searchParams.sport || "football";

  if (slotIds.length === 0 || pricePaise === 0) {
    redirect("/");
  }

  const slotsCol = await getCollection("slots");
  const objectIds = slotIds.map(id => new ObjectId(id));
  const slots = await slotsCol.find({ _id: { $in: objectIds } }).toArray();

  if (slots.length !== slotIds.length) {
    return (
      <main className="min-h-screen bg-truf-dark flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-truf-card rounded-3xl p-8 text-center shadow-2xl">
          <h1 className="text-xl text-white font-bold">Error</h1>
          <p className="text-white/60 mt-2">Some slots are no longer available.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-truf-dark py-24 sm:py-32">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-black text-white tracking-tight uppercase italic mb-8">Checkout</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Booking Summary */}
          <div className="bg-truf-darker rounded-3xl p-6 border border-white/5">
            <h2 className="text-xl font-bold text-white mb-6">Booking Summary</h2>
            <div className="space-y-4 mb-6">
              {slots.map(slot => (
                <div key={slot._id.toString()} className="flex justify-between items-center bg-white/5 p-4 rounded-xl">
                  <div>
                    <p className="text-white font-medium">{slot.courtId as string}</p>
                    <p className="text-sm text-white/50">{slot.slotDate as string} | {formatTime12h(slot.startTime as string)}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="border-t border-white/10 pt-4 flex justify-between items-center">
              <span className="text-white/60 font-medium">Total Amount</span>
              <span className="text-2xl font-black text-truf-lime">{formatPrice(pricePaise)}</span>
            </div>
          </div>

          {/* Payment & Upload Form (Client Component) */}
          <div className="bg-truf-card rounded-3xl p-6 shadow-2xl border border-white/10">
            <CheckoutForm 
              slotIds={slotIds} 
              pricePaise={pricePaise} 
              userId={session.user.id} 
              sportSlug={sportSlug}
            />
          </div>

        </div>
      </div>
    </main>
  );
}
