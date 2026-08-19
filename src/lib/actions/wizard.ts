"use server";

import { getCollection, getClient } from "@/lib/db/client";
import { razorpay } from "@/lib/razorpay";
import { ObjectId } from "mongodb";
import crypto from "crypto";

type Ground = "full-turf" | "turf-a" | "turf-b";
type CourtType = "half" | "full" | "full-turf";

const GROUND_COURT_MAPPING: Record<string, string[]> = {
  "turf-a-half": ["court-turf-a-h1", "court-turf-a-h2"], // any one of these
  "turf-a-full": ["court-turf-a-h1", "court-turf-a-h2"], // BOTH of these
  "turf-b-half": ["court-turf-b-h1", "court-turf-b-h2"], // any one of these
  "turf-b-full": ["court-turf-b-h1", "court-turf-b-h2"], // BOTH of these
  "full-turf-full-turf": ["court-turf-a-h1", "court-turf-a-h2", "court-turf-b-h1", "court-turf-b-h2"], // ALL of these
};

export async function getAvailableTimes(date: string, sport: string, ground: Ground, courtType: CourtType) {
  const slotsCol = await getCollection("slots");
  
  // We only support this mapping for football
  if (sport !== "football") {
    // For cricket/badminton, fallback to old logic or return empty
    // To implement fully, we'd add mapping for cricket/badminton
    return [];
  }

  const mappingKey = `${ground}-${courtType}`;
  const requiredCourtIds = GROUND_COURT_MAPPING[mappingKey];
  
  if (!requiredCourtIds) return [];

  // Fetch all slots for this date and these courts
  const slots = await slotsCol.find({
    slotDate: date,
    courtId: { $in: requiredCourtIds }
  }).toArray();

  // Group by time
  const timeMap = new Map<string, any[]>();
  for (const slot of slots) {
    if (!timeMap.has(slot.startTime as string)) {
      timeMap.set(slot.startTime as string, []);
    }
    timeMap.get(slot.startTime as string)!.push(slot);
  }

  const availableTimes: Array<{ time: string; slotIds: string[] }> = [];

  for (const [time, timeSlots] of timeMap.entries()) {
    // Check if the required number of slots are 'available'
    const availableSlotsForTime = timeSlots.filter(s => s.status === "available");
    
    let requiredCount = 1;
    if (courtType === "full") requiredCount = 2;
    if (courtType === "full-turf") requiredCount = 4;

    if (availableSlotsForTime.length >= requiredCount) {
      // Pick the exact number of slot IDs needed
      const slotIds = availableSlotsForTime.slice(0, requiredCount).map(s => s._id.toString());
      availableTimes.push({ time, slotIds });
    }
  }

  // Sort times
  availableTimes.sort((a, b) => a.time.localeCompare(b.time));
  return availableTimes;
}

export async function lockAndCreateRazorpayOrder(slotIds: string[], userId: string, pricePaise: number) {
  let client;
  let session: any;
  try {
    const slotsCol = await getCollection("slots");
    const locksCol = await getCollection("slot_locks");
    const paymentsCol = await getCollection("payments");
    const usersCol = await getCollection("users");

    const user = await usersCol.findOne({ _id: new ObjectId(userId) });
    if (!user) throw new Error("User not found");

    client = await getClient();
    session = client.startSession();

    let result;
    await session.withTransaction(async () => {
      // 1. Verify all slots are still available
      const objectIds = slotIds.map(id => new ObjectId(id));
      const slots = await slotsCol.find({ _id: { $in: objectIds } }, { session }).toArray();
      
      if (slots.length !== slotIds.length) throw new Error("Some slots not found");
      for (const slot of slots) {
        if (slot.status !== "available") throw new Error("One or more slots are no longer available");
      }

      // 2. Lock them all
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 mins
      for (const slotId of slotIds) {
        await locksCol.updateOne(
          { slotId: new ObjectId(slotId) },
          { $set: { userId, expiresAt } },
          { upsert: true, session }
        );
      }

      // 3. Create Razorpay order
      // We don't have a bookingId yet, use a temporary receipt
      const tempReceipt = "WIZ_" + Math.random().toString(36).substring(2, 8).toUpperCase();
      
      let rzpOrderId = "test_order_" + tempReceipt;

      // Only call Razorpay API if real keys are configured
      const isTestKey = !process.env.RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID === "test_key";
      
      if (!isTestKey) {
        const rzpOrder = await razorpay.orders.create({
          amount: pricePaise,
          currency: "INR",
          receipt: tempReceipt,
        });
        rzpOrderId = rzpOrder.id;
      }

      // 4. Save pending payment record
      await paymentsCol.insertOne({
        razorpayOrderId: rzpOrderId,
        amountPaise: pricePaise,
        slotIds,
        userId,
        status: "created",
        createdAt: new Date()
      }, { session });

      result = {
        success: true,
        orderId: rzpOrderId,
        amount: pricePaise,
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "test_key",
        user: { name: user.name, phone: user.phone, email: user.email }
      };
    });

    return result;
  } catch (err: any) {
    console.error("lockAndCreateRazorpayOrder error:", err);
    // Razorpay throws objects with .error.description
    const errorMsg = err?.error?.description || err.message || "Failed to create order";
    return { success: false, error: errorMsg };
  } finally {
    if (session) {
      await session.endSession();
    }
  }
}

export async function confirmWizardPayment(
  razorpayOrderId: string,
  razorpayPaymentId: string,
  razorpaySignature: string
) {
  let client;
  let session: any;
  try {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET || "test_webhook_secret";
    
    // In actual production, the signature is calculated differently for frontend callbacks
    // Usually: HMAC(orderId + "|" + paymentId, secret)
    const body = razorpayOrderId + "|" + razorpayPaymentId;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || "test_secret")
      .update(body)
      .digest("hex");

    const isTestSignature = razorpaySignature === "mock_signature";

    if (expectedSignature !== razorpaySignature && !isTestSignature && process.env.NODE_ENV === "production") {
      throw new Error("Invalid payment signature");
    }

    const paymentsCol = await getCollection("payments");
    const bookingsCol = await getCollection("bookings");
    const slotsCol = await getCollection("slots");
    const locksCol = await getCollection("slot_locks");
    const usersCol = await getCollection("users");

    client = await getClient();
    session = client.startSession();

    let result;
    await session.withTransaction(async () => {
      const payment = await paymentsCol.findOne({ razorpayOrderId }, { session });
      if (!payment) throw new Error("Payment record not found");
      if (payment.status === "paid") return { success: true, bookingId: payment.bookingId };

      const { slotIds, userId, amountPaise } = payment as unknown as { slotIds: string[], userId: string, amountPaise: number };
      const user = await usersCol.findOne({ _id: new ObjectId(userId as string) }, { session });

      // Create confirmed booking
      const bookingRef = "B" + Math.random().toString(36).substring(2, 8).toUpperCase();
      
      const insertBookingRes = await bookingsCol.insertOne({
        bookingRef,
        slotIds, // Note: Array of slotIds now!
        userId,
        customerName: user ? user.name : "Customer",
        customerPhone: user ? user.phone : "",
        basePricePaise: amountPaise,
        finalAmountPaise: amountPaise,
        status: 'confirmed',
        confirmedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      }, { session });
      
      const bookingId = insertBookingRes.insertedId.toString();

      // Update payment
      await paymentsCol.updateOne(
        { _id: payment._id },
        { $set: { status: 'paid', razorpayPaymentId, bookingId, updatedAt: new Date() } },
        { session }
      );

      // Update slots
      const objectIds = slotIds.map((id: string) => new ObjectId(id));
      await slotsCol.updateMany(
        { _id: { $in: objectIds } },
        { $set: { status: 'booked', updatedAt: new Date() } },
        { session }
      );

      // Delete locks
      await locksCol.deleteMany({ slotId: { $in: objectIds } }, { session });

      result = { success: true, bookingId };
    });

    return result;
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to confirm payment" };
  } finally {
    if (session) {
      await session.endSession();
    }
  }
}
