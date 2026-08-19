"use server";

import { getCollection, getClient } from "@/lib/db/client";
import { ObjectId } from "mongodb";
import { revalidatePath } from "next/cache";

export async function submitManualBooking(
  slotIds: string[],
  userId: string,
  pricePaise: number,
  screenshotBase64: string,
  sportSlug: string
) {
  let client;
  let session: any;
  try {
    const slotsCol = await getCollection("slots");
    const bookingsCol = await getCollection("bookings");
    const usersCol = await getCollection("users");

    client = await getClient();
    session = client.startSession();

    let result;
    await session.withTransaction(async () => {
      // 1. Verify user
      const user = await usersCol.findOne({ _id: new ObjectId(userId) }, { session });
      if (!user) throw new Error("User not found");

      // 2. Verify all slots are available
      const objectIds = slotIds.map(id => new ObjectId(id));
      const slots = await slotsCol.find({ _id: { $in: objectIds } }, { session }).toArray();
      
      if (slots.length !== slotIds.length) throw new Error("Some slots not found");
      for (const slot of slots) {
        if (slot.status !== "available") throw new Error("One or more slots are no longer available");
      }

      // We DO NOT mark slots as booked here. They remain available until the admin approves the payment.

      // 4. Create booking with 'pending' status
      const bookingRef = "M" + Math.random().toString(36).substring(2, 8).toUpperCase();
      
      const insertBookingRes = await bookingsCol.insertOne({
        bookingRef,
        slotIds,
        userId,
        sportSlug,
        customerName: user.name || "Customer",
        customerPhone: user.phone || "",
        basePricePaise: pricePaise,
        finalAmountPaise: pricePaise,
        status: 'pending_verification', // Pending manual verification
        screenshotBase64, // The uploaded payment proof
        createdAt: new Date(),
        updatedAt: new Date()
      }, { session });
      
      const bookingId = insertBookingRes.insertedId.toString();

      result = { success: true, bookingId };
    });

    revalidatePath("/");
    revalidatePath("/admin/calendar");
    
    return result;
  } catch (err: any) {
    console.error("submitManualBooking error:", err);
    return { success: false, error: err.message || "Failed to submit booking" };
  } finally {
    if (session) {
      await session.endSession();
    }
  }
}
