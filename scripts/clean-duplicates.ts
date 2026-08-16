import { getClient, getCollection, isDatabaseConfigured } from "../src/lib/db/client";

async function run() {
  console.log("Connecting to DB...");
  const slotsCol = await getCollection("slots");
  
  console.log("Fetching all slots...");
  const allSlots = await slotsCol.find({}).toArray();
  console.log(`Found ${allSlots.length} total slots.`);

  const seen = new Set();
  const duplicates = [];

  for (const slot of allSlots) {
    // Create a unique key for courtId + slotDate + startTime
    const key = `${slot.courtId}_${slot.slotDate}_${slot.startTime}`;
    if (seen.has(key)) {
      duplicates.push(slot._id);
    } else {
      seen.add(key);
    }
  }

  console.log(`Found ${duplicates.length} duplicate slots.`);
  
  if (duplicates.length > 0) {
    console.log("Deleting duplicates...");
    const result = await slotsCol.deleteMany({ _id: { $in: duplicates } });
    console.log(`Deleted ${result.deletedCount} duplicates.`);
  }

  process.exit(0);
}

run().catch(console.error);
