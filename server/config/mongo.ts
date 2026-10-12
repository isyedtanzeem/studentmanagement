import { Db, MongoClient, Collection } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

let client: MongoClient | undefined;
let database: Db | undefined;
let isConnected = false;

export function isMongoConnected(): boolean {
  return isConnected && !!database;
}

export function getMongoDb(): Db | undefined {
  return database;
}

export async function connectMongo(): Promise<Db | null> {
  if (database) return database;
  const uri = process.env.MONGODB_URI || process.env.MONGO_URI;
  const databaseName = process.env.DB_NAME || 'student';

  if (!uri) {
    console.info('[MongoDB] No MONGODB_URI or MONGO_URI configured. Running in high-performance in-memory database store mode.');
    return null;
  }

  try {
    client = new MongoClient(uri, { serverSelectionTimeoutMS: 4000 });
    await client.connect();
    database = client.db(databaseName);
    isConnected = true;
    console.info(`[MongoDB] Connected successfully to database: ${databaseName}`);
    return database;
  } catch (error) {
    console.warn('[MongoDB] Could not connect to MongoDB instance. Falling back to in-memory database store mode.', error);
    isConnected = false;
    database = undefined;
    return null;
  }
}

export async function getMongoCollection<T extends object>(name: string): Promise<Collection<T> | null> {
  const db = await connectMongo();
  if (!db) return null;
  return db.collection<T>(name);
}

export async function closeMongo(): Promise<void> {
  if (client) {
    await client.close();
    client = undefined;
    database = undefined;
    isConnected = false;
  }
}

