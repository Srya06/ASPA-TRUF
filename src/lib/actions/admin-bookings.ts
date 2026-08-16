"use server";

import { ObjectId } from "mongodb";
import { getCollection } from "@/lib/db/client";
import { revalidatePath } from "next/cache";

export async function approveBooking(bookingId: string) {
  try {
    const bookingsCol = await getCollection("bookings");
    const id = new ObjectId(bookingId);

    const result = await bookingsCol.updateOne(
      { _id: id },
      { $set: { status: "confirmed", updatedAt: new Date(), confirmedAt: new Date() } }
    );

    if (result.matchedCount === 0) {
      throw new Error("Booking not found");
    }

    revalidatePath("/admin/bookings");
    revalidatePath("/profile");

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to approve booking" };
  }
}

export async function rejectBooking(bookingId: string) {
  try {
    const bookingsCol = await getCollection("bookings");
    const slotsCol = await getCollection("slots");
    const id = new ObjectId(bookingId);

    const booking = await bookingsCol.findOne({ _id: id });
    if (!booking) {
      throw new Error("Booking not found");
    }

    // Cancel the booking
    await bookingsCol.updateOne(
      { _id: id },
      { $set: { status: "cancelled", updatedAt: new Date() } }
    );

    // Unblock the slot
    if (booking.slotId) {
      let querySlotId: any = booking.slotId;
      if (ObjectId.isValid(querySlotId) && typeof querySlotId === 'string' && querySlotId.length === 24) {
          querySlotId = new ObjectId(querySlotId);
      }
      await slotsCol.updateOne(
        { _id: querySlotId },
        { $set: { status: "available", updatedAt: new Date() } }
      );
    }

    revalidatePath("/admin/bookings");
    revalidatePath("/profile");
    revalidatePath("/");

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to reject booking" };
  }
}
