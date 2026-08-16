import { AdminLoginForm } from "@/components/auth/AdminLoginForm";
import { getAdminSession } from "@/lib/admin-auth";
import { redirect } from "next/navigation";

export default async function AdminLoginPage(props: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const searchParams = await props.searchParams;
  const session = await getAdminSession();

  // Removed auto-redirect so the admin is forced to see the login page if they click the link.

  return (
    <main className="flex min-h-screen items-center justify-center bg-truf-darker p-4">
      <div className="w-full max-w-md">
        <AdminLoginForm 
          callbackUrl={searchParams.callbackUrl || "/admin"} 
        />
      </div>
    </main>
  );
}
