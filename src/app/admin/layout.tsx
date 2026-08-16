import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/admin-auth";
import { NotificationProvider } from "@/components/admin/NotificationProvider";
import { AdminNav } from "@/components/admin/AdminNav";

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
    <div className="flex min-h-screen bg-truf-darker">
      {/* Sidebar */}
      <aside className="w-64 flex-shrink-0 border-r border-white/5 bg-truf-dark flex flex-col">
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
