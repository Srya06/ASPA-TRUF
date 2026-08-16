import { getAdminSession } from "@/lib/admin-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { superAdminLogoutAction } from "@/lib/actions/admin";

export default async function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getAdminSession();

  if (!session || session.role !== "super_admin") {
    redirect("/super-admin-login");
  }

  return (
    <div className="min-h-screen bg-truf-dark">
      <header className="sticky top-0 z-50 border-b border-white/5 bg-truf-darker/95 px-6 py-4 backdrop-blur supports-[backdrop-filter]:bg-truf-darker/60">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/super-admin" className="text-xl font-black tracking-tight text-white">
              Super Admin Portal
            </Link>
          </div>
          <form action={superAdminLogoutAction}>
            <button
              type="submit"
              className="rounded-lg bg-red-500/10 px-4 py-2 text-sm font-medium text-red-400 hover:bg-red-500/20 transition-colors"
            >
              Sign Out
            </button>
          </form>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}
