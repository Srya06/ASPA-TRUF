import { SuperAdminLoginForm } from "@/components/auth/SuperAdminLoginForm";

export default function SuperAdminLoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-truf-darker p-4">
      <div className="w-full max-w-md">
        <SuperAdminLoginForm />
      </div>
    </main>
  );
}
