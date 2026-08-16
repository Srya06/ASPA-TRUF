import { NextResponse } from "next/server";
import crypto from "crypto";
import { getClient, getCollection, isDatabaseConfigured } from "@/lib/db/client";
import { ObjectId } from "mongodb";

export async function POST(req: Request) {
  try {
    const textBody = await req.text();
    const signature = req.headers.get("x-razorpay-signature");

    if (!signature) {
      return NextResponse.json({ error: "Missing signature" }, { status: 400 });
    }

    const secret = process.env.RAZORPAY_WEBHOOK_SECRET || "test_webhook_secret";

    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(textBody)
      .digest("hex");

    if (expectedSignature !== signature) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    const event = JSON.parse(textBody);

    if (event.event === "order.paid") {
      const orderId = event.payload.order.entity.id;
      const paymentId = event.payload.payment.entity.id;

      if (!isDatabaseConfigured()) {
        return NextResponse.json({ error: "Database not configured" }, { status: 500 });
      }
      
      const paymentsCol = await getCollection("payments");
      const bookingsCol = await getCollection("bookings");
      const slotsCol = await getCollection("slots");
      const locksCol = await getCollection("slot_locks");
      const adminNotifCol = await getCollection("admin_notifications");

      const client = await getClient();
      const session = client.startSession();

      try {
        await session.withTransaction(async () => {
          const payment = await paymentsCol.findOne({ razorpayOrderId: orderId }, { session });
          if (!payment) {
            throw new Error("Payment record not found for order: " + orderId);
          }
          const bookingId = payment.bookingId as string;

          await paymentsCol.updateOne(
            { razorpayOrderId: orderId },
            { $set: { status: 'paid', razorpayPaymentId: paymentId, updatedAt: new Date() } },
            { session }
          );

          let queryBookingId: any = bookingId;
          if (ObjectId.isValid(bookingId) && typeof bookingId === 'string' && bookingId.length === 24) {
              queryBookingId = new ObjectId(bookingId);
          }

          const booking = await bookingsCol.findOneAndUpdate(
            { _id: queryBookingId },
            { $set: { status: 'confirmed', confirmedAt: new Date(), updatedAt: new Date() } },
            { session, returnDocument: 'after' }
          );

          if (!booking) {
             throw new Error("Booking not found");
          }

          const slotId = booking.slotId as string;

          let querySlotId: any = slotId;
          if (ObjectId.isValid(slotId) && typeof slotId === 'string' && slotId.length === 24) {
              querySlotId = new ObjectId(slotId);
          }

          await slotsCol.updateOne(
            { _id: querySlotId },
            { $set: { status: 'booked', updatedAt: new Date() } },
            { session }
          );

          await locksCol.deleteOne({ slotId: querySlotId }, { session });

          await adminNotifCol.insertOne({
            type: "booking_confirmed",
            title: "New Booking Confirmed",
            body: `Booking completed for slot ${slotId}`,
            bookingId: bookingId,
            createdAt: new Date(),
            isRead: false
          }, { session });
        });
      } catch (err) {
        console.error("Webhook processing error:", err);
        throw err;
      } finally {
        await session.endSession();
      }
    }

    return NextResponse.json({ status: "ok" });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
