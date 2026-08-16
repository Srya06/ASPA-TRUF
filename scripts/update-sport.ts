import { MongoClient } from "mongodb";
import fs from "fs";

// Poor man's dotenv
const envStr = fs.readFileSync(".env", "utf8");
const match = envStr.match(/MONGODB_URI=(.*)/);
const uri = match ? match[1].trim() : "";

async function updateSport() {
  if (!uri) throw new Error("Missing MONGODB_URI");

  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db("truf");

  // Update sport from badminton to volleyball
  await db.collection("sports").updateOne(
    { slug: "badminton" },
    {
      $set: {
        name: "Volleyball",
        slug: "volleyball",
        description: "Premium synthetic courts for professional and recreational play",
      }
    }
  );

  // Update any courts associated with badminton
  const volleyballSport = await db.collection("sports").findOne({ slug: "volleyball" });
  if (volleyballSport) {
    await db.collection("courts").updateMany(
      { sportId: volleyballSport._id },
      {
        $set: {
          name: "Volleyball Court 1",
          type: "synthetic"
        }
      }
    );
  }

  console.log("Updated badminton to volleyball!");
  await client.close();
}

updateSport().catch(console.error);
