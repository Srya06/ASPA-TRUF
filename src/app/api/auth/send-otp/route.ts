import { NextResponse } from "next/server";
import crypto from "crypto";
import { cookies } from "next/headers";
import { sendOTPEmail } from "@/lib/mailer";

function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function hashOTP(otp: string, email: string): string {
  return crypto
    .createHmac("sha256", process.env.AUTH_SECRET || "truf-secret-key")
    .update(`${email}:${otp}`)
    .digest("hex");
}

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }

    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      return NextResponse.json(
        { error: "Email service is not configured. Please set SMTP_USER and SMTP_PASS in .env" },
        { status: 500 }
      );
    }

    const otp = generateOTP();
    const hash = hashOTP(otp, email);
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

    // Store the hashed OTP + expiry + email in a secure httpOnly cookie
    const cookieStore = await cookies();
    cookieStore.set("otp_data", JSON.stringify({ hash, email, expiresAt }), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 600, // 10 min
    });

    // Send the email with the 6-digit code
    await sendOTPEmail(email, otp);

    console.log(`✅ OTP sent to ${email}`);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Error sending OTP:", err?.message || err);
    return NextResponse.json({ error: "Failed to send OTP." }, { status: 500 });
  }
}
