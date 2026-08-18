/**
 * MongoDB Seed Script – run with: node db/seed-mongo.mjs
 */
import { MongoClient } from "mongodb";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb+srv://sryaraj06_db_user:M5OM8MBM6ji5l34f@cluster0.qydjohc.mongodb.net/";
const DB_NAME = "truf";

async function seed() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log("🟢 Connected to MongoDB Atlas");
    
    const db = client.db(DB_NAME);

    // Drop existing collections for a clean seed
    const collections = await db.listCollections().toArray();
    for (const col of collections) {
      await db.dropCollection(col.name);
    }
    console.log("🧹 Cleared existing collections");

    // --- Venue ---
    await db.collection("venues").insertOne({
      _id: "venue-001",
      name: "APSA Sports Arena",
      slug: "apsa-hunsur",
      addressLine1: "Near KSRTC Bus Stand, Hunsur Main Road",
      city: "Hunsur",
      state: "Karnataka",
      pincode: "571105",
      latitude: 12.3047,
      longitude: 76.2904,
      phone: "+919876543210",
      email: "hello@truf.in",
      isSeed: true,
    });
    console.log("🏢 Seeded venue");

    // --- Sports ---
    const sports = [
      {
        _id: "sport-football",
        venueId: "venue-001",
        name: "Football",
        slug: "football",
        description: "Full-size 7-a-side turf with FIFA-quality artificial grass.",
        iconName: "football",
        imageUrl: "/images/football.jpg",
        startingPricePaise: 69900,
        displayOrder: 1,
        isActive: true,
        isSeed: true,
      },
      {
        _id: "sport-cricket",
        venueId: "venue-001",
        name: "Cricket",
        slug: "cricket",
        description: "Box cricket nets with bowling machine available on request.",
        iconName: "cricket",
        imageUrl: "/images/cricket.jpg",
        startingPricePaise: 120000,
        displayOrder: 2,
        isActive: true,
        isSeed: true,
      },
      {
        _id: "sport-volleyball",
        venueId: "venue-001",
        name: "Volleyball",
        slug: "volleyball",
        description: "Outdoor synthetic courts with professional lighting.",
        iconName: "volleyball",
        imageUrl: "/images/volleyball.jpg",
        startingPricePaise: 40000,
        displayOrder: 3,
        isActive: true,
        isSeed: true,
      },
    ];
    await db.collection("sports").insertMany(sports);
    console.log("⚽ Seeded sports");

    // --- Courts (Single Turf = 2 Halves) ---
    const courts = [
      { _id: "court-half-a", venueId: "venue-001", name: "Half Court A", slug: "half-a", capacity: 10, isActive: true, isSeed: true },
      { _id: "court-half-b", venueId: "venue-001", name: "Half Court B", slug: "half-b", capacity: 10, isActive: true, isSeed: true },
    ];
    await db.collection("courts").insertMany(courts);
    console.log("🏟️ Seeded courts");

    // --- Pricing Rules ---
    // Pricing is dynamic now via lib/pricing.ts, but we keep this for legacy reasons
    const pricing = [
      { _id: "price-half-a", courtId: "court-half-a", basePricePaise: 69900, isActive: true, effectiveFrom: new Date() },
      { _id: "price-half-b", courtId: "court-half-b", basePricePaise: 69900, isActive: true, effectiveFrom: new Date() },
    ];
    await db.collection("pricing_rules").insertMany(pricing);
    console.log("💰 Seeded pricing");

    // --- Slots (Today + Next 7 Days) ---
    const hours = [6, 7, 8, 9, 10, 11, 14, 15, 16, 17, 18, 19, 20, 21];
    const courtsList = ["court-half-a", "court-half-b"];

    const slots = [];
    for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
      const date = new Date();
      date.setDate(date.getDate() + dayOffset);
      const dateStr = date.toISOString().slice(0, 10);

      for (const courtId of courtsList) {
        for (const hour of hours) {
          const startTime = `${String(hour).padStart(2, "0")}:00`;
          const endTime = `${String(hour + 1).padStart(2, "0")}:00`;
          
          let status = "available";
          if (dayOffset === 0 && hour < new Date().getHours()) {
            status = "booked"; // Past slots
          }

          slots.push({
            courtId,
            sportId: null, // No sport until booked
            slotDate: dateStr,
            startTime,
            endTime,
            status,
            pricePaise: 69900,
            isSeed: true,
            createdAt: new Date(),
            updatedAt: new Date(),
          });
        }
      }
    }
    await db.collection("slots").insertMany(slots);
    console.log(`📅 Seeded ${slots.length} slots (7 days x 2 courts x ${hours.length} hours)`);

    // --- Create indexes ---
    await db.collection("slots").createIndex({ slotDate: 1, courtId: 1, startTime: 1 });
    await db.collection("slots").createIndex({ sportId: 1, slotDate: 1 });
    await db.collection("bookings").createIndex({ userId: 1, status: 1 });
    await db.collection("bookings").createIndex({ slotId: 1 });
    await db.collection("users").createIndex({ email: 1 }, { unique: true });
    await db.collection("coupons").createIndex({ code: 1 }, { unique: true });
    console.log("🔑 Created indexes");

    // --- Admin User ---
    await db.collection("users").insertOne({
      email: "admin@truf.com",
      role: "admin",
      isVerified: true,
      createdAt: new Date(),
    });
    console.log("👤 Seeded admin user (admin@truf.com)");

    // --- Sample Coupon ---
    await db.collection("coupons").insertOne({
      code: "WELCOME20",
      discountType: "percentage",
      discountValue: 20,
      maxDiscountPaise: 50000,
      minOrderValuePaise: 50000,
      isActive: true,
      validFrom: new Date(),
      validUntil: null,
      usageLimit: 100,
      usageCount: 0,
      createdAt: new Date(),
    });
    console.log("🎟️ Seeded coupon: WELCOME20 (20% off, max ₹500)");

    console.log("\n✅ MongoDB seed complete!");
  } catch (err) {
    console.error("❌ Seed failed:", err);
  } finally {
    await client.close();
  }
}

seed();
