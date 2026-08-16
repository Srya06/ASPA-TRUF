"use server";

import { ObjectId } from "mongodb";
import { getCollection, getClient, isDatabaseConfigured } from "@/lib/db/client";
import { razorpay } from "@/lib/razorpay";
import { getSlotDetails } from "@/lib/queries/slots";


export async function createBooking(slotId: string, userId: string, couponCode?: string) {
  let client;
  let session: any;
  try {
    const slot = await getSlotDetails(slotId);
    if (!slot) throw new Error("Slot not found");

    if (!isDatabaseConfigured()) {
      const basePrice = slot.price_paise;
      return {
        success: true,
        orderId: "demo_order_" + Date.now(),
        amount: basePrice,
        key: "demo_key",
        bookingId: "demo_booking_" + Date.now(),
        user: { name: "Demo User", phone: "" },
      };
    }

    const usersCol = await getCollection("users");
    const locksCol = await getCollection("slot_locks");
    const couponsCol = await getCollection("coupons");
    const bookingsCol = await getCollection("bookings");
    const userCouponsCol = await getCollection("user_coupons");
    const paymentsCol = await getCollection("payments");

    let querySlotId: any = slotId;
    if (ObjectId.isValid(slotId) && typeof slotId === 'string' && slotId.length === 24) {
        querySlotId = new ObjectId(slotId);
    }

    const user = await usersCol.findOne({ _id: new ObjectId(userId) });
    if (!user) throw new Error("User not found");

    const basePrice = slot.price_paise;
    const fees = 0;
    const tax = 0;

    client = await getClient();
    session = client.startSession();
    
    let result;
    await session.withTransaction(async () => {
      const lockRes = await locksCol.findOne({ slotId: querySlotId, userId }, { session });
      if (!lockRes) throw new Error("No active lock found for this slot");
      if ((lockRes.expiresAt as Date) < new Date()) throw new Error("Slot lock has expired");

      let discountPaise = 0;
      let couponId = null;

      if (couponCode) {
        const coupon = await couponsCol.findOne({ 
          code: couponCode, 
          isActive: true,
          validFrom: { $lte: new Date() },
          $or: [ { validUntil: null }, { validUntil: { $gt: new Date() } } ],
          $and: [
             { $or: [ { usageLimit: null }, { $expr: { $lt: ["$usageCount", "$usageLimit"] } } ] }
          ]
        }, { session });

        if (!coupon) {
          throw new Error("Invalid or expired coupon code");
        }

        if (basePrice < (coupon.minOrderValuePaise as number)) {
          throw new Error(`Minimum order value for this coupon is Rs. ${(coupon.minOrderValuePaise as number) / 100}`);
        }

        if (coupon.discountType === "percentage") {
          discountPaise = Math.floor((basePrice * (coupon.discountValue as number)) / 100);
          if (coupon.maxDiscountPaise && discountPaise > (coupon.maxDiscountPaise as number)) {
            discountPaise = coupon.maxDiscountPaise as number;
          }
        } else if (coupon.discountType === "flat") {
          discountPaise = coupon.discountValue as number;
        }

        if (discountPaise > basePrice) {
          discountPaise = basePrice;
        }
        
        couponId = coupon._id;
      }

      const finalAmount = basePrice + fees + tax - discountPaise;
      const bookingRef = "B" + Math.random().toString(36).substring(2, 8).toUpperCase();
      
      const insertBookingRes = await bookingsCol.insertOne({
        bookingRef,
        slotId: querySlotId.toString(),
        userId,
        customerName: user.name || "Customer",
        customerPhone: user.phone || "",
        basePricePaise: basePrice,
        finalAmountPaise: finalAmount,
        couponId: couponId ? couponId.toString() : null,
        discountPaise,
        status: 'pending',
        createdAt: new Date(),
        updatedAt: new Date()
      }, { session });
      
      const bookingId = insertBookingRes.insertedId.toString();

      if (couponId) {
        await couponsCol.updateOne({ _id: couponId }, { $inc: { usageCount: 1 } as any }, { session });
        await userCouponsCol.insertOne({ userId, couponId: couponId.toString(), bookingId }, { session });
      }

      const rzpOrder = await razorpay.orders.create({
        amount: finalAmount,
        currency: "INR",
        receipt: bookingId,
      });

      await paymentsCol.insertOne({
        bookingId,
        razorpayOrderId: rzpOrder.id,
        amountPaise: finalAmount,
        createdAt: new Date()
      }, { session });

      result = { 
        success: true, 
        orderId: rzpOrder.id, 
        amount: finalAmount, 
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "test_key",
        bookingId,
        user: { name: user.name, phone: user.phone }
      };
    });

    return result;
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to create booking" };
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

export async function submitManualPayment(slotId: string, userId: string, couponCode?: string, screenshotBase64?: string) {
  let client;
  let session: any;
  try {
    const slot = await getSlotDetails(slotId);
    if (!slot) throw new Error("Slot not found");

    if (!screenshotBase64) {
      throw new Error("Payment screenshot is required.");
    }

    if (!isDatabaseConfigured()) {
      return { success: true, bookingId: "demo_booking_" + Date.now() };
    }

    const usersCol = await getCollection("users");
    const locksCol = await getCollection("slot_locks");
    const couponsCol = await getCollection("coupons");
    const bookingsCol = await getCollection("bookings");
    const userCouponsCol = await getCollection("user_coupons");
    const slotsCol = await getCollection("slots");

    let querySlotId: any = slotId;
    if (ObjectId.isValid(slotId) && typeof slotId === 'string' && slotId.length === 24) {
        querySlotId = new ObjectId(slotId);
    }

    let queryUserId: any = userId;
    if (ObjectId.isValid(userId) && typeof userId === 'string' && userId.length === 24) {
        queryUserId = new ObjectId(userId);
    }

    const user = await usersCol.findOne({ _id: queryUserId });
    if (!user) {
      // If user is not found, we still want to allow the booking for admins using credentials provider
      // who might not have an actual document in the users collection.
    }

    const basePrice = slot.price_paise;
    const fees = 0;
    const tax = 0;

    client = await getClient();
    session = client.startSession();
    
    let result;
    await session.withTransaction(async () => {
      // Check if the slot is still available at the moment of payment
      const freshSlot = await slotsCol.findOne({ _id: querySlotId }, { session });
      if (!freshSlot || freshSlot.status !== "available") {
        throw new Error("Sorry, this slot is no longer available.");
      }

      let discountPaise = 0;
      let couponId = null;

      if (couponCode) {
        const coupon = await couponsCol.findOne({ 
          code: couponCode, 
          isActive: true,
          validFrom: { $lte: new Date() },
          $or: [ { validUntil: null }, { validUntil: { $gt: new Date() } } ],
          $and: [
             { $or: [ { usageLimit: null }, { $expr: { $lt: ["$usageCount", "$usageLimit"] } } ] }
          ]
        }, { session });

        if (coupon) {
          if (basePrice >= (coupon.minOrderValuePaise as number)) {
            if (coupon.discountType === "percentage") {
              discountPaise = Math.floor((basePrice * (coupon.discountValue as number)) / 100);
              if (coupon.maxDiscountPaise && discountPaise > (coupon.maxDiscountPaise as number)) {
                discountPaise = coupon.maxDiscountPaise as number;
              }
            } else if (coupon.discountType === "flat") {
              discountPaise = coupon.discountValue as number;
            }

            if (discountPaise > basePrice) {
              discountPaise = basePrice;
            }
            
            couponId = coupon._id;
          }
        }
      }

      const finalAmount = basePrice + fees + tax - discountPaise;
      const bookingRef = "B" + Math.random().toString(36).substring(2, 8).toUpperCase();
      
      const insertBookingRes = await bookingsCol.insertOne({
        bookingRef,
        slotId: querySlotId.toString(),
        userId,
        customerName: user ? (user.name || "Customer") : "Admin User",
        customerPhone: user ? (user.phone || "") : "",
        basePricePaise: basePrice,
        finalAmountPaise: finalAmount,
        couponId: couponId ? couponId.toString() : null,
        discountPaise,
        status: 'pending_verification',
        screenshotBase64,
        createdAt: new Date(),
        updatedAt: new Date()
      }, { session });
      
      const bookingId = insertBookingRes.insertedId.toString();

      if (couponId) {
        await couponsCol.updateOne({ _id: couponId }, { $inc: { usageCount: 1 } as any }, { session });
        await userCouponsCol.insertOne({ userId, couponId: couponId.toString(), bookingId }, { session });
      }

      // Mark slot as booked
      await slotsCol.updateOne({ _id: querySlotId }, { $set: { status: 'booked', updatedAt: new Date() } }, { session });

      // Trigger Telegram Notification
      const botToken = process.env.TELEGRAM_BOT_TOKEN;
      const chatId = process.env.TELEGRAM_CHAT_ID;
      
      if (botToken && chatId) {
        try {
          const dateStr = new Date(slot.slot_date).toLocaleDateString("en-IN", {
            weekday: "short", day: "numeric", month: "short"
          });
          const message = `🚨 *New Booking Alert!* 🚨\n\n` +
                          `*Booking Ref:* ${bookingRef}\n` +
                          `*Sport:* ${slot.sport_name.toUpperCase()}\n` +
                          `*Court:* ${slot.court_name}\n` +
                          `*Date:* ${dateStr}\n` +
                          `*Time:* ${slot.start_time} - ${slot.end_time}\n\n` +
                          `*Customer:* ${user ? (user.name || "Customer") : "Admin User"}\n` +
                          `*Phone:* ${user ? (user.phone || "N/A") : "N/A"}\n\n` +
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

      result = { 
        success: true, 
        bookingId
      };
    });

    return result;
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to submit payment" };
  } finally {
    if (session) {
      await session.endSession();
    }
  }
}
