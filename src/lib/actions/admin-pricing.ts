"use server";

import { ObjectId } from "mongodb";
import { getCollection } from "@/lib/db/client";
import { revalidatePath } from "next/cache";

export async function updatePricingRule(courtId: string, basePricePaise: number, peakMultiplier: number) {
  const pricingCol = await getCollection("pricing_rules");
  
  // Deactivate the old active ones
  await pricingCol.updateMany(
    { courtId },
    { $set: { isActive: false } }
  );

  // Insert the new one
  await pricingCol.insertOne({
    courtId,
    basePricePaise,
    peakMultiplier,
    isActive: true,
    effectiveFrom: new Date()
  });

  revalidatePath("/admin/pricing");
  revalidatePath("/admin/calendar");
}
