"use server";

import { ObjectId } from "mongodb";
import { getClient, getCollection, isDatabaseConfigured } from "@/lib/db/client";
import { revalidatePath } from "next/cache";

export async function cancelBooking(bookingId: string, userId: string) {
  let client;
  let session: any;
  
  try {
    if (!isDatabaseConfigured()) throw new Error("Database not configured");

    const bookingsCol = await getCollection("bookings");
    const slotsCol = await getCollection("slots");
    const adminNotifCol = await getCollection("admin_notifications");

    let queryBookingId: any = bookingId;
    if (ObjectId.isValid(bookingId) && typeof bookingId === 'string' && bookingId.length === 24) {
        queryBookingId = new ObjectId(bookingId);
    }

    client = await getClient();
    session = client.startSession();
    
    let result;
    await session.withTransaction(async () => {
      const booking = await bookingsCol.findOne({ _id: queryBookingId, userId }, { session });

      if (!booking) {
        throw new Error("Booking not found or does not belong to you");
      }

      if (booking.status !== "confirmed") {
        throw new Error("Only confirmed bookings can be cancelled");
      }

      let querySlotId: any = booking.slotId;
      if (ObjectId.isValid(querySlotId) && typeof querySlotId === 'string' && querySlotId.length === 24) {
          querySlotId = new ObjectId(querySlotId);
      }

      const slot = await slotsCol.findOne({ _id: querySlotId }, { session });
      if (!slot) {
         throw new Error("Slot not found");
      }

      const slotDate = new Date(slot.slotDate as string);
      slotDate.setHours(0, 0, 0, 0);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (slotDate <= today) {
        throw new Error("Cannot cancel a booking for today or a past date");
      }

      await bookingsCol.updateOne(
        { _id: queryBookingId },
        { $set: { status: 'cancelled', cancelledAt: new Date(), updatedAt: new Date() } },
        { session }
      );

      await slotsCol.updateOne(
        { _id: querySlotId },
        { $set: { status: 'available', updatedAt: new Date() } },
        { session }
      );

      await adminNotifCol.insertOne(
        {
           type: 'booking_cancelled',
           title: 'Booking Cancelled',
           body: `Booking ${bookingId} was cancelled by the customer`,
           bookingId: queryBookingId.toString(),
           createdAt: new Date(),
           isRead: false
        },
        { session }
      );
      
      result = { success: true };
    });

    revalidatePath("/my-bookings");
    revalidatePath("/admin/calendar");
    revalidatePath("/admin/bookings");
    revalidatePath("/");

    return result;
  } catch (err: any) {
    return { success: false, error: err.message };
  } finally {
    if (session) {
      await session.endSession();
    }
  }
}
