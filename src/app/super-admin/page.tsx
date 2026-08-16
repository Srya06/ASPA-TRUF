import { getAdminsAction } from "@/lib/actions/admin";
import { AdminManager } from "@/components/super-admin/AdminManager";

export default async function SuperAdminPage() {
  const admins = await getAdminsAction();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black text-white">Admin Management</h1>
        <p className="mt-2 text-white/60">
          Create, view, and remove normal admins who can manage bookings.
        </p>
      </div>

      <AdminManager initialAdmins={admins} />
    </div>
  );
}
