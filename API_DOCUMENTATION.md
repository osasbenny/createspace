# CreateSpace API Documentation

Complete API reference for CreateSpace tRPC procedures. All endpoints are type-safe with full TypeScript support.

## Base URL

```
http://localhost:3000/api/trpc
```

## Authentication

All protected procedures require an authenticated user session via Manus OAuth. Public procedures are accessible without authentication.

## API Endpoints

### Authentication Routes

#### `auth.me`
Get current authenticated user information.

**Type:** Public Query  
**Returns:** User object or null

```typescript
const user = await trpc.auth.me.useQuery();
```

#### `auth.logout`
Logout current user and clear session.

**Type:** Public Mutation  
**Returns:** `{ success: boolean }`

```typescript
const logout = trpc.auth.logout.useMutation();
await logout.mutateAsync();
```

---

### Creative Profile Routes

#### `creative.getProfile`
Get current user's creative profile.

**Type:** Protected Query  
**Returns:** CreativeProfile object or undefined

```typescript
const profile = trpc.creative.getProfile.useQuery();
```

#### `creative.getById`
Get creative profile by ID.

**Type:** Public Query  
**Input:**
```typescript
{ id: number }
```

**Returns:** CreativeProfile object

```typescript
const creative = trpc.creative.getById.useQuery({ id: 123 });
```

#### `creative.updateProfile`
Update current user's creative profile.

**Type:** Protected Mutation  
**Input:**
```typescript
{
  businessName?: string;
  bio?: string;
  categories?: string; // JSON array
  location?: string;
  basePrice?: number; // in cents
  hourlyRate?: number; // in cents
  profileImage?: string; // URL
  coverImage?: string; // URL
}
```

**Returns:** Updated CreativeProfile

```typescript
const update = trpc.creative.updateProfile.useMutation();
await update.mutateAsync({
  businessName: "John Photography",
  bio: "Professional photographer",
  basePrice: 50000, // $500
});
```

#### `creative.search`
Search creatives with filters.

**Type:** Public Query  
**Input:**
```typescript
{
  category?: string;
  location?: string;
  minRating?: number;
  limit?: number; // default: 20
  offset?: number; // default: 0
}
```

**Returns:** Array of CreativeProfile objects

```typescript
const results = trpc.creative.search.useQuery({
  category: "Photography",
  location: "New York",
  limit: 10,
});
```

---

### Booking Routes

#### `booking.create`
Create a new booking.

**Type:** Protected Mutation  
**Input:**
```typescript
{
  creativeId: number;
  serviceType: string;
  description?: string;
  bookingDate: string; // ISO date
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  location?: string;
  totalPrice: number; // in cents
  depositAmount: number; // in cents
}
```

**Returns:** Booking object

```typescript
const create = trpc.booking.create.useMutation();
await create.mutateAsync({
  creativeId: 5,
  serviceType: "Portrait Session",
  bookingDate: "2024-12-25",
  startTime: "10:00",
  endTime: "12:00",
  totalPrice: 100000, // $1000
  depositAmount: 50000, // $500
});
```

#### `booking.getMyBookings`
Get all bookings for current user (as client).

**Type:** Protected Query  
**Returns:** Array of Booking objects

```typescript
const bookings = trpc.booking.getMyBookings.useQuery();
```

#### `booking.getCreativeBookings`
Get all bookings for current user (as creative).

**Type:** Protected Query  
**Returns:** Array of Booking objects

```typescript
const bookings = trpc.booking.getCreativeBookings.useQuery();
```

#### `booking.getById`
Get booking details by ID.

**Type:** Public Query  
**Input:**
```typescript
{ id: number }
```

**Returns:** Booking object

```typescript
const booking = trpc.booking.getById.useQuery({ id: 42 });
```

#### `booking.updateStatus`
Update booking status.

**Type:** Protected Mutation  
**Input:**
```typescript
{
  bookingId: number;
  status: "pending" | "confirmed" | "completed" | "cancelled" | "disputed";
}
```

**Returns:** Updated Booking object

```typescript
const update = trpc.booking.updateStatus.useMutation();
await update.mutateAsync({
  bookingId: 42,
  status: "confirmed",
});
```

---

### Messaging Routes

#### `messaging.getConversations`
Get all conversations for current user.

**Type:** Protected Query  
**Returns:** Array of Conversation objects

```typescript
const conversations = trpc.messaging.getConversations.useQuery();
```

#### `messaging.getMessages`
Get messages in a conversation.

**Type:** Protected Query  
**Input:**
```typescript
{ conversationId: number }
```

**Returns:** Array of Message objects

```typescript
const messages = trpc.messaging.getMessages.useQuery({ conversationId: 10 });
```

#### `messaging.sendMessage`
Send a message in a conversation.

**Type:** Protected Mutation  
**Input:**
```typescript
{
  conversationId: number;
  content: string;
  attachmentUrl?: string;
  attachmentType?: string; // "image" | "file" | "video"
}
```

**Returns:** Message object

```typescript
const send = trpc.messaging.sendMessage.useMutation();
await send.mutateAsync({
  conversationId: 10,
  content: "When can we schedule the session?",
});
```

#### `messaging.startConversation`
Start a new conversation with another user.

**Type:** Protected Mutation  
**Input:**
```typescript
{
  otherUserId: number;
  bookingId?: number;
}
```

**Returns:** Conversation object

```typescript
const start = trpc.messaging.startConversation.useMutation();
const conv = await start.mutateAsync({
  otherUserId: 5,
  bookingId: 42,
});
```

---

### Deliverables Routes

#### `deliverable.getByBooking`
Get deliverables for a booking.

**Type:** Public Query  
**Input:**
```typescript
{ bookingId: number }
```

**Returns:** Array of Deliverable objects

```typescript
const deliverables = trpc.deliverable.getByBooking.useQuery({ bookingId: 42 });
```

#### `deliverable.upload`
Upload deliverables for a booking.

**Type:** Protected Mutation  
**Input:**
```typescript
{
  bookingId: number;
  title: string;
  description?: string;
  fileUrl: string; // S3 URL
  fileType: string; // "image" | "video" | "pdf" | "zip"
  fileSize: number; // in bytes
}
```

**Returns:** Deliverable object

```typescript
const upload = trpc.deliverable.upload.useMutation();
await upload.mutateAsync({
  bookingId: 42,
  title: "Final Photos",
  fileUrl: "https://s3.amazonaws.com/...",
  fileType: "zip",
  fileSize: 1024000,
});
```

---

### Review Routes

#### `review.getCreativeReviews`
Get all reviews for a creative.

**Type:** Public Query  
**Input:**
```typescript
{ creativeId: number }
```

**Returns:** Array of Review objects

```typescript
const reviews = trpc.review.getCreativeReviews.useQuery({ creativeId: 5 });
```

#### `review.getAverageRating`
Get average rating for a creative.

**Type:** Public Query  
**Input:**
```typescript
{ creativeId: number }
```

**Returns:** Number (0-5)

```typescript
const rating = trpc.review.getAverageRating.useQuery({ creativeId: 5 });
```

#### `review.create`
Create a review for a booking.

**Type:** Protected Mutation  
**Input:**
```typescript
{
  bookingId: number;
  creativeId: number;
  rating: number; // 1-5
  title?: string;
  comment?: string;
}
```

**Returns:** Review object

```typescript
const create = trpc.review.create.useMutation();
await create.mutateAsync({
  bookingId: 42,
  creativeId: 5,
  rating: 5,
  title: "Excellent work!",
  comment: "Very professional and delivered on time.",
});
```

---

### Gig Board Routes

#### `gig.listPosts`
List all open gig posts.

**Type:** Public Query  
**Input:**
```typescript
{
  limit?: number; // default: 20
  offset?: number; // default: 0
}
```

**Returns:** Array of GigPost objects

```typescript
const posts = trpc.gig.listPosts.useQuery({ limit: 50 });
```

#### `gig.createPost`
Create a new gig post.

**Type:** Protected Mutation  
**Input:**
```typescript
{
  title: string;
  description: string;
  category: string;
  budget: number; // in cents
  location?: string;
  deadline: string; // ISO date
}
```

**Returns:** GigPost object

```typescript
const create = trpc.gig.createPost.useMutation();
await create.mutateAsync({
  title: "Need Professional Headshots",
  description: "Looking for a photographer...",
  category: "Photography",
  budget: 50000, // $500
  deadline: "2024-12-31",
});
```

#### `gig.applyForGig`
Apply for a gig post.

**Type:** Protected Mutation  
**Input:**
```typescript
{
  gigPostId: number;
  proposedPrice: number; // in cents
  coverLetter?: string;
  portfolioLinks?: string; // JSON array
}
```

**Returns:** GigApplication object

```typescript
const apply = trpc.gig.applyForGig.useMutation();
await apply.mutateAsync({
  gigPostId: 15,
  proposedPrice: 45000,
  coverLetter: "I'm interested in this project...",
});
```

#### `gig.getApplications`
Get applications for a gig post.

**Type:** Protected Query  
**Input:**
```typescript
{ gigPostId: number }
```

**Returns:** Array of GigApplication objects

```typescript
const apps = trpc.gig.getApplications.useQuery({ gigPostId: 15 });
```

---

### Portfolio Routes

#### `portfolio.getCreativePortfolio`
Get portfolio items for a creative.

**Type:** Public Query  
**Input:**
```typescript
{ creativeId: number }
```

**Returns:** Array of PortfolioItem objects

```typescript
const portfolio = trpc.portfolio.getCreativePortfolio.useQuery({ creativeId: 5 });
```

#### `portfolio.addItem`
Add a portfolio item.

**Type:** Protected Mutation  
**Input:**
```typescript
{
  title: string;
  description?: string;
  imageUrl?: string;
  videoUrl?: string;
  category: string;
}
```

**Returns:** PortfolioItem object

```typescript
const add = trpc.portfolio.addItem.useMutation();
await add.mutateAsync({
  title: "Wedding Photography",
  imageUrl: "https://s3.amazonaws.com/...",
  category: "Weddings",
});
```

---

### Payment Routes

#### `payment.getTransactions`
Get payment history for current user.

**Type:** Protected Query  
**Returns:** Array of Transaction objects

```typescript
const transactions = trpc.payment.getTransactions.useQuery();
```

#### `payment.initiatePayment`
Initiate a payment for a booking.

**Type:** Protected Mutation  
**Input:**
```typescript
{
  bookingId: number;
  amount: number; // in cents
  paymentMethod: "paystack" | "stripe";
}
```

**Returns:** Transaction object

```typescript
const pay = trpc.payment.initiatePayment.useMutation();
await pay.mutateAsync({
  bookingId: 42,
  amount: 50000, // $500
  paymentMethod: "paystack",
});
```

---

### Availability Routes

#### `availability.getCreativeAvailability`
Get availability slots for a creative.

**Type:** Public Query  
**Input:**
```typescript
{ creativeId: number }
```

**Returns:** Array of Availability objects

```typescript
const slots = trpc.availability.getCreativeAvailability.useQuery({ creativeId: 5 });
```

#### `availability.addAvailability`
Add availability time slots.

**Type:** Protected Mutation  
**Input:**
```typescript
{
  date: string; // ISO date
  startTime: string; // HH:mm
  endTime: string; // HH:mm
}
```

**Returns:** Availability object

```typescript
const add = trpc.availability.addAvailability.useMutation();
await add.mutateAsync({
  date: "2024-12-25",
  startTime: "10:00",
  endTime: "18:00",
});
```

---

### AI Assistant Routes

#### `ai.generatePricingSuggestion`
Generate pricing suggestions for a service.

**Type:** Protected Mutation  
**Input:**
```typescript
{
  serviceType: string;
  experience?: string;
  location?: string;
}
```

**Returns:**
```typescript
{
  basePrice: number;
  hourlyRate: number;
  depositPercentage: number;
  reasoning: string;
}
```

#### `ai.generateCaption`
Generate portfolio caption for work.

**Type:** Protected Mutation  
**Input:**
```typescript
{
  serviceType: string;
  description?: string;
  style?: "professional" | "casual" | "creative";
}
```

**Returns:**
```typescript
{ caption: string }
```

#### `ai.generateResponseTemplate`
Generate response template for inquiries.

**Type:** Protected Mutation  
**Input:**
```typescript
{
  inquiryType: "availability" | "pricing" | "customization" | "general";
  context?: string;
}
```

**Returns:**
```typescript
{ template: string }
```

#### `ai.generateProfileBio`
Generate professional bio.

**Type:** Protected Mutation  
**Input:**
```typescript
{
  name: string;
  serviceType: string;
  experience?: string;
  specialties?: string;
  style?: "professional" | "creative" | "friendly";
}
```

**Returns:**
```typescript
{ bio: string }
```

#### `ai.generateServiceDescription`
Generate service description.

**Type:** Protected Mutation  
**Input:**
```typescript
{
  serviceName: string;
  details?: string;
  targetAudience?: string;
}
```

**Returns:**
```typescript
{ description: string }
```

#### `ai.analyzeProfile`
Analyze and suggest profile improvements.

**Type:** Protected Mutation  
**Input:**
```typescript
{
  bio?: string;
  serviceTypes?: string;
  portfolioCount?: number;
  reviewCount?: number;
}
```

**Returns:**
```typescript
{
  strengths: string[];
  improvements: string[];
  priority: "high" | "medium" | "low";
}
```

---

## Error Handling

All API errors follow this format:

```typescript
{
  code: "UNAUTHORIZED" | "FORBIDDEN" | "NOT_FOUND" | "BAD_REQUEST" | "INTERNAL_SERVER_ERROR",
  message: string,
  data?: any
}
```

**Common error codes:**
- `UNAUTHORIZED` - User not authenticated
- `FORBIDDEN` - User lacks permission
- `NOT_FOUND` - Resource not found
- `BAD_REQUEST` - Invalid input
- `INTERNAL_SERVER_ERROR` - Server error

## Rate Limiting

API rate limits per user:
- 100 requests per minute for authenticated users
- 20 requests per minute for public endpoints
- 10 requests per minute for payment endpoints

## Pagination

List endpoints support pagination:

```typescript
{
  limit: 20,    // items per page
  offset: 0,    // starting position
  total: 150,   // total items
  hasMore: true // more items available
}
```

## Type Definitions

All request/response types are exported from the tRPC router and available in TypeScript:

```typescript
import type { AppRouter } from "@/server/routers";
import { trpc } from "@/lib/trpc";

// Types are automatically inferred
type CreativeProfile = Awaited<ReturnType<typeof trpc.creative.getById.query>>;
```

## WebSocket Support

Real-time features (messaging, notifications) will use WebSocket connections in future releases. Current implementation uses polling.

## Changelog

### v1.0.0 (Current)
- Initial API release
- All core endpoints implemented
- AI assistant integration
- Payment processing
- Gig board system
