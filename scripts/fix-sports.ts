import { MongoClient } from "mongodb";
import fs from "fs";

const envStr = fs.readFileSync(".env", "utf8");
const match = envStr.match(/MONGODB_URI=(.*)/);
const uri = match ? match[1].trim() : "";

async function fixSportsData() {
  if (!uri) throw new Error("Missing MONGODB_URI");

  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db("truf");

  // Football
  await db.collection("sports").updateOne(
    { slug: "football" },
    {
      $set: {
        imageUrl: "https://images.unsplash.com/photo-1459865264687-595d652de67e?w=800&q=80"
      }
    }
  );

  // Cricket
  await db.collection("sports").updateOne(
    { slug: "cricket" },
    {
      $set: {
        imageUrl: "https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=800&q=80"
      }
    }
  );

  // Volleyball (was badminton)
  // Even if it was updated, force update name, iconName, slug, imageUrl
  await db.collection("sports").updateOne(
    { $or: [{ slug: "badminton" }, { slug: "volleyball" }] },
    {
      $set: {
        name: "Volleyball",
        slug: "volleyball",
        iconName: "volleyball",
        imageUrl: "https://images.unsplash.com/photo-1592656094267-764a45160876?w=800&q=80",
        description: "Premium synthetic courts for professional and recreational play",
      }
    }
  );

  console.log("Images and Volleyball data fully updated!");
  await client.close();
}

fixSportsData().catch(console.error);
