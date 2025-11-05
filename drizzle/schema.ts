import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, boolean, decimal, index } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin", "creative"]).default("user").notNull(),
  userType: mysqlEnum("userType", ["client", "creative"]).default("client"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// Creative Profile Table
export const creativeProfiles = mysqlTable("creative_profiles", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  businessName: varchar("businessName", { length: 255 }),
  bio: text("bio"),
  categories: text("categories"), // JSON array of categories
  location: varchar("location", { length: 255 }),
  latitude: varchar("latitude", { length: 50 }),
  longitude: varchar("longitude", { length: 50 }),
  basePrice: int("basePrice"), // in cents
  hourlyRate: int("hourlyRate"), // in cents
  profileImage: varchar("profileImage", { length: 500 }),
  coverImage: varchar("coverImage", { length: 500 }),
  averageRating: varchar("averageRating", { length: 10 }).default("0"),
  totalReviews: int("totalReviews").default(0),
  isVerified: boolean("isVerified").default(false),
  isActive: boolean("isActive").default(true),
  portfolio: text("portfolio"), // JSON array of portfolio items
  socialLinks: text("socialLinks"), // JSON object of social links
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => [{
  userIdIdx: index("creative_profiles_userId_idx").on(table.userId),
}]);

export type CreativeProfile = typeof creativeProfiles.$inferSelect;
export type InsertCreativeProfile = typeof creativeProfiles.$inferInsert;

// Booking Table
export const bookings = mysqlTable("bookings", {
  id: int("id").autoincrement().primaryKey(),
  clientId: int("clientId").notNull(),
  creativeId: int("creativeId").notNull(),
  serviceType: varchar("serviceType", { length: 255 }),
  description: text("description"),
  bookingDate: varchar("bookingDate", { length: 50 }).notNull(), // ISO date string
  startTime: varchar("startTime", { length: 50 }).notNull(), // HH:mm format
  endTime: varchar("endTime", { length: 50 }).notNull(), // HH:mm format
  duration: int("duration"), // in minutes
  location: varchar("location", { length: 255 }),
  totalPrice: int("totalPrice").notNull(), // in cents
  depositAmount: int("depositAmount").notNull(), // in cents
  depositPaid: boolean("depositPaid").default(false),
  status: mysqlEnum("status", ["pending", "confirmed", "completed", "cancelled", "disputed"]).default("pending"),
  paymentMethod: varchar("paymentMethod", { length: 50 }), // paystack, stripe
  transactionId: varchar("transactionId", { length: 255 }),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => [{
  clientIdIdx: index("bookings_clientId_idx").on(table.clientId),
  creativeIdIdx: index("bookings_creativeId_idx").on(table.creativeId),
}]);

export type Booking = typeof bookings.$inferSelect;
export type InsertBooking = typeof bookings.$inferInsert;

// Availability/Calendar Table
export const availability = mysqlTable("availability", {
  id: int("id").autoincrement().primaryKey(),
  creativeId: int("creativeId").notNull(),
  date: varchar("date", { length: 50 }).notNull(), // ISO date string
  startTime: varchar("startTime", { length: 50 }).notNull(), // HH:mm
  endTime: varchar("endTime", { length: 50 }).notNull(), // HH:mm
  isBooked: boolean("isBooked").default(false),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => [{
  creativeIdIdx: index("availability_creativeId_idx").on(table.creativeId),
}]);

export type Availability = typeof availability.$inferSelect;
export type InsertAvailability = typeof availability.$inferInsert;

// Messaging Table
export const conversations = mysqlTable("conversations", {
  id: int("id").autoincrement().primaryKey(),
  participantOneId: int("participantOneId").notNull(),
  participantTwoId: int("participantTwoId").notNull(),
  bookingId: int("bookingId"),
  lastMessage: text("lastMessage"),
  lastMessageAt: timestamp("lastMessageAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => [{
  participantOneIdx: index("conversations_participantOneId_idx").on(table.participantOneId),
  participantTwoIdx: index("conversations_participantTwoId_idx").on(table.participantTwoId),
}]);

export type Conversation = typeof conversations.$inferSelect;
export type InsertConversation = typeof conversations.$inferInsert;

export const messages = mysqlTable("messages", {
  id: int("id").autoincrement().primaryKey(),
  conversationId: int("conversationId").notNull(),
  senderId: int("senderId").notNull(),
  content: text("content"),
  attachmentUrl: varchar("attachmentUrl", { length: 500 }),
  attachmentType: varchar("attachmentType", { length: 50 }), // image, file, video
  isRead: boolean("isRead").default(false),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => [{
  conversationIdIdx: index("messages_conversationId_idx").on(table.conversationId),
  senderIdIdx: index("messages_senderId_idx").on(table.senderId),
}]);

export type Message = typeof messages.$inferSelect;
export type InsertMessage = typeof messages.$inferInsert;

// Deliverables Table
export const deliverables = mysqlTable("deliverables", {
  id: int("id").autoincrement().primaryKey(),
  bookingId: int("bookingId").notNull(),
  creativeId: int("creativeId").notNull(),
  clientId: int("clientId").notNull(),
  title: varchar("title", { length: 255 }),
  description: text("description"),
  fileUrl: varchar("fileUrl", { length: 500 }),
  fileType: varchar("fileType", { length: 50 }), // image, video, pdf, zip
  fileSize: int("fileSize"), // in bytes
  downloadCount: int("downloadCount").default(0),
  uploadedAt: timestamp("uploadedAt").defaultNow().notNull(),
  expiresAt: timestamp("expiresAt"), // optional expiration
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => [{
  bookingIdIdx: index("deliverables_bookingId_idx").on(table.bookingId),
  creativeIdIdx: index("deliverables_creativeId_idx").on(table.creativeId),
}]);

export type Deliverable = typeof deliverables.$inferSelect;
export type InsertDeliverable = typeof deliverables.$inferInsert;

// Reviews & Ratings Table
export const reviews = mysqlTable("reviews", {
  id: int("id").autoincrement().primaryKey(),
  bookingId: int("bookingId").notNull(),
  reviewerId: int("reviewerId").notNull(), // client
  creativeId: int("creativeId").notNull(),
  rating: int("rating").notNull(), // 1-5
  title: varchar("title", { length: 255 }),
  comment: text("comment"),
  isVerified: boolean("isVerified").default(true), // verified booking
  isPublished: boolean("isPublished").default(true),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => [{
  creativeIdIdx: index("reviews_creativeId_idx").on(table.creativeId),
  reviewerIdIdx: index("reviews_reviewerId_idx").on(table.reviewerId),
}]);

export type Review = typeof reviews.$inferSelect;
export type InsertReview = typeof reviews.$inferInsert;

// Gig Board - Job Posts Table
export const gigPosts = mysqlTable("gig_posts", {
  id: int("id").autoincrement().primaryKey(),
  clientId: int("clientId").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  category: varchar("category", { length: 100 }),
  budget: int("budget"), // in cents
  location: varchar("location", { length: 255 }),
  deadline: varchar("deadline", { length: 50 }), // ISO date string
  status: mysqlEnum("status", ["open", "in_progress", "completed", "closed"]).default("open"),
  applicationsCount: int("applicationsCount").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => [{
  clientIdIdx: index("gig_posts_clientId_idx").on(table.clientId),
}]);

export type GigPost = typeof gigPosts.$inferSelect;
export type InsertGigPost = typeof gigPosts.$inferInsert;

// Gig Applications Table
export const gigApplications = mysqlTable("gig_applications", {
  id: int("id").autoincrement().primaryKey(),
  gigPostId: int("gigPostId").notNull(),
  creativeId: int("creativeId").notNull(),
  proposedPrice: int("proposedPrice"), // in cents
  coverLetter: text("coverLetter"),
  portfolioLinks: text("portfolioLinks"), // JSON array
  status: mysqlEnum("status", ["pending", "accepted", "rejected", "withdrawn"]).default("pending"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => [{
  gigPostIdIdx: index("gig_applications_gigPostId_idx").on(table.gigPostId),
  creativeIdIdx: index("gig_applications_creativeId_idx").on(table.creativeId),
}]);

export type GigApplication = typeof gigApplications.$inferSelect;
export type InsertGigApplication = typeof gigApplications.$inferInsert;

// Payments/Transactions Table
export const transactions = mysqlTable("transactions", {
  id: int("id").autoincrement().primaryKey(),
  bookingId: int("bookingId"),
  gigPostId: int("gigPostId"),
  payerId: int("payerId").notNull(), // client
  payeeId: int("payeeId").notNull(), // creative
  amount: int("amount").notNull(), // in cents
  currency: varchar("currency", { length: 10 }).default("USD"),
  type: mysqlEnum("type", ["deposit", "full_payment", "refund"]).default("deposit"),
  paymentMethod: varchar("paymentMethod", { length: 50 }).notNull(), // paystack, stripe
  externalTransactionId: varchar("externalTransactionId", { length: 255 }),
  status: mysqlEnum("status", ["pending", "completed", "failed", "refunded"]).default("pending"),
  metadata: text("metadata"), // JSON for additional info
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => [{
  payerIdIdx: index("transactions_payerId_idx").on(table.payerId),
  payeeIdIdx: index("transactions_payeeId_idx").on(table.payeeId),
}]);

export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = typeof transactions.$inferInsert;

// Portfolio Items Table
export const portfolioItems = mysqlTable("portfolio_items", {
  id: int("id").autoincrement().primaryKey(),
  creativeId: int("creativeId").notNull(),
  title: varchar("title", { length: 255 }),
  description: text("description"),
  imageUrl: varchar("imageUrl", { length: 500 }),
  videoUrl: varchar("videoUrl", { length: 500 }),
  category: varchar("category", { length: 100 }),
  displayOrder: int("displayOrder").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => [{
  creativeIdIdx: index("portfolio_items_creativeId_idx").on(table.creativeId),
}]);

export type PortfolioItem = typeof portfolioItems.$inferSelect;
export type InsertPortfolioItem = typeof portfolioItems.$inferInsert;