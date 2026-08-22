import "server-only";

import { MongoClient, Db } from "mongodb";

// In development mode, use a global variable so that the value
// is preserved across module reloads caused by HMR (Hot Module Replacement).
const DB_NAME = "truf";

// Global connection cache
let cachedClient: MongoClient | null = null;
let clientPromise: Promise<MongoClient> | null = null;

if (process.env.NODE_ENV === "development") {
  let globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>;
    _mongoClient?: MongoClient;
  };
  clientPromise = globalWithMongo._mongoClientPromise || null;
  cachedClient = globalWithMongo._mongoClient || null;
}

export function isDatabaseConfigured(): boolean {
  return Boolean(process.env.MONGODB_URI);
}

export async function getClient(): Promise<MongoClient> {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("MONGODB_URI is not configured");
  }

  // If we have a cached client, check if its topology is closed
  if (cachedClient) {
    // @ts-ignore - accessing internal topology state to check if connection is alive
    const isClosed = cachedClient.topology?.isClosed();
    if (!isClosed) {
      return cachedClient;
    }
    // If closed, clear cache and reconnect
    cachedClient = null;
    clientPromise = null;
  }

  // If a connection is currently being established, wait for it
  if (clientPromise) {
    try {
      cachedClient = await clientPromise;
      return cachedClient;
    } catch (error) {
      // If it failed, clear the promise and try again below
      clientPromise = null;
    }
  }

  // Establish a new connection
  const client = new MongoClient(uri);
  clientPromise = client.connect();
  
  try {
    cachedClient = await clientPromise;
    
    if (process.env.NODE_ENV === "development") {
      let globalWithMongo = global as typeof globalThis & {
        _mongoClientPromise?: Promise<MongoClient>;
        _mongoClient?: MongoClient;
      };
      globalWithMongo._mongoClientPromise = clientPromise;
      globalWithMongo._mongoClient = cachedClient;
    }
    
    return cachedClient;
  } catch (error) {
    clientPromise = null;
    throw error;
  }
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
