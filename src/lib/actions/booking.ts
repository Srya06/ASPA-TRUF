"use server";

import { getCollection, getClient, isDatabaseConfigured } from "@/lib/db/client";
import { getSlotDetails } from "@/lib/queries/slots";
import { ObjectId } from "mongodb";
import { revalidatePath } from "next/cache";

export async function submitManualBooking(
  slotIds: string[],
  userId: string,
  pricePaise: number,
  screenshotBase64: string,
  sportSlug: string
): Promise<{ success: boolean; bookingId?: string; error?: string }> {
  let client;
  let session: any;
  let result: { success: boolean; bookingId?: string; error?: string } = { success: false };
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

      // Trigger Telegram Notification
      const botToken = process.env.TELEGRAM_BOT_TOKEN;
      const chatId = process.env.TELEGRAM_CHAT_ID;
      
      if (botToken && chatId) {
        try {
          const courtNames = [...new Set(slots.map(s => s.court_name))].join(", ");
          const dateStrs = [...new Set(slots.map(s => new Date(s.slot_date).toLocaleDateString("en-IN", {
            weekday: "short", day: "numeric", month: "short"
          })))].join(", ");
          const times = slots.map(s => `${s.start_time} - ${s.end_time}`).join(", ");
          const finalAmount = pricePaise;

          const message = `🚨 *New Booking Alert!* 🚨\n\n` +
                          `*Booking Ref:* ${bookingRef}\n` +
                          `*Sport:* ${sportSlug.toUpperCase()}\n` +
                          `*Court:* ${courtNames}\n` +
                          `*Date:* ${dateStrs}\n` +
                          `*Time:* ${times}\n\n` +
                          `*Customer:* ${user.name || "Customer"}\n` +
                          `*Phone:* ${user.phone || "N/A"}\n\n` +
                          `*Amount:* ₹${(finalAmount / 100).toFixed(2)}\n` +
                          `*Status:* Pending Verification (Check Database for screenshot)`;

          fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              chat_id: chatId,
              text: message,
              parse_mode: "Markdown"
            })
          }).catch(console.error); // Fire and forget
        } catch (e) {
          console.error("Telegram notification setup failed:", e);
        }
      }

      result = { success: true, bookingId };
    });

    revalidatePath("/");
    revalidatePath("/admin/calendar");
    
    return (result || { success: false }) as { success: boolean; bookingId?: string; error?: string };
  } catch (err: any) {
    console.error("submitManualBooking error:", err);
    return { success: false, error: err.message || "Failed to submit booking" };
  } finally {
    if (session) {
      await session.endSession();
    }
  }
}




export async function validateCoupon(couponCode: string, basePricePaise: number) {
  try {
    if (!isDatabaseConfigured()) return { valid: false, error: "Database not configured" };
    
    const couponsCol = await getCollection("coupons");
    
    const coupon = await couponsCol.findOne({ 
      code: couponCode, 
      isActive: true,
      validFrom: { $lte: new Date() },
      $or: [ { validUntil: null }, { validUntil: { $gt: new Date() } } ],
      $and: [
         { $or: [ { usageLimit: null }, { $expr: { $lt: ["$usageCount", "$usageLimit"] } } ] }
      ]
    });

    if (!coupon) {
      return { valid: false, error: "Invalid or expired coupon" };
    }

    if (basePricePaise < (coupon.minOrderValuePaise as number)) {
      return { valid: false, error: `Minimum order value is Rs. ${(coupon.minOrderValuePaise as number) / 100}` };
    }

    let discountPaise = 0;
    if (coupon.discountType === "percentage") {
      discountPaise = Math.floor((basePricePaise * (coupon.discountValue as number)) / 100);
      if (coupon.maxDiscountPaise && discountPaise > (coupon.maxDiscountPaise as number)) {
        discountPaise = coupon.maxDiscountPaise as number;
      }
    } else {
      discountPaise = coupon.discountValue as number;
    }

    if (discountPaise > basePricePaise) {
      discountPaise = basePricePaise;
    }

    return { valid: true, discountPaise };
  } catch (err: any) {
    return { valid: false, error: err.message || "Failed to validate coupon" };
  }
}


