import { MongoClient } from "mongodb";
import fs from "fs";

const envStr = fs.readFileSync(".env", "utf8");
const match = envStr.match(/MONGODB_URI=(.*)/);
const uri = match ? match[1].trim() : "";

async function checkBookings() {
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db("truf");
  
  const bookings = await db.collection("bookings").find({}).sort({ createdAt: -1 }).limit(3).toArray();
  
  console.log(`Found ${bookings.length} recent bookings.`);
  
  for (const booking of bookings) {
    console.log("-------------------");
    console.log(`Booking ID: ${booking._id}`);
    console.log(`Customer: ${booking.customerName}`);
    console.log(`Amount: ${(booking.finalAmountPaise / 100).toFixed(2)} INR`);
    console.log(`Status: ${booking.status}`);
    console.log(`Screenshot present: ${!!booking.screenshotBase64}`);
  }
  
  await client.close();
}

checkBookings().catch(console.error);
