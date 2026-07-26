/**
 * Server-side Mongo client. Lazily created, only when MONGODB_URI is set.
 * This file is intentionally kept out of the client bundle via the
 * `mongodb` package being marked `serverExternalPackages` in next.config.ts.
 */

import "server-only";
import type { Collection, MongoClient } from "mongodb";
import type { HistoryEntry } from "@/lib/history";

const DB_NAME = "motionix";
const COLLECTION = "history";

let cachedClient: MongoClient | null = null;
let cachedConnecting: Promise<MongoClient | null> | null = null;

function isMongoEnabled(): boolean {
  return Boolean(process.env.MONGODB_URI && process.env.MONGODB_URI.startsWith("mongodb"));
}

export async function getMongoClient(): Promise<MongoClient | null> {
  if (!isMongoEnabled()) return null;
  if (cachedClient) return cachedClient;
  if (cachedConnecting) return cachedConnecting;
  cachedConnecting = (async () => {
    try {
      const { MongoClient } = await import("mongodb");
      const client = new MongoClient(process.env.MONGODB_URI!, { serverSelectionTimeoutMS: 4000 });
      await client.connect();
      cachedClient = client;
      await client.db(DB_NAME).collection(COLLECTION).createIndex({ userId: 1, createdAt: -1 });
      return client;
    } catch (e) {
      console.warn("[history] mongo connection failed", e);
      cachedConnecting = null;
      return null;
    }
  })();
  return cachedConnecting;
}

export async function getHistoryCollection(): Promise<Collection<HistoryEntry> | null> {
  const client = await getMongoClient();
  if (!client) return null;
  return client.db(DB_NAME).collection<HistoryEntry>(COLLECTION);
}
