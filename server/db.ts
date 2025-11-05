import { eq, or, and } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, creativeProfiles, bookings, conversations, messages, reviews, deliverables, gigPosts, gigApplications, portfolioItems, transactions } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// Creative Profile Queries
export async function getCreativeProfile(userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(creativeProfiles).where(eq(creativeProfiles.userId, userId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getCreativeById(creativeId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(creativeProfiles).where(eq(creativeProfiles.id, creativeId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function searchCreatives(filters: { category?: string; location?: string; minRating?: number; limit?: number; offset?: number }) {
  const db = await getDb();
  if (!db) return [];
  
  let query = db.select().from(creativeProfiles).where(eq(creativeProfiles.isActive, true));
  
  const limit = filters.limit || 20;
  const offset = filters.offset || 0;
  
  const results = await query.limit(limit).offset(offset);
  return results;
}

// Booking Queries
export async function getBookingsByClient(clientId: number) {
  const db = await getDb();
  if (!db) return [];
  const results = await db.select().from(bookings).where(eq(bookings.clientId, clientId));
  return results;
}

export async function getBookingsByCreative(creativeId: number) {
  const db = await getDb();
  if (!db) return [];
  const results = await db.select().from(bookings).where(eq(bookings.creativeId, creativeId));
  return results;
}

export async function getBookingById(bookingId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(bookings).where(eq(bookings.id, bookingId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// Messaging Queries
export async function getConversation(userId1: number, userId2: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(conversations).where(
    or(
      and(eq(conversations.participantOneId, userId1), eq(conversations.participantTwoId, userId2)),
      and(eq(conversations.participantOneId, userId2), eq(conversations.participantTwoId, userId1))
    )
  ).limit(1);
  
  return result.length > 0 ? result[0] : undefined;
}

export async function getConversationMessages(conversationId: number) {
  const db = await getDb();
  if (!db) return [];
  const results = await db.select().from(messages).where(eq(messages.conversationId, conversationId));
  return results;
}

export async function getUserConversations(userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  const result = await db.select().from(conversations).where(
    or(eq(conversations.participantOneId, userId), eq(conversations.participantTwoId, userId))
  );
  
  return result;
}

// Review Queries
export async function getCreativeReviews(creativeId: number) {
  const db = await getDb();
  if (!db) return [];
  const results = await db.select().from(reviews).where(eq(reviews.creativeId, creativeId));
  return results;
}

export async function getAverageRating(creativeId: number) {
  const db = await getDb();
  if (!db) return 0;
  
  const result = await db.select().from(reviews).where(eq(reviews.creativeId, creativeId));
  if (result.length === 0) return 0;
  
  const sum = result.reduce((acc, r) => acc + r.rating, 0);
  return sum / result.length;
}

// Deliverables Queries
export async function getBookingDeliverables(bookingId: number) {
  const db = await getDb();
  if (!db) return [];
  const results = await db.select().from(deliverables).where(eq(deliverables.bookingId, bookingId));
  return results;
}

// Gig Board Queries
export async function getOpenGigPosts(limit?: number, offset?: number) {
  const db = await getDb();
  if (!db) return [];
  
  const query = db.select().from(gigPosts).where(eq(gigPosts.status, "open"));
  const results = await query.limit(limit || 20).offset(offset || 0);
  return results;
}

export async function getGigApplications(gigPostId: number) {
  const db = await getDb();
  if (!db) return [];
  const results = await db.select().from(gigApplications).where(eq(gigApplications.gigPostId, gigPostId));
  return results;
}

// Portfolio Queries
export async function getCreativePortfolio(creativeId: number) {
  const db = await getDb();
  if (!db) return [];
  const results = await db.select().from(portfolioItems).where(eq(portfolioItems.creativeId, creativeId));
  return results;
}

// Transaction Queries
export async function getTransactionsByUser(userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  const results = await db.select().from(transactions).where(
    (t) => eq(t.payerId, userId) || eq(t.payeeId, userId)
  );
  return results;
}
