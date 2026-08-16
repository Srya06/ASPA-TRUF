"use server";

import { ObjectId } from "mongodb";
import { getCollection, isDatabaseConfigured } from "@/lib/db/client";
import { revalidatePath } from "next/cache";
import { setAdminSession, clearAdminSession } from "@/lib/admin-auth";
import { redirect } from "next/navigation";

export async function blockSlot(slotId: string) {
  try {
    if (!isDatabaseConfigured()) throw new Error("Database not configured");
    const slotsCol = await getCollection("slots");
    
    let queryId: any = slotId;
    if (ObjectId.isValid(slotId) && typeof slotId === 'string' && slotId.length === 24) {
        queryId = new ObjectId(slotId);
    }
    
    const res = await slotsCol.updateOne(
      { _id: queryId, status: 'available' },
      { $set: { status: 'blocked', updatedAt: new Date() } }
    );

    if (res.modifiedCount === 0) {
      throw new Error("Slot is not available to block or doesn't exist");
    }

    revalidatePath("/admin/calendar");
    revalidatePath("/");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function unblockSlot(slotId: string) {
  try {
    if (!isDatabaseConfigured()) throw new Error("Database not configured");
    const slotsCol = await getCollection("slots");
    const locksCol = await getCollection("slot_locks");
    
    let queryId: any = slotId;
    if (ObjectId.isValid(slotId) && typeof slotId === 'string' && slotId.length === 24) {
        queryId = new ObjectId(slotId);
    }

    const res = await slotsCol.updateOne(
      { _id: queryId },
      { $set: { status: 'available', updatedAt: new Date() } }
    );

    await locksCol.deleteMany({ slotId: queryId });

    if (res.matchedCount === 0) {
      throw new Error("Slot doesn't exist");
    }

    revalidatePath("/admin/calendar");
    revalidatePath("/");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function updateSlotPrice(slotId: string, pricePaise: number) {
  try {
    if (!isDatabaseConfigured()) throw new Error("Database not configured");
    const slotsCol = await getCollection("slots");
    
    let queryId: any = slotId;
    if (ObjectId.isValid(slotId) && typeof slotId === 'string' && slotId.length === 24) {
        queryId = new ObjectId(slotId);
    }

    const res = await slotsCol.updateOne(
      { _id: queryId },
      { $set: { pricePaise: pricePaise, updatedAt: new Date() } }
    );

    revalidatePath("/admin/calendar");
    revalidatePath("/");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function adminLoginAction(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!isDatabaseConfigured()) {
    // Fallback if DB not configured
    if (email === "sryaraj06@gmail.com" && password === "1234567890@qwertyuiop") {
      await setAdminSession(email, "admin");
      return { success: true };
    }
    return { success: false, error: "Database not configured and invalid fallback credentials" };
  }

  const adminsCol = await getCollection("admins");
  const admin = await adminsCol.findOne({ email });

  if (admin && admin.password === password) {
    await setAdminSession(email, "admin");
    return { success: true };
  }

  return { success: false, error: "Invalid credentials" };
}

export async function superAdminLoginAction(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (email === "rajorajat@gmail.com" && password === "mnbvcxzlkjhgfdsa") {
    await setAdminSession(email, "super_admin");
    return { success: true };
  }

  return { success: false, error: "Invalid super admin credentials" };
}

export async function adminLogoutAction() {
  await clearAdminSession();
  redirect("/admin-login");
}

export async function superAdminLogoutAction() {
  await clearAdminSession();
  redirect("/super-admin-login");
}

// Super Admin Management Actions
export async function getAdminsAction() {
  if (!isDatabaseConfigured()) return [];
  const adminsCol = await getCollection("admins");
  const admins = await adminsCol.find({}).toArray();
  return admins.map(a => ({
    id: a._id.toString(),
    email: a.email as string,
    createdAt: (a.createdAt instanceof Date ? a.createdAt.toISOString() : String(a.createdAt))
  }));
}

export async function createAdminAction(formData: FormData) {
  try {
    if (!isDatabaseConfigured()) throw new Error("Database not configured");
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    if (!email || !password) throw new Error("Email and password required");

    const adminsCol = await getCollection("admins");
    
    const existing = await adminsCol.findOne({ email });
    if (existing) throw new Error("Admin with this email already exists");

    await adminsCol.insertOne({
      email,
      password, // Storing in plain text as requested for simplicity
      createdAt: new Date().toISOString()
    });

    revalidatePath("/super-admin");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function deleteAdminAction(adminId: string) {
  try {
    if (!isDatabaseConfigured()) throw new Error("Database not configured");
    
    let queryId: any = adminId;
    if (ObjectId.isValid(adminId) && typeof adminId === 'string' && adminId.length === 24) {
        queryId = new ObjectId(adminId);
    }

    const adminsCol = await getCollection("admins");
    await adminsCol.deleteOne({ _id: queryId });

    revalidatePath("/super-admin");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
