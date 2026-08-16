/**
 * MongoDB Seed Script — run with: node db/seed-mongo.mjs
 */
import { MongoClient } from "mongodb";

const MONGODB_URI = "mongodb+srv://sryaraj06_db_user:M5OM8MBM6ji5l34f@cluster0.qydjohc.mongodb.net/";
const DB_NAME = "truf";

async function seed() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log("✅ Connected to MongoDB Atlas");
    
    const db = client.db(DB_NAME);

    // Drop existing collections for a clean seed
    const collections = await db.listCollections().toArray();
    for (const col of collections) {
      await db.dropCollection(col.name);
    }
    console.log("🗑️  Cleared existing collections");

    // --- Venue ---
    await db.collection("venues").insertOne({
      _id: "venue-001",
      name: "TRUF Sports Arena",
      slug: "truf-hunsur",
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
    console.log("📍 Seeded venue");

    // --- Sports ---
    const sports = [
      {
        _id: "sport-football",
        venueId: "venue-001",
        name: "Football",
        slug: "football",
        description: "Full-size 7-a-side turf with FIFA-quality artificial grass.",
        iconName: "football",
        imageUrl: "https://images.unsplash.com/photo-1574629810360-7abbc94d50a5?w=800&q=80",
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
        imageUrl: "https://images.unsplash.com/photo-1531419140115-29d9249d319c?w=800&q=80",
        displayOrder: 2,
        isActive: true,
        isSeed: true,
      },
      {
        _id: "sport-badminton",
        venueId: "venue-001",
        name: "Badminton",
        slug: "badminton",
        description: "Indoor synthetic courts with professional lighting.",
        iconName: "badminton",
        imageUrl: "https://images.unsplash.com/photo-1626224583764-f87db7ac2ed9?w=800&q=80",
        displayOrder: 3,
        isActive: true,
        isSeed: true,
      },
    ];
    await db.collection("sports").insertMany(sports);
    console.log("⚽ Seeded sports");

    // --- Courts ---
    const courts = [
      { _id: "court-turf-a", venueId: "venue-001", sportId: "sport-football", name: "Turf A", slug: "turf-a", capacity: 14, isActive: true, isSeed: true },
      { _id: "court-net-1", venueId: "venue-001", sportId: "sport-cricket", name: "Net 1", slug: "net-1", capacity: 12, isActive: true, isSeed: true },
      { _id: "court-1", venueId: "venue-001", sportId: "sport-badminton", name: "Court 1", slug: "court-1", capacity: 4, isActive: true, isSeed: true },
      { _id: "court-2", venueId: "venue-001", sportId: "sport-badminton", name: "Court 2", slug: "court-2", capacity: 4, isActive: true, isSeed: true },
    ];
    await db.collection("courts").insertMany(courts);
    console.log("🏟️  Seeded courts");

    // --- Pricing Rules ---
    const pricing = [
      { _id: "price-football", courtId: "court-turf-a", basePricePaise: 150000, isActive: true, effectiveFrom: new Date() },
      { _id: "price-cricket", courtId: "court-net-1", basePricePaise: 120000, isActive: true, effectiveFrom: new Date() },
      { _id: "price-badminton-1", courtId: "court-1", basePricePaise: 40000, isActive: true, effectiveFrom: new Date() },
      { _id: "price-badminton-2", courtId: "court-2", basePricePaise: 40000, isActive: true, effectiveFrom: new Date() },
    ];
    await db.collection("pricing_rules").insertMany(pricing);
    console.log("💰 Seeded pricing");

    // --- Slots (Today + Next 7 Days) ---
    const hours = [6, 7, 8, 9, 10, 11, 14, 15, 16, 17, 18, 19, 20, 21];
    const courtPrices = {
      "court-turf-a": 150000,
      "court-net-1": 120000,
      "court-1": 40000,
      "court-2": 40000,
    };
    const courtSports = {
      "court-turf-a": "sport-football",
      "court-net-1": "sport-cricket",
      "court-1": "sport-badminton",
      "court-2": "sport-badminton",
    };

    const slots = [];
    for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
      const date = new Date();
      date.setDate(date.getDate() + dayOffset);
      const dateStr = date.toISOString().slice(0, 10);

      for (const [courtId, price] of Object.entries(courtPrices)) {
        for (const hour of hours) {
          const startTime = `${String(hour).padStart(2, "0")}:00`;
          const endTime = `${String(hour + 1).padStart(2, "0")}:00`;
          
          // Randomly mark some past slots as booked
          let status = "available";
          if (dayOffset === 0 && hour < new Date().getHours()) {
            status = "booked";
          }

          slots.push({
            courtId,
            sportId: courtSports[courtId],
            slotDate: dateStr,
            startTime,
            endTime,
            status,
            pricePaise: price,
            isSeed: true,
            createdAt: new Date(),
            updatedAt: new Date(),
          });
        }
      }
    }
    await db.collection("slots").insertMany(slots);
    console.log(`📅 Seeded ${slots.length} slots (7 days × 4 courts × ${hours.length} hours)`);

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
    console.log("🎟️  Seeded coupon: WELCOME20 (20% off, max ₹500)");

    console.log("\n🎉 MongoDB seed complete!");
  } catch (err) {
    console.error("❌ Seed failed:", err);
  } finally {
    await client.close();
  }
}

seed();
