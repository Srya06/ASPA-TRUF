import { NextResponse } from "next/server";
import { getCollection } from "@/lib/db/client";

export async function GET() {
  const adminsCol = await getCollection("admins");
  
  // Insert the default admin if they don't exist
  const existingAdmin = await adminsCol.findOne({ email: "sryaraj06@gmail.com" });
  if (!existingAdmin) {
    await adminsCol.insertOne({
      email: "sryaraj06@gmail.com",
      password: "1234567890@qwertyuiop",
      createdAt: new Date().toISOString()
    });
    return NextResponse.json({ success: true, message: "Default admin created" });
  }

  return NextResponse.json({ success: true, message: "Admin already exists" });
}
