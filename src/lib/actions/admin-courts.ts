"use server";

import { ObjectId } from "mongodb";
import { getCollection } from "@/lib/db/client";
import { revalidatePath } from "next/cache";

export async function addCourt(venueId: string, sportId: string, name: string, slug: string, capacity: number) {
  const courtsCol = await getCollection("courts");
  
  await courtsCol.insertOne({
    venueId,
    sportId,
    name,
    slug,
    capacity,
    isActive: true,
    isSeed: false
  });
  
  revalidatePath("/admin/courts");
}

export async function toggleCourtStatus(courtId: string, isActive: boolean) {
  const courtsCol = await getCollection("courts");
  
  let queryId: any = courtId;
  if (ObjectId.isValid(courtId) && typeof courtId === 'string' && courtId.length === 24) {
      queryId = new ObjectId(courtId);
  }

  await courtsCol.updateOne(
    { _id: queryId },
    { $set: { isActive } }
  );
  
  revalidatePath("/admin/courts");
  revalidatePath("/admin/calendar");
}
