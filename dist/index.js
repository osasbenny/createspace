// server/_core/index.ts
import "dotenv/config";
import express2 from "express";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";

// shared/const.ts
var COOKIE_NAME = "app_session_id";
var ONE_YEAR_MS = 1e3 * 60 * 60 * 24 * 365;
var AXIOS_TIMEOUT_MS = 3e4;
var UNAUTHED_ERR_MSG = "Please login (10001)";
var NOT_ADMIN_ERR_MSG = "You do not have required permission (10002)";

// server/db.ts
import { eq, or, and } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";

// drizzle/schema.ts
import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, boolean, index } from "drizzle-orm/mysql-core";
var users = mysqlTable("users", {
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
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull()
});
var creativeProfiles = mysqlTable("creative_profiles", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  businessName: varchar("businessName", { length: 255 }),
  bio: text("bio"),
  categories: text("categories"),
  // JSON array of categories
  location: varchar("location", { length: 255 }),
  latitude: varchar("latitude", { length: 50 }),
  longitude: varchar("longitude", { length: 50 }),
  basePrice: int("basePrice"),
  // in cents
  hourlyRate: int("hourlyRate"),
  // in cents
  profileImage: varchar("profileImage", { length: 500 }),
  coverImage: varchar("coverImage", { length: 500 }),
  averageRating: varchar("averageRating", { length: 10 }).default("0"),
  totalReviews: int("totalReviews").default(0),
  isVerified: boolean("isVerified").default(false),
  isActive: boolean("isActive").default(true),
  portfolio: text("portfolio"),
  // JSON array of portfolio items
  socialLinks: text("socialLinks"),
  // JSON object of social links
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
}, (table) => [{
  userIdIdx: index("creative_profiles_userId_idx").on(table.userId)
}]);
var bookings = mysqlTable("bookings", {
  id: int("id").autoincrement().primaryKey(),
  clientId: int("clientId").notNull(),
  creativeId: int("creativeId").notNull(),
  serviceType: varchar("serviceType", { length: 255 }),
  description: text("description"),
  bookingDate: varchar("bookingDate", { length: 50 }).notNull(),
  // ISO date string
  startTime: varchar("startTime", { length: 50 }).notNull(),
  // HH:mm format
  endTime: varchar("endTime", { length: 50 }).notNull(),
  // HH:mm format
  duration: int("duration"),
  // in minutes
  location: varchar("location", { length: 255 }),
  totalPrice: int("totalPrice").notNull(),
  // in cents
  depositAmount: int("depositAmount").notNull(),
  // in cents
  depositPaid: boolean("depositPaid").default(false),
  status: mysqlEnum("status", ["pending", "confirmed", "completed", "cancelled", "disputed"]).default("pending"),
  paymentMethod: varchar("paymentMethod", { length: 50 }),
  // paystack, stripe
  transactionId: varchar("transactionId", { length: 255 }),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
}, (table) => [{
  clientIdIdx: index("bookings_clientId_idx").on(table.clientId),
  creativeIdIdx: index("bookings_creativeId_idx").on(table.creativeId)
}]);
var availability = mysqlTable("availability", {
  id: int("id").autoincrement().primaryKey(),
  creativeId: int("creativeId").notNull(),
  date: varchar("date", { length: 50 }).notNull(),
  // ISO date string
  startTime: varchar("startTime", { length: 50 }).notNull(),
  // HH:mm
  endTime: varchar("endTime", { length: 50 }).notNull(),
  // HH:mm
  isBooked: boolean("isBooked").default(false),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
}, (table) => [{
  creativeIdIdx: index("availability_creativeId_idx").on(table.creativeId)
}]);
var conversations = mysqlTable("conversations", {
  id: int("id").autoincrement().primaryKey(),
  participantOneId: int("participantOneId").notNull(),
  participantTwoId: int("participantTwoId").notNull(),
  bookingId: int("bookingId"),
  lastMessage: text("lastMessage"),
  lastMessageAt: timestamp("lastMessageAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
}, (table) => [{
  participantOneIdx: index("conversations_participantOneId_idx").on(table.participantOneId),
  participantTwoIdx: index("conversations_participantTwoId_idx").on(table.participantTwoId)
}]);
var messages = mysqlTable("messages", {
  id: int("id").autoincrement().primaryKey(),
  conversationId: int("conversationId").notNull(),
  senderId: int("senderId").notNull(),
  content: text("content"),
  attachmentUrl: varchar("attachmentUrl", { length: 500 }),
  attachmentType: varchar("attachmentType", { length: 50 }),
  // image, file, video
  isRead: boolean("isRead").default(false),
  createdAt: timestamp("createdAt").defaultNow().notNull()
}, (table) => [{
  conversationIdIdx: index("messages_conversationId_idx").on(table.conversationId),
  senderIdIdx: index("messages_senderId_idx").on(table.senderId)
}]);
var deliverables = mysqlTable("deliverables", {
  id: int("id").autoincrement().primaryKey(),
  bookingId: int("bookingId").notNull(),
  creativeId: int("creativeId").notNull(),
  clientId: int("clientId").notNull(),
  title: varchar("title", { length: 255 }),
  description: text("description"),
  fileUrl: varchar("fileUrl", { length: 500 }),
  fileType: varchar("fileType", { length: 50 }),
  // image, video, pdf, zip
  fileSize: int("fileSize"),
  // in bytes
  downloadCount: int("downloadCount").default(0),
  uploadedAt: timestamp("uploadedAt").defaultNow().notNull(),
  expiresAt: timestamp("expiresAt"),
  // optional expiration
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
}, (table) => [{
  bookingIdIdx: index("deliverables_bookingId_idx").on(table.bookingId),
  creativeIdIdx: index("deliverables_creativeId_idx").on(table.creativeId)
}]);
var reviews = mysqlTable("reviews", {
  id: int("id").autoincrement().primaryKey(),
  bookingId: int("bookingId").notNull(),
  reviewerId: int("reviewerId").notNull(),
  // client
  creativeId: int("creativeId").notNull(),
  rating: int("rating").notNull(),
  // 1-5
  title: varchar("title", { length: 255 }),
  comment: text("comment"),
  isVerified: boolean("isVerified").default(true),
  // verified booking
  isPublished: boolean("isPublished").default(true),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
}, (table) => [{
  creativeIdIdx: index("reviews_creativeId_idx").on(table.creativeId),
  reviewerIdIdx: index("reviews_reviewerId_idx").on(table.reviewerId)
}]);
var gigPosts = mysqlTable("gig_posts", {
  id: int("id").autoincrement().primaryKey(),
  clientId: int("clientId").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  category: varchar("category", { length: 100 }),
  budget: int("budget"),
  // in cents
  location: varchar("location", { length: 255 }),
  deadline: varchar("deadline", { length: 50 }),
  // ISO date string
  status: mysqlEnum("status", ["open", "in_progress", "completed", "closed"]).default("open"),
  applicationsCount: int("applicationsCount").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
}, (table) => [{
  clientIdIdx: index("gig_posts_clientId_idx").on(table.clientId)
}]);
var gigApplications = mysqlTable("gig_applications", {
  id: int("id").autoincrement().primaryKey(),
  gigPostId: int("gigPostId").notNull(),
  creativeId: int("creativeId").notNull(),
  proposedPrice: int("proposedPrice"),
  // in cents
  coverLetter: text("coverLetter"),
  portfolioLinks: text("portfolioLinks"),
  // JSON array
  status: mysqlEnum("status", ["pending", "accepted", "rejected", "withdrawn"]).default("pending"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
}, (table) => [{
  gigPostIdIdx: index("gig_applications_gigPostId_idx").on(table.gigPostId),
  creativeIdIdx: index("gig_applications_creativeId_idx").on(table.creativeId)
}]);
var transactions = mysqlTable("transactions", {
  id: int("id").autoincrement().primaryKey(),
  bookingId: int("bookingId"),
  gigPostId: int("gigPostId"),
  payerId: int("payerId").notNull(),
  // client
  payeeId: int("payeeId").notNull(),
  // creative
  amount: int("amount").notNull(),
  // in cents
  currency: varchar("currency", { length: 10 }).default("USD"),
  type: mysqlEnum("type", ["deposit", "full_payment", "refund"]).default("deposit"),
  paymentMethod: varchar("paymentMethod", { length: 50 }).notNull(),
  // paystack, stripe
  externalTransactionId: varchar("externalTransactionId", { length: 255 }),
  status: mysqlEnum("status", ["pending", "completed", "failed", "refunded"]).default("pending"),
  metadata: text("metadata"),
  // JSON for additional info
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
}, (table) => [{
  payerIdIdx: index("transactions_payerId_idx").on(table.payerId),
  payeeIdIdx: index("transactions_payeeId_idx").on(table.payeeId)
}]);
var portfolioItems = mysqlTable("portfolio_items", {
  id: int("id").autoincrement().primaryKey(),
  creativeId: int("creativeId").notNull(),
  title: varchar("title", { length: 255 }),
  description: text("description"),
  imageUrl: varchar("imageUrl", { length: 500 }),
  videoUrl: varchar("videoUrl", { length: 500 }),
  category: varchar("category", { length: 100 }),
  displayOrder: int("displayOrder").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
}, (table) => [{
  creativeIdIdx: index("portfolio_items_creativeId_idx").on(table.creativeId)
}]);

// server/_core/env.ts
var ENV = {
  appId: process.env.VITE_APP_ID ?? "",
  cookieSecret: process.env.JWT_SECRET ?? "",
  databaseUrl: process.env.DATABASE_URL ?? "",
  oAuthServerUrl: process.env.OAUTH_SERVER_URL ?? "",
  ownerOpenId: process.env.OWNER_OPEN_ID ?? "",
  isProduction: process.env.NODE_ENV === "production",
  forgeApiUrl: process.env.BUILT_IN_FORGE_API_URL ?? "",
  forgeApiKey: process.env.BUILT_IN_FORGE_API_KEY ?? ""
};

// server/db.ts
var _db = null;
async function getDb() {
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
async function upsertUser(user) {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }
  try {
    const values = {
      openId: user.openId
    };
    const updateSet = {};
    const textFields = ["name", "email", "loginMethod"];
    const assignNullable = (field) => {
      const value = user[field];
      if (value === void 0) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };
    textFields.forEach(assignNullable);
    if (user.lastSignedIn !== void 0) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== void 0) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = "admin";
      updateSet.role = "admin";
    }
    if (!values.lastSignedIn) {
      values.lastSignedIn = /* @__PURE__ */ new Date();
    }
    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = /* @__PURE__ */ new Date();
    }
    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}
async function getUserByOpenId(openId) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return void 0;
  }
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : void 0;
}
async function getCreativeProfile(userId) {
  const db = await getDb();
  if (!db) return void 0;
  const result = await db.select().from(creativeProfiles).where(eq(creativeProfiles.userId, userId)).limit(1);
  return result.length > 0 ? result[0] : void 0;
}
async function getCreativeById(creativeId) {
  const db = await getDb();
  if (!db) return void 0;
  const result = await db.select().from(creativeProfiles).where(eq(creativeProfiles.id, creativeId)).limit(1);
  return result.length > 0 ? result[0] : void 0;
}
async function searchCreatives(filters) {
  const db = await getDb();
  if (!db) return [];
  let query = db.select().from(creativeProfiles).where(eq(creativeProfiles.isActive, true));
  const limit = filters.limit || 20;
  const offset = filters.offset || 0;
  const results = await query.limit(limit).offset(offset);
  return results;
}
async function getBookingsByClient(clientId) {
  const db = await getDb();
  if (!db) return [];
  const results = await db.select().from(bookings).where(eq(bookings.clientId, clientId));
  return results;
}
async function getBookingsByCreative(creativeId) {
  const db = await getDb();
  if (!db) return [];
  const results = await db.select().from(bookings).where(eq(bookings.creativeId, creativeId));
  return results;
}
async function getBookingById(bookingId) {
  const db = await getDb();
  if (!db) return void 0;
  const result = await db.select().from(bookings).where(eq(bookings.id, bookingId)).limit(1);
  return result.length > 0 ? result[0] : void 0;
}
async function getConversation(userId1, userId2) {
  const db = await getDb();
  if (!db) return void 0;
  const result = await db.select().from(conversations).where(
    or(
      and(eq(conversations.participantOneId, userId1), eq(conversations.participantTwoId, userId2)),
      and(eq(conversations.participantOneId, userId2), eq(conversations.participantTwoId, userId1))
    )
  ).limit(1);
  return result.length > 0 ? result[0] : void 0;
}
async function getConversationMessages(conversationId) {
  const db = await getDb();
  if (!db) return [];
  const results = await db.select().from(messages).where(eq(messages.conversationId, conversationId));
  return results;
}
async function getUserConversations(userId) {
  const db = await getDb();
  if (!db) return [];
  const result = await db.select().from(conversations).where(
    or(eq(conversations.participantOneId, userId), eq(conversations.participantTwoId, userId))
  );
  return result;
}
async function getCreativeReviews(creativeId) {
  const db = await getDb();
  if (!db) return [];
  const results = await db.select().from(reviews).where(eq(reviews.creativeId, creativeId));
  return results;
}
async function getAverageRating(creativeId) {
  const db = await getDb();
  if (!db) return 0;
  const result = await db.select().from(reviews).where(eq(reviews.creativeId, creativeId));
  if (result.length === 0) return 0;
  const sum = result.reduce((acc, r) => acc + r.rating, 0);
  return sum / result.length;
}
async function getBookingDeliverables(bookingId) {
  const db = await getDb();
  if (!db) return [];
  const results = await db.select().from(deliverables).where(eq(deliverables.bookingId, bookingId));
  return results;
}
async function getOpenGigPosts(limit, offset) {
  const db = await getDb();
  if (!db) return [];
  const query = db.select().from(gigPosts).where(eq(gigPosts.status, "open"));
  const results = await query.limit(limit || 20).offset(offset || 0);
  return results;
}
async function getGigApplications(gigPostId) {
  const db = await getDb();
  if (!db) return [];
  const results = await db.select().from(gigApplications).where(eq(gigApplications.gigPostId, gigPostId));
  return results;
}
async function getCreativePortfolio(creativeId) {
  const db = await getDb();
  if (!db) return [];
  const results = await db.select().from(portfolioItems).where(eq(portfolioItems.creativeId, creativeId));
  return results;
}
async function getTransactionsByUser(userId) {
  const db = await getDb();
  if (!db) return [];
  const results = await db.select().from(transactions).where(
    (t2) => eq(t2.payerId, userId) || eq(t2.payeeId, userId)
  );
  return results;
}

// server/_core/cookies.ts
function isSecureRequest(req) {
  if (req.protocol === "https") return true;
  const forwardedProto = req.headers["x-forwarded-proto"];
  if (!forwardedProto) return false;
  const protoList = Array.isArray(forwardedProto) ? forwardedProto : forwardedProto.split(",");
  return protoList.some((proto) => proto.trim().toLowerCase() === "https");
}
function getSessionCookieOptions(req) {
  return {
    httpOnly: true,
    path: "/",
    sameSite: "none",
    secure: isSecureRequest(req)
  };
}

// shared/_core/errors.ts
var HttpError = class extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
    this.name = "HttpError";
  }
};
var ForbiddenError = (msg) => new HttpError(403, msg);

// server/_core/sdk.ts
import axios from "axios";
import { parse as parseCookieHeader } from "cookie";
import { SignJWT, jwtVerify } from "jose";
var isNonEmptyString = (value) => typeof value === "string" && value.length > 0;
var EXCHANGE_TOKEN_PATH = `/webdev.v1.WebDevAuthPublicService/ExchangeToken`;
var GET_USER_INFO_PATH = `/webdev.v1.WebDevAuthPublicService/GetUserInfo`;
var GET_USER_INFO_WITH_JWT_PATH = `/webdev.v1.WebDevAuthPublicService/GetUserInfoWithJwt`;
var OAuthService = class {
  constructor(client) {
    this.client = client;
    console.log("[OAuth] Initialized with baseURL:", ENV.oAuthServerUrl);
    if (!ENV.oAuthServerUrl) {
      console.error(
        "[OAuth] ERROR: OAUTH_SERVER_URL is not configured! Set OAUTH_SERVER_URL environment variable."
      );
    }
  }
  decodeState(state) {
    const redirectUri = atob(state);
    return redirectUri;
  }
  async getTokenByCode(code, state) {
    const payload = {
      clientId: ENV.appId,
      grantType: "authorization_code",
      code,
      redirectUri: this.decodeState(state)
    };
    const { data } = await this.client.post(
      EXCHANGE_TOKEN_PATH,
      payload
    );
    return data;
  }
  async getUserInfoByToken(token) {
    const { data } = await this.client.post(
      GET_USER_INFO_PATH,
      {
        accessToken: token.accessToken
      }
    );
    return data;
  }
};
var createOAuthHttpClient = () => axios.create({
  baseURL: ENV.oAuthServerUrl,
  timeout: AXIOS_TIMEOUT_MS
});
var SDKServer = class {
  client;
  oauthService;
  constructor(client = createOAuthHttpClient()) {
    this.client = client;
    this.oauthService = new OAuthService(this.client);
  }
  deriveLoginMethod(platforms, fallback) {
    if (fallback && fallback.length > 0) return fallback;
    if (!Array.isArray(platforms) || platforms.length === 0) return null;
    const set = new Set(
      platforms.filter((p) => typeof p === "string")
    );
    if (set.has("REGISTERED_PLATFORM_EMAIL")) return "email";
    if (set.has("REGISTERED_PLATFORM_GOOGLE")) return "google";
    if (set.has("REGISTERED_PLATFORM_APPLE")) return "apple";
    if (set.has("REGISTERED_PLATFORM_MICROSOFT") || set.has("REGISTERED_PLATFORM_AZURE"))
      return "microsoft";
    if (set.has("REGISTERED_PLATFORM_GITHUB")) return "github";
    const first = Array.from(set)[0];
    return first ? first.toLowerCase() : null;
  }
  /**
   * Exchange OAuth authorization code for access token
   * @example
   * const tokenResponse = await sdk.exchangeCodeForToken(code, state);
   */
  async exchangeCodeForToken(code, state) {
    return this.oauthService.getTokenByCode(code, state);
  }
  /**
   * Get user information using access token
   * @example
   * const userInfo = await sdk.getUserInfo(tokenResponse.accessToken);
   */
  async getUserInfo(accessToken) {
    const data = await this.oauthService.getUserInfoByToken({
      accessToken
    });
    const loginMethod = this.deriveLoginMethod(
      data?.platforms,
      data?.platform ?? data.platform ?? null
    );
    return {
      ...data,
      platform: loginMethod,
      loginMethod
    };
  }
  parseCookies(cookieHeader) {
    if (!cookieHeader) {
      return /* @__PURE__ */ new Map();
    }
    const parsed = parseCookieHeader(cookieHeader);
    return new Map(Object.entries(parsed));
  }
  getSessionSecret() {
    const secret = ENV.cookieSecret;
    return new TextEncoder().encode(secret);
  }
  /**
   * Create a session token for a Manus user openId
   * @example
   * const sessionToken = await sdk.createSessionToken(userInfo.openId);
   */
  async createSessionToken(openId, options = {}) {
    return this.signSession(
      {
        openId,
        appId: ENV.appId,
        name: options.name || ""
      },
      options
    );
  }
  async signSession(payload, options = {}) {
    const issuedAt = Date.now();
    const expiresInMs = options.expiresInMs ?? ONE_YEAR_MS;
    const expirationSeconds = Math.floor((issuedAt + expiresInMs) / 1e3);
    const secretKey = this.getSessionSecret();
    return new SignJWT({
      openId: payload.openId,
      appId: payload.appId,
      name: payload.name
    }).setProtectedHeader({ alg: "HS256", typ: "JWT" }).setExpirationTime(expirationSeconds).sign(secretKey);
  }
  async verifySession(cookieValue) {
    if (!cookieValue) {
      console.warn("[Auth] Missing session cookie");
      return null;
    }
    try {
      const secretKey = this.getSessionSecret();
      const { payload } = await jwtVerify(cookieValue, secretKey, {
        algorithms: ["HS256"]
      });
      const { openId, appId, name } = payload;
      if (!isNonEmptyString(openId) || !isNonEmptyString(appId) || !isNonEmptyString(name)) {
        console.warn("[Auth] Session payload missing required fields");
        return null;
      }
      return {
        openId,
        appId,
        name
      };
    } catch (error) {
      console.warn("[Auth] Session verification failed", String(error));
      return null;
    }
  }
  async getUserInfoWithJwt(jwtToken) {
    const payload = {
      jwtToken,
      projectId: ENV.appId
    };
    const { data } = await this.client.post(
      GET_USER_INFO_WITH_JWT_PATH,
      payload
    );
    const loginMethod = this.deriveLoginMethod(
      data?.platforms,
      data?.platform ?? data.platform ?? null
    );
    return {
      ...data,
      platform: loginMethod,
      loginMethod
    };
  }
  async authenticateRequest(req) {
    const cookies = this.parseCookies(req.headers.cookie);
    const sessionCookie = cookies.get(COOKIE_NAME);
    const session = await this.verifySession(sessionCookie);
    if (!session) {
      throw ForbiddenError("Invalid session cookie");
    }
    const sessionUserId = session.openId;
    const signedInAt = /* @__PURE__ */ new Date();
    let user = await getUserByOpenId(sessionUserId);
    if (!user) {
      try {
        const userInfo = await this.getUserInfoWithJwt(sessionCookie ?? "");
        await upsertUser({
          openId: userInfo.openId,
          name: userInfo.name || null,
          email: userInfo.email ?? null,
          loginMethod: userInfo.loginMethod ?? userInfo.platform ?? null,
          lastSignedIn: signedInAt
        });
        user = await getUserByOpenId(userInfo.openId);
      } catch (error) {
        console.error("[Auth] Failed to sync user from OAuth:", error);
        throw ForbiddenError("Failed to sync user info");
      }
    }
    if (!user) {
      throw ForbiddenError("User not found");
    }
    await upsertUser({
      openId: user.openId,
      lastSignedIn: signedInAt
    });
    return user;
  }
};
var sdk = new SDKServer();

// server/_core/oauth.ts
function getQueryParam(req, key) {
  const value = req.query[key];
  return typeof value === "string" ? value : void 0;
}
function registerOAuthRoutes(app) {
  app.get("/api/oauth/callback", async (req, res) => {
    const code = getQueryParam(req, "code");
    const state = getQueryParam(req, "state");
    if (!code || !state) {
      res.status(400).json({ error: "code and state are required" });
      return;
    }
    try {
      const tokenResponse = await sdk.exchangeCodeForToken(code, state);
      const userInfo = await sdk.getUserInfo(tokenResponse.accessToken);
      if (!userInfo.openId) {
        res.status(400).json({ error: "openId missing from user info" });
        return;
      }
      await upsertUser({
        openId: userInfo.openId,
        name: userInfo.name || null,
        email: userInfo.email ?? null,
        loginMethod: userInfo.loginMethod ?? userInfo.platform ?? null,
        lastSignedIn: /* @__PURE__ */ new Date()
      });
      const sessionToken = await sdk.createSessionToken(userInfo.openId, {
        name: userInfo.name || "",
        expiresInMs: ONE_YEAR_MS
      });
      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });
      res.redirect(302, "/");
    } catch (error) {
      console.error("[OAuth] Callback failed", error);
      res.status(500).json({ error: "OAuth callback failed" });
    }
  });
}

// server/_core/systemRouter.ts
import { z } from "zod";

// server/_core/notification.ts
import { TRPCError } from "@trpc/server";
var TITLE_MAX_LENGTH = 1200;
var CONTENT_MAX_LENGTH = 2e4;
var trimValue = (value) => value.trim();
var isNonEmptyString2 = (value) => typeof value === "string" && value.trim().length > 0;
var buildEndpointUrl = (baseUrl) => {
  const normalizedBase = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
  return new URL(
    "webdevtoken.v1.WebDevService/SendNotification",
    normalizedBase
  ).toString();
};
var validatePayload = (input) => {
  if (!isNonEmptyString2(input.title)) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Notification title is required."
    });
  }
  if (!isNonEmptyString2(input.content)) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Notification content is required."
    });
  }
  const title = trimValue(input.title);
  const content = trimValue(input.content);
  if (title.length > TITLE_MAX_LENGTH) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Notification title must be at most ${TITLE_MAX_LENGTH} characters.`
    });
  }
  if (content.length > CONTENT_MAX_LENGTH) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Notification content must be at most ${CONTENT_MAX_LENGTH} characters.`
    });
  }
  return { title, content };
};
async function notifyOwner(payload) {
  const { title, content } = validatePayload(payload);
  if (!ENV.forgeApiUrl) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Notification service URL is not configured."
    });
  }
  if (!ENV.forgeApiKey) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Notification service API key is not configured."
    });
  }
  const endpoint = buildEndpointUrl(ENV.forgeApiUrl);
  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        accept: "application/json",
        authorization: `Bearer ${ENV.forgeApiKey}`,
        "content-type": "application/json",
        "connect-protocol-version": "1"
      },
      body: JSON.stringify({ title, content })
    });
    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      console.warn(
        `[Notification] Failed to notify owner (${response.status} ${response.statusText})${detail ? `: ${detail}` : ""}`
      );
      return false;
    }
    return true;
  } catch (error) {
    console.warn("[Notification] Error calling notification service:", error);
    return false;
  }
}

// server/_core/trpc.ts
import { initTRPC, TRPCError as TRPCError2 } from "@trpc/server";
import superjson from "superjson";
var t = initTRPC.context().create({
  transformer: superjson
});
var router = t.router;
var publicProcedure = t.procedure;
var requireUser = t.middleware(async (opts) => {
  const { ctx, next } = opts;
  if (!ctx.user) {
    throw new TRPCError2({ code: "UNAUTHORIZED", message: UNAUTHED_ERR_MSG });
  }
  return next({
    ctx: {
      ...ctx,
      user: ctx.user
    }
  });
});
var protectedProcedure = t.procedure.use(requireUser);
var adminProcedure = t.procedure.use(
  t.middleware(async (opts) => {
    const { ctx, next } = opts;
    if (!ctx.user || ctx.user.role !== "admin") {
      throw new TRPCError2({ code: "FORBIDDEN", message: NOT_ADMIN_ERR_MSG });
    }
    return next({
      ctx: {
        ...ctx,
        user: ctx.user
      }
    });
  })
);

// server/_core/systemRouter.ts
var systemRouter = router({
  health: publicProcedure.input(
    z.object({
      timestamp: z.number().min(0, "timestamp cannot be negative")
    })
  ).query(() => ({
    ok: true
  })),
  notifyOwner: adminProcedure.input(
    z.object({
      title: z.string().min(1, "title is required"),
      content: z.string().min(1, "content is required")
    })
  ).mutation(async ({ input }) => {
    const delivered = await notifyOwner(input);
    return {
      success: delivered
    };
  })
});

// server/routers/ai.ts
import { z as z2 } from "zod";

// server/_core/llm.ts
var ensureArray = (value) => Array.isArray(value) ? value : [value];
var normalizeContentPart = (part) => {
  if (typeof part === "string") {
    return { type: "text", text: part };
  }
  if (part.type === "text") {
    return part;
  }
  if (part.type === "image_url") {
    return part;
  }
  if (part.type === "file_url") {
    return part;
  }
  throw new Error("Unsupported message content part");
};
var normalizeMessage = (message) => {
  const { role, name, tool_call_id } = message;
  if (role === "tool" || role === "function") {
    const content = ensureArray(message.content).map((part) => typeof part === "string" ? part : JSON.stringify(part)).join("\n");
    return {
      role,
      name,
      tool_call_id,
      content
    };
  }
  const contentParts = ensureArray(message.content).map(normalizeContentPart);
  if (contentParts.length === 1 && contentParts[0].type === "text") {
    return {
      role,
      name,
      content: contentParts[0].text
    };
  }
  return {
    role,
    name,
    content: contentParts
  };
};
var normalizeToolChoice = (toolChoice, tools) => {
  if (!toolChoice) return void 0;
  if (toolChoice === "none" || toolChoice === "auto") {
    return toolChoice;
  }
  if (toolChoice === "required") {
    if (!tools || tools.length === 0) {
      throw new Error(
        "tool_choice 'required' was provided but no tools were configured"
      );
    }
    if (tools.length > 1) {
      throw new Error(
        "tool_choice 'required' needs a single tool or specify the tool name explicitly"
      );
    }
    return {
      type: "function",
      function: { name: tools[0].function.name }
    };
  }
  if ("name" in toolChoice) {
    return {
      type: "function",
      function: { name: toolChoice.name }
    };
  }
  return toolChoice;
};
var resolveApiUrl = () => ENV.forgeApiUrl && ENV.forgeApiUrl.trim().length > 0 ? `${ENV.forgeApiUrl.replace(/\/$/, "")}/v1/chat/completions` : "https://forge.manus.im/v1/chat/completions";
var assertApiKey = () => {
  if (!ENV.forgeApiKey) {
    throw new Error("OPENAI_API_KEY is not configured");
  }
};
var normalizeResponseFormat = ({
  responseFormat,
  response_format,
  outputSchema,
  output_schema
}) => {
  const explicitFormat = responseFormat || response_format;
  if (explicitFormat) {
    if (explicitFormat.type === "json_schema" && !explicitFormat.json_schema?.schema) {
      throw new Error(
        "responseFormat json_schema requires a defined schema object"
      );
    }
    return explicitFormat;
  }
  const schema = outputSchema || output_schema;
  if (!schema) return void 0;
  if (!schema.name || !schema.schema) {
    throw new Error("outputSchema requires both name and schema");
  }
  return {
    type: "json_schema",
    json_schema: {
      name: schema.name,
      schema: schema.schema,
      ...typeof schema.strict === "boolean" ? { strict: schema.strict } : {}
    }
  };
};
async function invokeLLM(params) {
  assertApiKey();
  const {
    messages: messages2,
    tools,
    toolChoice,
    tool_choice,
    outputSchema,
    output_schema,
    responseFormat,
    response_format
  } = params;
  const payload = {
    model: "gemini-2.5-flash",
    messages: messages2.map(normalizeMessage)
  };
  if (tools && tools.length > 0) {
    payload.tools = tools;
  }
  const normalizedToolChoice = normalizeToolChoice(
    toolChoice || tool_choice,
    tools
  );
  if (normalizedToolChoice) {
    payload.tool_choice = normalizedToolChoice;
  }
  payload.max_tokens = 32768;
  payload.thinking = {
    "budget_tokens": 128
  };
  const normalizedResponseFormat = normalizeResponseFormat({
    responseFormat,
    response_format,
    outputSchema,
    output_schema
  });
  if (normalizedResponseFormat) {
    payload.response_format = normalizedResponseFormat;
  }
  const response = await fetch(resolveApiUrl(), {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${ENV.forgeApiKey}`
    },
    body: JSON.stringify(payload)
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `LLM invoke failed: ${response.status} ${response.statusText} \u2013 ${errorText}`
    );
  }
  return await response.json();
}

// server/routers/ai.ts
var aiRouter = router({
  // Generate pricing suggestions based on service type and experience
  generatePricingSuggestion: protectedProcedure.input(z2.object({
    serviceType: z2.string(),
    experience: z2.string().optional(),
    location: z2.string().optional()
  })).mutation(async ({ input }) => {
    const prompt = `You are a pricing expert for creative services. Based on the following information, provide realistic pricing suggestions:
      
Service Type: ${input.serviceType}
Experience Level: ${input.experience || "Not specified"}
Location: ${input.location || "Not specified"}

Provide pricing in JSON format with fields: basePrice (in USD), hourlyRate (in USD), depositPercentage (0-100), and reasoning.`;
    const response = await invokeLLM({
      messages: [
        { role: "system", content: "You are a pricing expert for creative services. Always respond with valid JSON." },
        { role: "user", content: prompt }
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "pricing_suggestion",
          strict: true,
          schema: {
            type: "object",
            properties: {
              basePrice: { type: "number", description: "Suggested base price in USD" },
              hourlyRate: { type: "number", description: "Suggested hourly rate in USD" },
              depositPercentage: { type: "number", description: "Suggested deposit percentage" },
              reasoning: { type: "string", description: "Explanation for pricing" }
            },
            required: ["basePrice", "hourlyRate", "depositPercentage", "reasoning"],
            additionalProperties: false
          }
        }
      }
    });
    try {
      const content = response.choices[0].message.content;
      const contentStr = typeof content === "string" ? content : JSON.stringify(content);
      return JSON.parse(contentStr);
    } catch (error) {
      return {
        basePrice: 500,
        hourlyRate: 75,
        depositPercentage: 50,
        reasoning: "Default pricing. Please adjust based on your experience and market."
      };
    }
  }),
  // Generate portfolio captions for images
  generateCaption: protectedProcedure.input(z2.object({
    serviceType: z2.string(),
    description: z2.string().optional(),
    style: z2.enum(["professional", "casual", "creative"]).optional()
  })).mutation(async ({ input }) => {
    const prompt = `Generate a compelling portfolio caption for a ${input.serviceType} professional. 
Description: ${input.description || "Not provided"}
Style: ${input.style || "professional"}

The caption should be engaging, highlight the work quality, and encourage potential clients to book. Keep it under 150 words.`;
    const response = await invokeLLM({
      messages: [
        { role: "system", content: "You are a creative copywriter specializing in portfolio captions." },
        { role: "user", content: prompt }
      ]
    });
    return {
      caption: response.choices[0].message.content
    };
  }),
  // Generate response templates for client inquiries
  generateResponseTemplate: protectedProcedure.input(z2.object({
    inquiryType: z2.enum(["availability", "pricing", "customization", "general"]),
    context: z2.string().optional()
  })).mutation(async ({ input }) => {
    const inquiryDescriptions = {
      availability: "client asking about availability",
      pricing: "client asking about pricing",
      customization: "client asking about custom services",
      general: "general client inquiry"
    };
    const prompt = `Generate a professional response template for a ${inquiryDescriptions[input.inquiryType]}.
Context: ${input.context || "Not provided"}

The response should be:
- Professional and friendly
- Clear and concise
- Include a call-to-action
- Be customizable by the creative

Provide the template with [PLACEHOLDER] for areas the creative should customize.`;
    const response = await invokeLLM({
      messages: [
        { role: "system", content: "You are a professional communication expert helping creatives respond to clients." },
        { role: "user", content: prompt }
      ]
    });
    return {
      template: response.choices[0].message.content
    };
  }),
  // Generate profile bio
  generateProfileBio: protectedProcedure.input(z2.object({
    name: z2.string(),
    serviceType: z2.string(),
    experience: z2.string().optional(),
    specialties: z2.string().optional(),
    style: z2.enum(["professional", "creative", "friendly"]).optional()
  })).mutation(async ({ input }) => {
    const prompt = `Create a compelling professional bio for ${input.name}, a ${input.serviceType}.
Experience: ${input.experience || "Not specified"}
Specialties: ${input.specialties || "Not specified"}
Tone: ${input.style || "professional"}

The bio should:
- Be 100-150 words
- Highlight unique value proposition
- Include relevant experience or achievements
- End with a call-to-action
- Be suitable for a portfolio website`;
    const response = await invokeLLM({
      messages: [
        { role: "system", content: "You are an expert at writing compelling professional bios for creatives." },
        { role: "user", content: prompt }
      ]
    });
    return {
      bio: response.choices[0].message.content
    };
  }),
  // Generate service description
  generateServiceDescription: protectedProcedure.input(z2.object({
    serviceName: z2.string(),
    details: z2.string().optional(),
    targetAudience: z2.string().optional()
  })).mutation(async ({ input }) => {
    const prompt = `Create a compelling service description for "${input.serviceName}".
Details: ${input.details || "Not provided"}
Target Audience: ${input.targetAudience || "General"}

The description should:
- Clearly explain what the service includes
- Highlight benefits for the client
- Be 75-150 words
- Use engaging language
- Include what to expect`;
    const response = await invokeLLM({
      messages: [
        { role: "system", content: "You are an expert at writing service descriptions that convert." },
        { role: "user", content: prompt }
      ]
    });
    return {
      description: response.choices[0].message.content
    };
  }),
  // Analyze and suggest improvements to profile
  analyzeProfile: protectedProcedure.input(z2.object({
    bio: z2.string().optional(),
    serviceTypes: z2.string().optional(),
    portfolioCount: z2.number().optional(),
    reviewCount: z2.number().optional()
  })).mutation(async ({ input }) => {
    const prompt = `Analyze this creative professional's profile and suggest improvements:
Bio: ${input.bio || "Not provided"}
Service Types: ${input.serviceTypes || "Not specified"}
Portfolio Items: ${input.portfolioCount || 0}
Reviews: ${input.reviewCount || 0}

Provide specific, actionable suggestions in JSON format with fields: strengths (array), improvements (array), and priority (high/medium/low).`;
    const response = await invokeLLM({
      messages: [
        { role: "system", content: "You are an expert profile optimizer for creative professionals." },
        { role: "user", content: prompt }
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "profile_analysis",
          strict: true,
          schema: {
            type: "object",
            properties: {
              strengths: { type: "array", items: { type: "string" } },
              improvements: { type: "array", items: { type: "string" } },
              priority: { type: "string", enum: ["high", "medium", "low"] }
            },
            required: ["strengths", "improvements", "priority"],
            additionalProperties: false
          }
        }
      }
    });
    try {
      const content = response.choices[0].message.content;
      const contentStr = typeof content === "string" ? content : JSON.stringify(content);
      return JSON.parse(contentStr);
    } catch (error) {
      return {
        strengths: ["Profile exists"],
        improvements: ["Add more portfolio items", "Encourage client reviews"],
        priority: "medium"
      };
    }
  })
});

// server/routers.ts
import { z as z3 } from "zod";
import { eq as eq2 } from "drizzle-orm";
var appRouter = router({
  system: systemRouter,
  ai: aiRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true
      };
    })
  }),
  // Creative Profile Routes
  creative: router({
    getProfile: protectedProcedure.query(async ({ ctx }) => {
      return await getCreativeProfile(ctx.user.id);
    }),
    getById: publicProcedure.input(z3.object({ id: z3.number() })).query(async ({ input }) => {
      return await getCreativeById(input.id);
    }),
    updateProfile: protectedProcedure.input(z3.object({
      businessName: z3.string().optional(),
      bio: z3.string().optional(),
      categories: z3.string().optional(),
      location: z3.string().optional(),
      basePrice: z3.number().optional(),
      hourlyRate: z3.number().optional(),
      profileImage: z3.string().optional(),
      coverImage: z3.string().optional()
    })).mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const existing = await getCreativeProfile(ctx.user.id);
      if (existing) {
        await db.update(creativeProfiles).set({ ...input, updatedAt: /* @__PURE__ */ new Date() }).where(eq2(creativeProfiles.userId, ctx.user.id));
      } else {
        await db.insert(creativeProfiles).values({
          userId: ctx.user.id,
          ...input
        });
      }
      return await getCreativeProfile(ctx.user.id);
    }),
    search: publicProcedure.input(z3.object({
      category: z3.string().optional(),
      location: z3.string().optional(),
      minRating: z3.number().optional(),
      limit: z3.number().optional(),
      offset: z3.number().optional()
    })).query(async ({ input }) => {
      return await searchCreatives(input);
    })
  }),
  // Booking Routes
  booking: router({
    create: protectedProcedure.input(z3.object({
      creativeId: z3.number(),
      serviceType: z3.string(),
      description: z3.string().optional(),
      bookingDate: z3.string(),
      startTime: z3.string(),
      endTime: z3.string(),
      location: z3.string().optional(),
      totalPrice: z3.number(),
      depositAmount: z3.number()
    })).mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const duration = Math.round(((/* @__PURE__ */ new Date(`2024-01-01 ${input.endTime}`)).getTime() - (/* @__PURE__ */ new Date(`2024-01-01 ${input.startTime}`)).getTime()) / 6e4);
      const result = await db.insert(bookings).values({
        clientId: ctx.user.id,
        creativeId: input.creativeId,
        serviceType: input.serviceType,
        description: input.description,
        bookingDate: input.bookingDate,
        startTime: input.startTime,
        endTime: input.endTime,
        duration,
        location: input.location,
        totalPrice: input.totalPrice,
        depositAmount: input.depositAmount,
        status: "pending"
      });
      return result;
    }),
    getMyBookings: protectedProcedure.query(async ({ ctx }) => {
      return await getBookingsByClient(ctx.user.id);
    }),
    getCreativeBookings: protectedProcedure.query(async ({ ctx }) => {
      const profile = await getCreativeProfile(ctx.user.id);
      if (!profile) return [];
      return await getBookingsByCreative(profile.id);
    }),
    getById: publicProcedure.input(z3.object({ id: z3.number() })).query(async ({ input }) => {
      return await getBookingById(input.id);
    }),
    updateStatus: protectedProcedure.input(z3.object({
      bookingId: z3.number(),
      status: z3.enum(["pending", "confirmed", "completed", "cancelled", "disputed"])
    })).mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const booking = await getBookingById(input.bookingId);
      if (!booking) throw new Error("Booking not found");
      if (booking.creativeId !== ctx.user.id && booking.clientId !== ctx.user.id) {
        throw new Error("Unauthorized");
      }
      await db.update(bookings).set({ status: input.status, updatedAt: /* @__PURE__ */ new Date() }).where(eq2(bookings.id, input.bookingId));
      return await getBookingById(input.bookingId);
    })
  }),
  // Messaging Routes
  messaging: router({
    getConversations: protectedProcedure.query(async ({ ctx }) => {
      return await getUserConversations(ctx.user.id);
    }),
    getMessages: protectedProcedure.input(z3.object({ conversationId: z3.number() })).query(async ({ input }) => {
      return await getConversationMessages(input.conversationId);
    }),
    sendMessage: protectedProcedure.input(z3.object({
      conversationId: z3.number(),
      content: z3.string(),
      attachmentUrl: z3.string().optional(),
      attachmentType: z3.string().optional()
    })).mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const result = await db.insert(messages).values({
        conversationId: input.conversationId,
        senderId: ctx.user.id,
        content: input.content,
        attachmentUrl: input.attachmentUrl,
        attachmentType: input.attachmentType,
        isRead: false
      });
      return result;
    }),
    startConversation: protectedProcedure.input(z3.object({
      otherUserId: z3.number(),
      bookingId: z3.number().optional()
    })).mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      let conversation = await getConversation(ctx.user.id, input.otherUserId);
      if (!conversation) {
        const result = await db.insert(conversations).values({
          participantOneId: ctx.user.id,
          participantTwoId: input.otherUserId,
          bookingId: input.bookingId
        });
        conversation = await getConversation(ctx.user.id, input.otherUserId);
      }
      return conversation;
    })
  }),
  // Deliverables Routes
  deliverable: router({
    getByBooking: publicProcedure.input(z3.object({ bookingId: z3.number() })).query(async ({ input }) => {
      return await getBookingDeliverables(input.bookingId);
    }),
    upload: protectedProcedure.input(z3.object({
      bookingId: z3.number(),
      title: z3.string(),
      description: z3.string().optional(),
      fileUrl: z3.string(),
      fileType: z3.string(),
      fileSize: z3.number()
    })).mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const booking = await getBookingById(input.bookingId);
      if (!booking) throw new Error("Booking not found");
      if (booking.creativeId !== ctx.user.id) {
        throw new Error("Unauthorized");
      }
      const result = await db.insert(deliverables).values({
        bookingId: input.bookingId,
        creativeId: ctx.user.id,
        clientId: booking.clientId,
        title: input.title,
        description: input.description,
        fileUrl: input.fileUrl,
        fileType: input.fileType,
        fileSize: input.fileSize
      });
      return result;
    })
  }),
  // Reviews & Ratings Routes
  review: router({
    getCreativeReviews: publicProcedure.input(z3.object({ creativeId: z3.number() })).query(async ({ input }) => {
      return await getCreativeReviews(input.creativeId);
    }),
    getAverageRating: publicProcedure.input(z3.object({ creativeId: z3.number() })).query(async ({ input }) => {
      return await getAverageRating(input.creativeId);
    }),
    create: protectedProcedure.input(z3.object({
      bookingId: z3.number(),
      creativeId: z3.number(),
      rating: z3.number().min(1).max(5),
      title: z3.string().optional(),
      comment: z3.string().optional()
    })).mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const booking = await getBookingById(input.bookingId);
      if (!booking || booking.clientId !== ctx.user.id) {
        throw new Error("Unauthorized");
      }
      const result = await db.insert(reviews).values({
        bookingId: input.bookingId,
        reviewerId: ctx.user.id,
        creativeId: input.creativeId,
        rating: input.rating,
        title: input.title,
        comment: input.comment,
        isVerified: true
      });
      return result;
    })
  }),
  // Gig Board Routes
  gig: router({
    listPosts: publicProcedure.input(z3.object({
      limit: z3.number().optional(),
      offset: z3.number().optional()
    })).query(async ({ input }) => {
      return await getOpenGigPosts(input.limit, input.offset);
    }),
    createPost: protectedProcedure.input(z3.object({
      title: z3.string(),
      description: z3.string(),
      category: z3.string(),
      budget: z3.number(),
      location: z3.string().optional(),
      deadline: z3.string()
    })).mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const result = await db.insert(gigPosts).values({
        clientId: ctx.user.id,
        title: input.title,
        description: input.description,
        category: input.category,
        budget: input.budget,
        location: input.location,
        deadline: input.deadline,
        status: "open"
      });
      return result;
    }),
    applyForGig: protectedProcedure.input(z3.object({
      gigPostId: z3.number(),
      proposedPrice: z3.number(),
      coverLetter: z3.string().optional(),
      portfolioLinks: z3.string().optional()
    })).mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const result = await db.insert(gigApplications).values({
        gigPostId: input.gigPostId,
        creativeId: ctx.user.id,
        proposedPrice: input.proposedPrice,
        coverLetter: input.coverLetter,
        portfolioLinks: input.portfolioLinks,
        status: "pending"
      });
      return result;
    }),
    getApplications: protectedProcedure.input(z3.object({ gigPostId: z3.number() })).query(async ({ input }) => {
      return await getGigApplications(input.gigPostId);
    })
  }),
  // Portfolio Routes
  portfolio: router({
    getCreativePortfolio: publicProcedure.input(z3.object({ creativeId: z3.number() })).query(async ({ input }) => {
      return await getCreativePortfolio(input.creativeId);
    }),
    addItem: protectedProcedure.input(z3.object({
      title: z3.string(),
      description: z3.string().optional(),
      imageUrl: z3.string().optional(),
      videoUrl: z3.string().optional(),
      category: z3.string()
    })).mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const profile = await getCreativeProfile(ctx.user.id);
      if (!profile) throw new Error("Creative profile not found");
      const result = await db.insert(portfolioItems).values({
        creativeId: profile.id,
        title: input.title,
        description: input.description,
        imageUrl: input.imageUrl,
        videoUrl: input.videoUrl,
        category: input.category
      });
      return result;
    })
  }),
  // Payment Routes
  payment: router({
    getTransactions: protectedProcedure.query(async ({ ctx }) => {
      return await getTransactionsByUser(ctx.user.id);
    }),
    initiatePayment: protectedProcedure.input(z3.object({
      bookingId: z3.number(),
      amount: z3.number(),
      paymentMethod: z3.enum(["paystack", "stripe"])
    })).mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const booking = await getBookingById(input.bookingId);
      if (!booking || booking.clientId !== ctx.user.id) {
        throw new Error("Unauthorized");
      }
      const result = await db.insert(transactions).values({
        bookingId: input.bookingId,
        payerId: ctx.user.id,
        payeeId: booking.creativeId,
        amount: input.amount,
        type: "deposit",
        paymentMethod: input.paymentMethod,
        status: "pending"
      });
      return result;
    })
  }),
  // Availability Routes
  availability: router({
    getCreativeAvailability: publicProcedure.input(z3.object({ creativeId: z3.number() })).query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      const results = await db.select().from(availability).where(eq2(availability.creativeId, input.creativeId));
      return results;
    }),
    addAvailability: protectedProcedure.input(z3.object({
      date: z3.string(),
      startTime: z3.string(),
      endTime: z3.string()
    })).mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const profile = await getCreativeProfile(ctx.user.id);
      if (!profile) throw new Error("Creative profile not found");
      const result = await db.insert(availability).values({
        creativeId: profile.id,
        date: input.date,
        startTime: input.startTime,
        endTime: input.endTime,
        isBooked: false
      });
      return result;
    })
  })
});

// server/_core/context.ts
async function createContext(opts) {
  let user = null;
  try {
    user = await sdk.authenticateRequest(opts.req);
  } catch (error) {
    user = null;
  }
  return {
    req: opts.req,
    res: opts.res,
    user
  };
}

// server/_core/vite.ts
import express from "express";
import fs from "fs";
import { nanoid } from "nanoid";
import path2 from "path";
import { createServer as createViteServer } from "vite";

// vite.config.ts
import { jsxLocPlugin } from "@builder.io/vite-plugin-jsx-loc";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig } from "vite";
import { vitePluginManusRuntime } from "vite-plugin-manus-runtime";
var plugins = [react(), tailwindcss(), jsxLocPlugin(), vitePluginManusRuntime()];
var vite_config_default = defineConfig({
  plugins,
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets")
    }
  },
  envDir: path.resolve(import.meta.dirname),
  root: path.resolve(import.meta.dirname, "client"),
  publicDir: path.resolve(import.meta.dirname, "client", "public"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true
  },
  server: {
    host: true,
    allowedHosts: [
      ".manuspre.computer",
      ".manus.computer",
      ".manus-asia.computer",
      ".manuscomputer.ai",
      ".manusvm.computer",
      "localhost",
      "127.0.0.1"
    ],
    fs: {
      strict: true,
      deny: ["**/.*"]
    }
  }
});

// server/_core/vite.ts
async function setupVite(app, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    server: serverOptions,
    appType: "custom"
  });
  app.use(vite.middlewares);
  app.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(
        import.meta.dirname,
        "../..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app) {
  const distPath = process.env.NODE_ENV === "development" ? path2.resolve(import.meta.dirname, "../..", "dist", "public") : path2.resolve(import.meta.dirname, "public");
  if (!fs.existsSync(distPath)) {
    console.error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app.use(express.static(distPath));
  app.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// server/_core/index.ts
function isPortAvailable(port) {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}
async function findAvailablePort(startPort = 3e3) {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}
async function startServer() {
  const app = express2();
  const server = createServer(app);
  app.use(express2.json({ limit: "50mb" }));
  app.use(express2.urlencoded({ limit: "50mb", extended: true }));
  registerOAuthRoutes(app);
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext
    })
  );
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);
  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }
  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}
startServer().catch(console.error);
