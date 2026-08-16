"use server";

import { ObjectId } from "mongodb";
import { getCollection } from "@/lib/db/client";
import { revalidatePath } from "next/cache";

export async function toggleReviewVisibility(reviewId: string, isPublished: boolean) {
  const reviewsCol = await getCollection("reviews");

  let queryId: any = reviewId;
  if (ObjectId.isValid(reviewId) && typeof reviewId === 'string' && reviewId.length === 24) {
      queryId = new ObjectId(reviewId);
  }

  await reviewsCol.updateOne(
    { _id: queryId },
    { $set: { isPublished } }
  );

  revalidatePath("/admin/reviews");
  revalidatePath("/reviews"); // public reviews page
}
