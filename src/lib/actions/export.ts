"use server";

import { getAdminBookings } from "@/lib/queries/admin-bookings";
import { getAdminSession } from "@/lib/admin-auth";
import nodemailer from "nodemailer";

export async function exportBookingsAction() {
  try {
    const session = await getAdminSession();
    if (!session || !session.email) {
      return { success: false, error: "Unauthorized or missing email." };
    }

    const adminEmail = session.email;
    
    // Fetch all bookings (using a high limit, e.g., 10000 for export purposes)
    const bookings = await getAdminBookings(10000);

    // Create CSV header
    const headers = [
      "Booking Reference",
      "Customer Name",
      "Customer Phone",
      "Sport",
      "Court",
      "Date",
      "Start Time",
      "End Time",
      "Amount Paid (Rs)",
      "Status",
      "Booked At"
    ];

    // Map bookings to CSV rows
    const rows = bookings.map(b => {
      return [
        b.booking_ref,
        `"${b.customer_name}"`, // Quote strings that might contain commas
        `"${b.customer_phone}"`,
        `"${b.sport_name}"`,
        `"${b.court_name}"`,
        b.slot_date,
        b.start_time,
        b.end_time,
        (b.final_amount_paise / 100).toFixed(2),
        b.status,
        new Date(b.created_at).toLocaleString("en-IN")
      ].join(",");
    });

    const csvContent = [headers.join(","), ...rows].join("\n");

    // Send Email
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    await transporter.sendMail({
      from: `"APSA Admin Portal" <${process.env.SMTP_USER}>`,
      to: adminEmail as string,
      subject: "Your Booking Export from APSA",
      text: "Hello Admin,\n\nPlease find attached the complete list of bookings as requested from the APSA admin portal.\n\nBest,\nAPSA System",
      attachments: [
        {
          filename: `apsa_bookings_export_${new Date().toISOString().split("T")[0]}.csv`,
          content: csvContent,
          contentType: "text/csv"
        }
      ]
    });

    return { success: true };
  } catch (err: any) {
    console.error("Export Error:", err);
    return { success: false, error: err.message || "An error occurred during export" };
  }
}
