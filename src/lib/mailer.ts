import "server-only";
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendOTPEmail(to: string, otp: string) {
  const mailOptions = {
    from: `"TRUF Sports Arena" <${process.env.SMTP_USER}>`,
    to,
    subject: `${otp} is your TRUF login code`,
    html: `
      <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 24px; background: #0a0a0a; border-radius: 16px;">
        <div style="text-align: center; margin-bottom: 32px;">
          <h1 style="color: #CCFF00; font-size: 28px; font-weight: 900; letter-spacing: 4px; margin: 0;">TRUF</h1>
          <p style="color: #ffffff80; font-size: 12px; margin-top: 4px;">Sports Arena</p>
        </div>
        <div style="background: #1a1a1a; border-radius: 12px; padding: 32px; text-align: center; border: 1px solid #ffffff10;">
          <p style="color: #ffffffcc; font-size: 14px; margin: 0 0 20px 0;">Your login code is:</p>
          <div style="background: #0a0a0a; border-radius: 8px; padding: 16px 24px; display: inline-block; border: 1px solid #CCFF0030;">
            <span style="font-size: 36px; font-weight: 900; letter-spacing: 8px; color: #CCFF00;">${otp}</span>
          </div>
          <p style="color: #ffffff50; font-size: 12px; margin: 20px 0 0 0;">This code expires in 10 minutes. Do not share it.</p>
        </div>
        <p style="color: #ffffff30; font-size: 11px; text-align: center; margin-top: 24px;">
          If you didn't request this code, you can safely ignore this email.
        </p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
}
