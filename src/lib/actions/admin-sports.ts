"use server";

import { ObjectId } from "mongodb";
import { getCollection } from "@/lib/db/client";
import { revalidatePath } from "next/cache";

export async function addSport(venueId: string, name: string, slug: string, displayOrder: number) {
  const sportsCol = await getCollection("sports");
  
  await sportsCol.insertOne({
    venueId,
    name,
    slug,
    displayOrder,
    isActive: true,
    description: null,
    iconName: slug,
    imageUrl: null,
    isSeed: false
  });
  
  revalidatePath("/admin/sports");
}

export async function toggleSportStatus(sportId: string, isActive: boolean) {
  const sportsCol = await getCollection("sports");
  
  let queryId: any = sportId;
  if (ObjectId.isValid(sportId) && typeof sportId === 'string' && sportId.length === 24) {
      queryId = new ObjectId(sportId);
  }

  await sportsCol.updateOne(
    { _id: queryId },
    { $set: { isActive } }
  );
  
  revalidatePath("/admin/sports");
  revalidatePath("/admin/calendar");
}
