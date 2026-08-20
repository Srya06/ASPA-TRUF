import { OTPLoginForm } from "@/components/auth/OTPLoginForm";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function LoginPage(props: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const searchParams = await props.searchParams;
  const session = await auth();

  if (session?.user) {
    redirect(searchParams.callbackUrl || "/profile");
  }

  return (
    <main className="flex min-h-screen bg-truf-dark">
      {/* Left side: Branding (Hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 lg:flex-col lg:justify-between border-r border-white/5 bg-[url('https://images.unsplash.com/photo-1579952363873-27f3bade9f55?q=80&w=1000&auto=format&fit=crop')] bg-cover bg-center p-12 relative">
        <div className="absolute inset-0 bg-truf-dark/80 backdrop-blur-sm z-0"></div>
        <div className="relative z-10">
          <h1 className="text-4xl font-black tracking-widest text-truf-lime uppercase">
            TRUF
          </h1>
        </div>
        <div className="relative z-10 max-w-lg">
          <h2 className="text-5xl font-black text-white uppercase leading-tight">
            Your Game.<br />
            <span className="text-truf-lime">Your Account.</span><br />
            Your Truf.
          </h2>
          <p className="mt-6 text-lg text-white/70">
            Join thousands of sports enthusiasts. Book your favorite turfs instantly, manage your games, and hit the field.
          </p>
        </div>
      </div>

      {/* Right side: Auth Card */}
      <div className="flex w-full items-center justify-center p-4 lg:w-1/2 lg:p-12 relative">
        {/* Mobile Logo */}
        <div className="absolute top-8 left-8 lg:hidden">
          <h1 className="text-2xl font-black tracking-widest text-truf-lime uppercase">
            TRUF
          </h1>
        </div>
        
        <div className="w-full max-w-md">
          <OTPLoginForm callbackUrl={searchParams.callbackUrl} />
        </div>
      </div>
    </main>
  );
}
