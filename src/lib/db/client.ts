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
    const client = new MongoClient(process.env.MONGODB_URI || "");
    globalWithMongo._mongoClientPromise = client.connect();
  }
  clientPromise = globalWithMongo._mongoClientPromise;
} else {
  // In production mode, it's best to not use a global variable.
  const client = new MongoClient(process.env.MONGODB_URI || "");
  clientPromise = client.connect();
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
