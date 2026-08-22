import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getMyBookings } from "@/lib/queries/my-bookings";
import { formatPrice, formatTime12h } from "@/lib/utils";
import { LogoutButton } from "@/components/auth/LogoutButton";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/profile");
  }

  const bookings = await getMyBookings(session.user.id);

  return (
    <main className="min-h-screen bg-truf-dark py-12 sm:py-24">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
          <div className="flex items-center gap-4">
            {session.user.image ? (
              <img src={session.user.image} alt={session.user.name || "User"} className="h-16 w-16 rounded-full border-2 border-truf-lime object-cover" />
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-truf-lime/20 border-2 border-truf-lime">
                <span className="text-xl font-bold text-truf-lime uppercase">
                  {(session.user.name?.[0] || session.user.email?.[0] || "U")}
                </span>
              </div>
            )}
            <div>
              <h1 className="text-2xl font-black tracking-tight text-white capitalize">
                {session.user.name || session.user.email.split('@')[0]}
              </h1>
              <p className="text-white/60 text-sm">{session.user.email}</p>
            </div>
          </div>
          <LogoutButton />
        </div>

        <div className="mb-6 flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
          <button className="whitespace-nowrap rounded-full bg-truf-lime px-4 py-2 text-sm font-bold text-truf-dark">My Bookings</button>
          <button className="whitespace-nowrap rounded-full bg-white/5 px-4 py-2 text-sm font-medium text-white hover:bg-white/10 transition-colors">Upcoming Games</button>
          <button className="whitespace-nowrap rounded-full bg-white/5 px-4 py-2 text-sm font-medium text-white hover:bg-white/10 transition-colors">Account Settings</button>
        </div>

        {bookings.length === 0 ? (
          <div className="rounded-2xl border border-white/5 bg-truf-card p-12 text-center mt-6">
            <h3 className="text-xl font-bold text-white mb-2">No bookings yet</h3>
            <p className="text-white/60 mb-6">You haven't made any bookings on TRUF.</p>
            <a href="/" className="inline-block rounded-xl bg-truf-lime px-6 py-3 font-bold text-truf-dark hover:bg-truf-lime/90 transition-colors">
              Explore Sports
            </a>
          </div>
        ) : (
          <div className="grid gap-6">
            {bookings.map((booking) => {
              const dateStr = new Date(booking.slot_date).toLocaleDateString("en-IN", {
                weekday: "long", day: "numeric", month: "long", year: "numeric"
              });

              return (
                <div key={booking.id} className="flex flex-col md:flex-row gap-6 rounded-2xl border border-white/5 bg-truf-card p-6">
                  <div className="flex-1 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center rounded-md bg-white/10 px-2 py-1 text-xs font-medium text-white ring-1 ring-inset ring-white/20">
                        {booking.booking_ref}
                      </span>
                      <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${
                        booking.status === 'confirmed' ? 'bg-green-400/10 text-green-400 ring-green-400/20' :
                        booking.status === 'pending_verification' ? 'bg-yellow-400/10 text-yellow-400 ring-yellow-400/20' :
                        'bg-red-400/10 text-red-400 ring-red-400/20'
                      }`}>
                        {booking.status === 'pending_verification' ? 'Pending Verification' : 
                         booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-2xl font-bold text-white capitalize">{booking.sport_name}</h3>
                      <p className="text-white/60">{booking.court_name}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="block text-white/40">Date</span>
                        <span className="font-medium text-white">{dateStr}</span>
                      </div>
                      <div>
                        <span className="block text-white/40">Time</span>
                        <span className="font-medium text-white">{formatTime12h(booking.start_time)} - {formatTime12h(booking.end_time)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col justify-between border-t border-white/5 pt-4 md:border-l md:border-t-0 md:pl-6 md:pt-0 min-w-[200px]">
                    <div>
                      <span className="block text-sm text-white/40">Amount Paid</span>
                      <span className="text-2xl font-black text-truf-lime">
                        {formatPrice(booking.final_amount_paise)}
                      </span>
                    </div>

                    <div className="mt-4 space-y-4">
                      {booking.status === 'pending_verification' && (
                        <p className="text-xs text-white/40">Your payment screenshot is currently under review by our team.</p>
                      )}
                      
                      {booking.screenshot_base64 && (
                        <div className="mt-2">
                          <span className="block text-xs text-white/40 mb-2">Attached Screenshot:</span>
                          <a href={booking.screenshot_base64} target="_blank" rel="noopener noreferrer">
                            <img 
                              src={booking.screenshot_base64} 
                              alt="Payment Screenshot" 
                              className="h-20 w-auto rounded-md border border-white/10 object-cover hover:opacity-80 transition-opacity"
                            />
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Admin Portal Access */}
        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col items-center gap-4">
          <p className="text-sm text-white/40">Authorized personnel only</p>
          <a href="/admin" className="flex items-center gap-2 rounded-xl bg-white/5 px-8 py-3 font-bold text-white transition-colors hover:bg-white/10 hover:text-truf-lime">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            Admin Portal Access
          </a>
        </div>
      </div>
    </main>
  );
}
