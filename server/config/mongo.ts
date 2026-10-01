import { Db, MongoClient, Collection } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

let client: MongoClient | undefined;
let database: Db | undefined;

export async function connectMongo(): Promise<Db> {
  if (database) return database;
  const uri = process.env.MONGODB_URI || process.env.MONGO_URI;
  const databaseName = process.env.DB_NAME || 'student';
  if (!uri) {
    throw new Error('MONGODB_URI or MONGO_URI must be configured.');
  }

  client = new MongoClient(uri);
  await client.connect();
  database = client.db(databaseName);
  return database;
}

export async function getMongoCollection<T extends object>(name: string): Promise<Collection<T>> {
  const db = await connectMongo();
  return db.collection<T>(name);
}

export async function closeMongo(): Promise<void> {
  await client?.close();
  client = undefined;
  database = undefined;
}
