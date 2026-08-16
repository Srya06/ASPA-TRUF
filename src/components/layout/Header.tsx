import Link from "next/link";
import Image from "next/image";
import { auth } from "@/auth";
import { LogoutButton } from "@/components/auth/LogoutButton";

export async function Header() {
  const session = await auth();
  
  // If user has a name, get the first letter, otherwise use 'U'
  const initial = session?.user?.name ? session.user.name.charAt(0).toUpperCase() : 'U';
  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-truf-dark/80 backdrop-blur-xl">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="group flex items-center gap-2">
          <div className="relative h-16 w-16 overflow-hidden transition-transform group-hover:scale-105">
            <Image
              src="/logo.png"
              alt="APSA Logo"
              fill
              priority={true}
              sizes="(max-width: 768px) 100vw, 33vw"
              className="object-contain"
            />
          </div>
          <span className="text-xl font-bold tracking-tight text-white">
            APSA
          </span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          <a
            href="#sports"
            className="text-sm font-medium text-white/70 transition-colors hover:text-truf-lime"
          >
            Sports
          </a>
          <a
            href="#availability"
            className="text-sm font-medium text-white/70 transition-colors hover:text-truf-lime"
          >
            Availability
          </a>
        </nav>

        <div className="flex items-center gap-4">
          {session?.user ? (
            <div className="flex items-center gap-4">
              <Link
                href="/profile"
                className="flex items-center justify-center h-10 w-10 rounded-full bg-truf-lime text-truf-dark font-black text-lg transition-all hover:bg-truf-lime/90 hover:scale-105"
                aria-label="User Profile"
              >
                {initial}
              </Link>
              <LogoutButton />
            </div>
          ) : (
            <Link
              href="/login"
              className="rounded-full bg-truf-lime px-4 py-2 text-sm font-semibold text-truf-dark transition-all hover:bg-truf-lime/90 hover:shadow-lg hover:shadow-truf-lime/20"
            >
              Profile
            </Link>
          )}
          <Link
            href="#availability"
            className="rounded-full bg-truf-lime px-4 py-2 text-sm font-semibold text-truf-dark transition-all hover:bg-truf-lime/90 hover:shadow-lg hover:shadow-truf-lime/20"
          >
            Book Now
          </Link>
        </div>
      </div>
    </header>
  );
}
