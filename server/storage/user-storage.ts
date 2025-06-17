import { eq } from "drizzle-orm";
import { db } from "../db";
import { users, type User, type UpsertUser } from "@shared/schema";

export class UserStorage {
  async getUser(id: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
    return result[0];
  }

  async createUser(userData: UpsertUser): Promise<User> {
    // Generate unique ID if not provided
    const userId = userData.id || `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const [user] = await db.insert(users).values({
      ...userData,
      id: userId,
      createdAt: new Date(),
      updatedAt: new Date()
    }).returning();
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const existingUser = await this.getUserByEmail(userData.email);
    
    if (existingUser) {
      const [updatedUser] = await db
        .update(users)
        .set({ ...userData, updatedAt: new Date() })
        .where(eq(users.id, existingUser.id))
        .returning();
      return updatedUser;
    } else {
      return await this.createUser(userData);
    }
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  async updateUser(id: string, userData: Partial<UpsertUser>): Promise<User | undefined> {
    const [updatedUser] = await db
      .update(users)
      .set({ ...userData, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return updatedUser;
  }

  async updateUserPassword(id: string, hashedPassword: string): Promise<void> {
    await db
      .update(users)
      .set({ password: hashedPassword, updatedAt: new Date() })
      .where(eq(users.id, id));
  }

  async deleteUser(id: string): Promise<void> {
    await db.delete(users).where(eq(users.id, id));
  }
}

// Export singleton instance
export const userStorage = new UserStorage();