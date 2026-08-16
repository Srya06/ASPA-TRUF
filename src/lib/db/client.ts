import "server-only";

import { MongoClient, Db } from "mongodb";

// In development mode, use a global variable so that the value
// is preserved across module reloads caused by HMR (Hot Module Replacement).
let clientPromise: Promise<MongoClient>;
const DB_NAME = "truf";

if (process.env.NODE_ENV === "development") {
  // In development mode, use a global variable so that the value
  // is preserved across module reloads caused by HMR (Hot Module Replacement).
  let globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>;
  };

  if (!globalWithMongo._mongoClientPromise) {
    const uri = process.env.MONGODB_URI || "mongodb://dummy-for-build";
    const client = new MongoClient(uri);
    globalWithMongo._mongoClientPromise = client.connect().catch(err => {
      console.error("MongoDB connection error:", err);
      return client;
    });
  }
  clientPromise = globalWithMongo._mongoClientPromise;
} else {
  // In production mode, it's best to not use a global variable.
  const uri = process.env.MONGODB_URI || "mongodb://dummy-for-build";
  const client = new MongoClient(uri);
  clientPromise = client.connect().catch(err => {
    console.error("MongoDB connection error:", err);
    return client;
  });
}

export function isDatabaseConfigured(): boolean {
  return Boolean(process.env.MONGODB_URI);
}

export async function getClient(): Promise<MongoClient> {
  if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI is not configured");
  }
  return clientPromise;
}

export async function getDb(): Promise<Db> {
  const client = await getClient();
  return client.db(DB_NAME);
}

/**
 * Helper to get a collection with typed documents.
 */
export async function getCollection<T extends Record<string, unknown> = Record<string, unknown>>(name: string) {
  const database = await getDb();
  return database.collection<T>(name);
}
