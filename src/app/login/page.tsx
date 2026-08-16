import { SignIn1 } from "@/components/ui/modern-stunning-sign-in";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function LoginPage(props: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const searchParams = await props.searchParams;
  const session = await auth();

  if (session?.user) {
    redirect(searchParams.callbackUrl || "/");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-truf-dark p-4">
      <div className="w-full max-w-md">
        <SignIn1 callbackUrl={searchParams.callbackUrl} />
      </div>
    </main>
  );
}
