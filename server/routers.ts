import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import { 
  getCreativeProfile, 
  getCreativeById, 
  searchCreatives,
  getBookingsByClient,
  getBookingsByCreative,
  getBookingById,
  getConversation,
  getConversationMessages,
  getUserConversations,
  getCreativeReviews,
  getAverageRating,
  getBookingDeliverables,
  getOpenGigPosts,
  getGigApplications,
  getCreativePortfolio,
  getTransactionsByUser,
  getDb,
  upsertUser
} from "./db";
import { creativeProfiles, bookings, conversations, messages, deliverables, reviews, gigPosts, gigApplications, portfolioItems, transactions, availability } from "../drizzle/schema";
import { eq } from "drizzle-orm";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // Creative Profile Routes
  creative: router({
    getProfile: protectedProcedure
      .query(async ({ ctx }) => {
        return await getCreativeProfile(ctx.user.id);
      }),

    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await getCreativeById(input.id);
      }),

    updateProfile: protectedProcedure
      .input(z.object({
        businessName: z.string().optional(),
        bio: z.string().optional(),
        categories: z.string().optional(),
        location: z.string().optional(),
        basePrice: z.number().optional(),
        hourlyRate: z.number().optional(),
        profileImage: z.string().optional(),
        coverImage: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        const existing = await getCreativeProfile(ctx.user.id);
        
        if (existing) {
          await db.update(creativeProfiles)
            .set({ ...input, updatedAt: new Date() })
            .where(eq(creativeProfiles.userId, ctx.user.id));
        } else {
          await db.insert(creativeProfiles).values({
            userId: ctx.user.id,
            ...input,
          });
        }

        return await getCreativeProfile(ctx.user.id);
      }),

    search: publicProcedure
      .input(z.object({
        category: z.string().optional(),
        location: z.string().optional(),
        minRating: z.number().optional(),
        limit: z.number().optional(),
        offset: z.number().optional(),
      }))
      .query(async ({ input }) => {
        return await searchCreatives(input);
      }),
  }),

  // Booking Routes
  booking: router({
    create: protectedProcedure
      .input(z.object({
        creativeId: z.number(),
        serviceType: z.string(),
        description: z.string().optional(),
        bookingDate: z.string(),
        startTime: z.string(),
        endTime: z.string(),
        location: z.string().optional(),
        totalPrice: z.number(),
        depositAmount: z.number(),
      }))
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        const duration = Math.round((new Date(`2024-01-01 ${input.endTime}`).getTime() - 
                                   new Date(`2024-01-01 ${input.startTime}`).getTime()) / 60000);

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
          status: "pending",
        });

        return result;
      }),

    getMyBookings: protectedProcedure
      .query(async ({ ctx }) => {
        return await getBookingsByClient(ctx.user.id);
      }),

    getCreativeBookings: protectedProcedure
      .query(async ({ ctx }) => {
        const profile = await getCreativeProfile(ctx.user.id);
        if (!profile) return [];
        return await getBookingsByCreative(profile.id);
      }),

    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await getBookingById(input.id);
      }),

    updateStatus: protectedProcedure
      .input(z.object({
        bookingId: z.number(),
        status: z.enum(["pending", "confirmed", "completed", "cancelled", "disputed"]),
      }))
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        const booking = await getBookingById(input.bookingId);
        if (!booking) throw new Error("Booking not found");

        if (booking.creativeId !== ctx.user.id && booking.clientId !== ctx.user.id) {
          throw new Error("Unauthorized");
        }

        await db.update(bookings)
          .set({ status: input.status, updatedAt: new Date() })
          .where(eq(bookings.id, input.bookingId));

        return await getBookingById(input.bookingId);
      }),
  }),

  // Messaging Routes
  messaging: router({
    getConversations: protectedProcedure
      .query(async ({ ctx }) => {
        return await getUserConversations(ctx.user.id);
      }),

    getMessages: protectedProcedure
      .input(z.object({ conversationId: z.number() }))
      .query(async ({ input }) => {
        return await getConversationMessages(input.conversationId);
      }),

    sendMessage: protectedProcedure
      .input(z.object({
        conversationId: z.number(),
        content: z.string(),
        attachmentUrl: z.string().optional(),
        attachmentType: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        const result = await db.insert(messages).values({
          conversationId: input.conversationId,
          senderId: ctx.user.id,
          content: input.content,
          attachmentUrl: input.attachmentUrl,
          attachmentType: input.attachmentType,
          isRead: false,
        });

        return result;
      }),

    startConversation: protectedProcedure
      .input(z.object({
        otherUserId: z.number(),
        bookingId: z.number().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        let conversation = await getConversation(ctx.user.id, input.otherUserId);

        if (!conversation) {
          const result = await db.insert(conversations).values({
            participantOneId: ctx.user.id,
            participantTwoId: input.otherUserId,
            bookingId: input.bookingId,
          });
          conversation = await getConversation(ctx.user.id, input.otherUserId);
        }

        return conversation;
      }),
  }),

  // Deliverables Routes
  deliverable: router({
    getByBooking: publicProcedure
      .input(z.object({ bookingId: z.number() }))
      .query(async ({ input }) => {
        return await getBookingDeliverables(input.bookingId);
      }),

    upload: protectedProcedure
      .input(z.object({
        bookingId: z.number(),
        title: z.string(),
        description: z.string().optional(),
        fileUrl: z.string(),
        fileType: z.string(),
        fileSize: z.number(),
      }))
      .mutation(async ({ ctx, input }) => {
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
          fileSize: input.fileSize,
        });

        return result;
      }),
  }),

  // Reviews & Ratings Routes
  review: router({
    getCreativeReviews: publicProcedure
      .input(z.object({ creativeId: z.number() }))
      .query(async ({ input }) => {
        return await getCreativeReviews(input.creativeId);
      }),

    getAverageRating: publicProcedure
      .input(z.object({ creativeId: z.number() }))
      .query(async ({ input }) => {
        return await getAverageRating(input.creativeId);
      }),

    create: protectedProcedure
      .input(z.object({
        bookingId: z.number(),
        creativeId: z.number(),
        rating: z.number().min(1).max(5),
        title: z.string().optional(),
        comment: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
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
          isVerified: true,
        });

        return result;
      }),
  }),

  // Gig Board Routes
  gig: router({
    listPosts: publicProcedure
      .input(z.object({
        limit: z.number().optional(),
        offset: z.number().optional(),
      }))
      .query(async ({ input }) => {
        return await getOpenGigPosts(input.limit, input.offset);
      }),

    createPost: protectedProcedure
      .input(z.object({
        title: z.string(),
        description: z.string(),
        category: z.string(),
        budget: z.number(),
        location: z.string().optional(),
        deadline: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
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
          status: "open",
        });

        return result;
      }),

    applyForGig: protectedProcedure
      .input(z.object({
        gigPostId: z.number(),
        proposedPrice: z.number(),
        coverLetter: z.string().optional(),
        portfolioLinks: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        const result = await db.insert(gigApplications).values({
          gigPostId: input.gigPostId,
          creativeId: ctx.user.id,
          proposedPrice: input.proposedPrice,
          coverLetter: input.coverLetter,
          portfolioLinks: input.portfolioLinks,
          status: "pending",
        });

        return result;
      }),

    getApplications: protectedProcedure
      .input(z.object({ gigPostId: z.number() }))
      .query(async ({ input }) => {
        return await getGigApplications(input.gigPostId);
      }),
  }),

  // Portfolio Routes
  portfolio: router({
    getCreativePortfolio: publicProcedure
      .input(z.object({ creativeId: z.number() }))
      .query(async ({ input }) => {
        return await getCreativePortfolio(input.creativeId);
      }),

    addItem: protectedProcedure
      .input(z.object({
        title: z.string(),
        description: z.string().optional(),
        imageUrl: z.string().optional(),
        videoUrl: z.string().optional(),
        category: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
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
          category: input.category,
        });

        return result;
      }),
  }),

  // Payment Routes
  payment: router({
    getTransactions: protectedProcedure
      .query(async ({ ctx }) => {
        return await getTransactionsByUser(ctx.user.id);
      }),

    initiatePayment: protectedProcedure
      .input(z.object({
        bookingId: z.number(),
        amount: z.number(),
        paymentMethod: z.enum(["paystack", "stripe"]),
      }))
      .mutation(async ({ ctx, input }) => {
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
          status: "pending",
        });

        return result;
      }),
  }),

  // Availability Routes
  availability: router({
    getCreativeAvailability: publicProcedure
      .input(z.object({ creativeId: z.number() }))
      .query(async ({ input }) => {
        const db = await getDb();
        if (!db) return [];
        const results = await db.select().from(availability).where(eq(availability.creativeId, input.creativeId));
        return results;
      }),

    addAvailability: protectedProcedure
      .input(z.object({
        date: z.string(),
        startTime: z.string(),
        endTime: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        const profile = await getCreativeProfile(ctx.user.id);
        if (!profile) throw new Error("Creative profile not found");

        const result = await db.insert(availability).values({
          creativeId: profile.id,
          date: input.date,
          startTime: input.startTime,
          endTime: input.endTime,
          isBooked: false,
        });

        return result;
      }),
  }),
});

export type AppRouter = typeof appRouter;
