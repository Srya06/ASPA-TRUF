import { NextResponse } from "next/server";
import { getCollection } from "@/lib/db/client";

export async function GET() {
  const courtsCol = await getCollection("courts");
  
  const res = await courtsCol.updateOne(
    { _id: "court-2" },
    { $set: { name: "Volleyball Court 2" } }
  );

  return NextResponse.json({ updated: res.modifiedCount });
}
