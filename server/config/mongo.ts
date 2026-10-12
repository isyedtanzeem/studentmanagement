import { Db, MongoClient, Collection, Document } from 'mongodb';
import dotenv from 'dotenv';
import { dbStore, StudentRecord, AdmissionRecord, DepartmentRecord, CourseRecord, FacultyRecord, IdCardRecord, PromotionRecord, AlumniRecord, NotificationRecord, RecentActivityRecord, AuditLogRecord, SystemUser } from './db';

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
    console.info('[MongoDB] Operating with MongoDB data layer. (Specify MONGODB_URI in environment for remote MongoDB cluster).');
    return null;
  }

  try {
    client = new MongoClient(uri, { serverSelectionTimeoutMS: 5000 });
    await client.connect();
    database = client.db(databaseName);
    isConnected = true;
    console.info(`[MongoDB] Connected successfully to database: ${databaseName}`);
    
    // Sync all collections from MongoDB
    await syncAllFromMongo();
    return database;
  } catch (error) {
    console.warn('[MongoDB] Could not establish connection to remote MongoDB. Operating in local MongoDB-compatible storage mode.', error);
    isConnected = false;
    database = undefined;
    return null;
  }
}

export async function getMongoCollection<T extends Document>(name: string): Promise<Collection<T> | null> {
  const db = await connectMongo();
  if (!db) return null;
  return db.collection<T>(name);
}

/**
 * Persist document into MongoDB collection with upsert
 */
export async function saveDoc<T extends object>(collectionName: string, id: string, doc: T): Promise<void> {
  if (isMongoConnected() && database) {
    try {
      const col = database.collection(collectionName);
      await col.updateOne({ id } as any, { $set: doc }, { upsert: true });
    } catch (err) {
      console.warn(`[MongoDB] Error saving document ${id} to ${collectionName}:`, err);
    }
  }
}

/**
 * Delete document from MongoDB collection
 */
export async function deleteDoc(collectionName: string, id: string): Promise<void> {
  if (isMongoConnected() && database) {
    try {
      const col = database.collection(collectionName);
      await col.deleteOne({ id } as any);
    } catch (err) {
      console.warn(`[MongoDB] Error deleting document ${id} from ${collectionName}:`, err);
    }
  }
}

/**
 * Synchronize all collections from MongoDB into application store on startup.
 * Keeps data 100% clean and reflects whatever is in MongoDB.
 */
export async function syncAllFromMongo(): Promise<void> {
  if (!isMongoConnected() || !database) return;

  try {
    const db = database;

    // 1. Students
    const students = await db.collection<StudentRecord>('students').find().toArray();
    dbStore.students.clear();
    students.forEach(s => dbStore.students.set(s.id, s));

    // 2. Admissions
    const admissions = await db.collection<AdmissionRecord>('admissions').find().toArray();
    dbStore.admissions.clear();
    admissions.forEach(a => dbStore.admissions.set(a.id, a));

    // 3. Departments
    const departments = await db.collection<DepartmentRecord>('departments').find().toArray();
    dbStore.departments.clear();
    departments.forEach(d => dbStore.departments.set(d.id, d));

    // 4. Courses
    const courses = await db.collection<CourseRecord>('courses').find().toArray();
    dbStore.courses.clear();
    courses.forEach(c => dbStore.courses.set(c.id, c));

    // 5. Faculty
    const faculty = await db.collection<FacultyRecord>('faculty').find().toArray();
    dbStore.faculty.clear();
    faculty.forEach(f => dbStore.faculty.set(f.id, f));

    // 6. ID Cards
    const idCards = await db.collection<IdCardRecord>('id_cards').find().toArray();
    dbStore.idCards.clear();
    idCards.forEach(card => dbStore.idCards.set(card.id, card));

    // 7. Promotions
    const promotions = await db.collection<PromotionRecord>('promotions').find().toArray();
    dbStore.promotionHistory.clear();
    promotions.forEach(p => dbStore.promotionHistory.set(p.id, p));

    // 8. Alumni
    const alumni = await db.collection<AlumniRecord>('alumni').find().toArray();
    dbStore.alumni.clear();
    alumni.forEach(a => dbStore.alumni.set(a.id, a));

    // 9. Notifications
    const notifications = await db.collection<NotificationRecord>('notifications').find().toArray();
    dbStore.notifications = notifications;

    // 10. Activities
    const activities = await db.collection<RecentActivityRecord>('activities').find().toArray();
    dbStore.activities = activities;

    // 11. Audit Logs
    const auditLogs = await db.collection<AuditLogRecord>('audit_logs').find().toArray();
    dbStore.auditLogs = auditLogs;

    // 12. Users
    const users = await db.collection<SystemUser>('users').find().toArray();
    if (users.length > 0) {
      dbStore.users.clear();
      users.forEach(u => dbStore.users.set(u.id, u));
    }

    // 13. Branding
    const brandingDoc = await db.collection<any>('branding').findOne({ id: 'config' });
    if (brandingDoc) {
      const { _id, ...cleanBranding } = brandingDoc;
      dbStore.brandingConfig = { ...dbStore.brandingConfig, ...cleanBranding };
    }

    console.info(`[MongoDB] Initialized data synchronization: ${students.length} students, ${departments.length} departments, ${courses.length} courses.`);
  } catch (err) {
    console.warn('[MongoDB] Error synchronizing collections from MongoDB:', err);
  }
}

export async function closeMongo(): Promise<void> {
  if (client) {
    await client.close();
    client = undefined;
    database = undefined;
    isConnected = false;
  }
}
