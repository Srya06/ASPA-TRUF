import { MongoClient } from "mongodb";
import fs from "fs";

const envStr = fs.readFileSync(".env", "utf8");
const match = envStr.match(/MONGODB_URI=(.*)/);
const uri = match ? match[1].trim() : "";

async function checkSports() {
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db("truf");
  
  const sports = await db.collection("sports").find({}).toArray();
  console.log(JSON.stringify(sports, null, 2));
  
  await client.close();
}

checkSports().catch(console.error);
