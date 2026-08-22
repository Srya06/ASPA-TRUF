"use server";

import { ObjectId } from "mongodb";
import { getCollection } from "@/lib/db/client";
import { revalidatePath } from "next/cache";

export async function approveBooking(bookingId: string) {
  try {
    const bookingsCol = await getCollection("bookings");
    const id = new ObjectId(bookingId);

    const booking = await bookingsCol.findOne({ _id: id });
    if (!booking) {
      throw new Error("Booking not found");
    }

    const result = await bookingsCol.updateOne(
      { _id: id },
      { $set: { status: "confirmed", updatedAt: new Date(), confirmedAt: new Date() } }
    );

    // Block the associated slots now that the booking is confirmed
    const slotsCol = await getCollection("slots");
    const slotIds = (booking.slotIds as string[]) || (booking.slotId ? [booking.slotId as string] : []);
    
    if (slotIds.length > 0) {
      const objectIds = slotIds.map((sid: string) => {
        let querySlotId: any = sid;
        if (ObjectId.isValid(querySlotId) && typeof querySlotId === 'string' && querySlotId.length === 24) {
            querySlotId = new ObjectId(querySlotId);
        }
        return querySlotId;
      });
      
      await slotsCol.updateMany(
        { _id: { $in: objectIds } },
        { $set: { status: 'booked', updatedAt: new Date() } }
      );
    }

    if (result.matchedCount === 0) {
      throw new Error("Booking not found");
    }

    // Generate and send PDF Invoice
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;
    
    if (botToken && chatId) {
      try {
        const { generateInvoicePDF } = await import("@/lib/pdf/invoice");
        const { getSlotDetails } = await import("@/lib/queries/slots");
        
        const detailedSlots = await Promise.all(slotIds.map((id: string) => getSlotDetails(id)));
        const validSlots = detailedSlots.filter((s: any) => s !== null);
        
        const times = validSlots.map((s: any) => `${String(s.start_time)} - ${String(s.end_time)}`).join(", ");
        const dateStrs = [...new Set(validSlots.map((s: any) => new Date(String(s.slot_date)).toLocaleDateString("en-IN", {
          weekday: "short", day: "numeric", month: "short"
        })))].join(", ");

        const pdfBuffer = await generateInvoicePDF({
          bookingRef: String(booking.bookingRef),
          customerName: String(booking.customerName || "Customer"),
          customerPhone: String(booking.customerPhone || "N/A"),
          sportNames: String(booking.sportSlug || "SPORT").toUpperCase(),
          timeSlots: times,
          finalAmountPaise: Number(booking.finalAmountPaise || 0),
          dateStr: dateStrs
        });

        const formData = new FormData();
        formData.append('chat_id', chatId);
        formData.append('caption', `✅ Booking Approved!\nHere is the generated invoice for Booking Ref: ${booking.bookingRef}`);
        
        const blob = new Blob([new Uint8Array(pdfBuffer)], { type: 'application/pdf' });
        formData.append('document', blob, `Invoice_${booking.bookingRef}.pdf`);

        await fetch(`https://api.telegram.org/bot${botToken}/sendDocument`, {
          method: 'POST',
          body: formData
        });
      } catch (e) {
        console.error("Failed to generate/send PDF on approval:", e);
      }
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

    // Unblock the slots
    const slotIds = (booking.slotIds as string[]) || (booking.slotId ? [booking.slotId as string] : []);
    if (slotIds.length > 0) {
      const objectIds = slotIds.map((id: any) => {
        let querySlotId: any = id;
        if (ObjectId.isValid(querySlotId) && typeof querySlotId === 'string' && querySlotId.length === 24) {
            querySlotId = new ObjectId(querySlotId);
        }
        return querySlotId;
      });
      
      await slotsCol.updateMany(
        { _id: { $in: objectIds } },
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
