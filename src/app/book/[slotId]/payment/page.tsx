import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getSlotDetails } from "@/lib/queries/slots";
import { validateCoupon } from "@/lib/actions/booking";
import { PaymentForm } from "./PaymentForm";
import { formatTime12h } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function PaymentPage(props: { 
  params: Promise<{ slotId: string }>,
  searchParams: Promise<{ couponCode?: string }>
}) {
  const params = await props.params;
  const searchParams = await props.searchParams;
  
  const session = await auth();

  if (!session?.user?.id) {
    redirect(`/login?callbackUrl=/book/${params.slotId}/payment`);
  }

  const slot = await getSlotDetails(params.slotId);
  
  if (!slot) {
    redirect("/");
  }

  const basePrice = slot.price_paise;
  let discount = 0;
  
  if (searchParams.couponCode) {
    const validRes = await validateCoupon(searchParams.couponCode, basePrice);
    if (validRes.valid && validRes.discountPaise) {
      discount = validRes.discountPaise;
    }
  }

  const finalAmount = basePrice - discount;

  const dateStr = new Date(slot.slot_date).toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <main className="min-h-screen bg-truf-dark py-12 sm:py-24">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <a href={`/book/${params.slotId}`} className="text-sm font-medium text-white/50 hover:text-white flex items-center gap-2 w-fit">
            &larr; Back to Booking
          </a>
          <h1 className="mt-4 text-3xl font-black tracking-tight text-white sm:text-4xl">
            Complete Payment
          </h1>
        </div>

        <div className="grid gap-8 lg:grid-cols-12">
          <div className="lg:col-span-5 space-y-6">
            <div className="rounded-2xl border border-white/5 bg-truf-card p-6">
              <h2 className="text-xl font-bold text-white">Summary</h2>
              <div className="mt-4 space-y-4">
                <div className="flex justify-between border-b border-white/5 pb-4">
                  <span className="text-white/50">Sport</span>
                  <span className="font-medium text-white capitalize">{slot.sport_name}</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-4">
                  <span className="text-white/50">Date</span>
                  <span className="font-medium text-white">{dateStr}</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-4">
                  <span className="text-white/50">Time</span>
                  <span className="font-medium text-white">
                    {formatTime12h(slot.start_time)} - {formatTime12h(slot.end_time)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7">
            <PaymentForm 
              slotId={params.slotId} 
              userId={session.user.id} 
              couponCode={searchParams.couponCode}
              finalAmount={finalAmount}
            />
          </div>
        </div>
      </div>
    </main>
  );
}
