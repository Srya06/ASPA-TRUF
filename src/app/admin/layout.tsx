import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/admin-auth";
import { NotificationProvider } from "@/components/admin/NotificationProvider";
import { AdminNav } from "@/components/admin/AdminNav";
import { AdminMobileNav } from "@/components/admin/AdminMobileNav";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getAdminSession();

  if (!session || (session.role !== "admin" && session.role !== "staff")) {
    redirect("/admin-login");
  }

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-truf-darker">
      {/* Mobile Top Navigation */}
      <div className="md:hidden z-50">
        <AdminMobileNav email={session.email as string} role={session.role as string} />
      </div>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 flex-shrink-0 border-r border-white/5 bg-truf-dark flex-col sticky top-0 h-screen overflow-y-auto">
        <AdminNav email={session.email as string} role={session.role as string} />
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        <NotificationProvider>
          {children}
        </NotificationProvider>
      </main>
    </div>
  );
}
