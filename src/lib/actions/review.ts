"use server";

import { ObjectId } from "mongodb";
import { getCollection } from "@/lib/db/client";
import { revalidatePath } from "next/cache";

export async function submitReview(
  bookingId: string,
  userId: string,
  rating: number,
  comment: string
) {
  if (rating < 1 || rating > 5) {
    return { success: false, error: "Rating must be between 1 and 5" };
  }

  try {
    const bookingsCol = await getCollection("bookings");
    const slotsCol = await getCollection("slots");
    const courtsCol = await getCollection("courts");
    const reviewsCol = await getCollection("reviews");

    let queryBookingId: any = bookingId;
    if (ObjectId.isValid(bookingId) && typeof bookingId === 'string' && bookingId.length === 24) {
        queryBookingId = new ObjectId(bookingId);
    }

    const booking = await bookingsCol.findOne({ _id: queryBookingId, userId });
    
    if (!booking) {
      return { success: false, error: "Booking not found" };
    }

    if (booking.status !== "confirmed") {
      return { success: false, error: "You can only review confirmed bookings" };
    }

    let querySlotId: any = booking.slotId;
    if (ObjectId.isValid(querySlotId) && typeof querySlotId === 'string' && querySlotId.length === 24) {
        querySlotId = new ObjectId(querySlotId);
    }

    const slot = await slotsCol.findOne({ _id: querySlotId });
    if (!slot) return { success: false, error: "Slot not found" };

    const court = await courtsCol.findOne({ _id: slot.courtId as any });
    if (!court) return { success: false, error: "Court not found" };

    const slotDate = new Date(slot.slotDate as string);
    slotDate.setHours(23, 59, 59, 999);
    if (slotDate > new Date()) {
      return { success: false, error: "You can only review after your session has taken place" };
    }

    // Check for duplicate review
    const existing = await reviewsCol.findOne({ bookingId: queryBookingId.toString() });
    if (existing) {
      return { success: false, error: "You have already reviewed this booking" };
    }

    const sanitizedComment = comment.trim().slice(0, 1000);

    await reviewsCol.insertOne({
      bookingId: queryBookingId.toString(),
      userId,
      venueId: court.venueId as string,
      rating,
      comment: sanitizedComment || null,
      isPublished: true,
      createdAt: new Date()
    });

    revalidatePath("/reviews");
    revalidatePath("/my-bookings");

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
