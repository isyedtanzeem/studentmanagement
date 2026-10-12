import { dbStore, SystemUser } from '../config/db';
import { hashPassword } from '../utils/passwordUtils';
import { saveDoc, getMongoCollection } from '../config/mongo';

export class UserModel {
  public static async findByEmail(email: string): Promise<SystemUser | null> {
    const normalizedEmail = email.toLowerCase().trim();
    for (const user of dbStore.users.values()) {
      if (user.email.toLowerCase() === normalizedEmail) {
        return user;
      }
    }
    return null;
  }

  public static async findById(id: string): Promise<SystemUser | null> {
    return dbStore.users.get(id) || null;
  }

  public static async findByResetToken(token: string): Promise<SystemUser | null> {
    for (const user of dbStore.users.values()) {
      if (
        user.resetPasswordToken === token &&
        user.resetPasswordExpires &&
        user.resetPasswordExpires > Date.now()
      ) {
        return user;
      }
    }
    return null;
  }

  public static async update(id: string, updates: Partial<SystemUser>): Promise<SystemUser | null> {
    const user = dbStore.users.get(id);
    if (!user) return null;

    const updatedUser: SystemUser = { ...user, ...updates };
    dbStore.users.set(id, updatedUser);
    await saveDoc('users', id, updatedUser);
    return updatedUser;
  }

  public static async seedDefaultUsers(): Promise<void> {
    if (dbStore.users.size > 0) return;

    const defaultPasswordHash = await hashPassword('Password123!');

    const initialUsers: SystemUser[] = [
      {
        id: 'usr_superadmin',
        email: 'superadmin@scholarcore.edu.in',
        passwordHash: defaultPasswordHash,
        fullName: 'Dr. Rajeshwar Sharma',
        role: 'Super Admin',
        department: 'Vice Chancellor Office & IT Operations',
        employeeId: 'EMP-VC-001',
        status: 'Active',
        createdAt: new Date().toISOString()
      },
      {
        id: 'usr_admin',
        email: 'admin@scholarcore.edu.in',
        passwordHash: defaultPasswordHash,
        fullName: 'Sunita Deshmukh',
        role: 'Admin',
        department: 'Academic Registrar Cell',
        employeeId: 'EMP-REG-102',
        status: 'Active',
        createdAt: new Date().toISOString()
      },
      {
        id: 'usr_admission',
        email: 'admission@scholarcore.edu.in',
        passwordHash: defaultPasswordHash,
        fullName: 'Amit Vikram Singh',
        role: 'Admission Officer',
        department: 'Central Admissions & Verification Cell',
        employeeId: 'EMP-ADM-003',
        status: 'Active',
        createdAt: new Date().toISOString()
      }
    ];

    for (const u of initialUsers) {
      dbStore.users.set(u.id, u);
      await saveDoc('users', u.id, u);
    }
  }
}
