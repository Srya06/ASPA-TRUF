/**
 * Notification handlers for TRUF.
 *
 * Currently stubs that log to console. In Phase 2, wire these to:
 *  - Resend / SendGrid for email
 *  - Twilio / Gupshup for SMS / WhatsApp
 */

import { getCollection } from "@/lib/db/client";

type NotificationType =
  | "booking_confirmed"
  | "booking_cancelled"
  | "otp_sent"
  | "review_request";

async function persistNotification(
  userId: string | null,
  type: NotificationType,
  payload: Record<string, unknown>
) {
  try {
    const adminNotifCol = await getCollection("admin_notifications");
    await adminNotifCol.insertOne({
      userId,
      type,
      payload,
      createdAt: new Date(),
      isRead: false
    });
  } catch {
    // Silently fail if the table doesn't exist yet (pre-migration)
    console.warn("[notifications] Could not persist notification to DB:", type);
  }
}

export async function notifyCustomerBookingConfirmed(params: {
  userId: string;
  customerName: string;
  phone: string | null;
  email: string | null;
  bookingRef: string;
  slotDate: string;
  sport: string;
  courtName: string;
  startTime: string;
  endTime: string;
  amountPaise: number;
}) {
  console.info(`[notify] booking_confirmed → ${params.customerName} (${params.phone ?? params.email})`);
  await persistNotification(params.userId, "booking_confirmed", params);
  // TODO Phase 2: send WhatsApp / SMS message via Gupshup or Twilio
}

export async function notifyAdminBookingCreated(params: {
  bookingRef: string;
  customerName: string;
  sport: string;
  courtName: string;
  slotDate: string;
  startTime: string;
  amountPaise: number;
}) {
  console.info(`[notify] admin → new booking ${params.bookingRef} by ${params.customerName}`);
  await persistNotification(null, "booking_confirmed", params);
  // TODO Phase 2: send admin email / push notification
}

export async function notifyCustomerBookingCancelled(params: {
  userId: string;
  customerName: string;
  phone: string | null;
  email: string | null;
  bookingRef: string;
  refundAmountPaise: number;
}) {
  console.info(`[notify] booking_cancelled → ${params.bookingRef}`);
  await persistNotification(params.userId, "booking_cancelled", params);
  // TODO Phase 2: send refund confirmation SMS
}

export async function notifyCustomerOTP(params: {
  phone: string;
  otp: string;
}) {
  console.info(`[notify] otp → ${params.phone} → ${params.otp}`);
  await persistNotification(null, "otp_sent", { phone: params.phone });
  // TODO Phase 2: send OTP via SMS gateway
}

export async function notifyReviewRequest(params: {
  userId: string;
  customerName: string;
  phone: string | null;
  bookingRef: string;
  bookingId: string;
}) {
  console.info(`[notify] review_request → ${params.bookingRef}`);
  await persistNotification(params.userId, "review_request", params);
  // TODO Phase 2: send review request WhatsApp message 24h after session
}
