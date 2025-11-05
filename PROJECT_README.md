# CreateSpace - Creative Marketplace & Booking Platform

A modern, full-stack marketplace and booking platform for creative professionals (photographers, videographers, makeup artists, stylists, etc.) and their clients. Built with React, Node.js, Express, MongoDB, and featuring integrated payment processing, real-time messaging, and AI-powered tools.

## Features

### Core Platform Features

**Portfolio & Profile Management**
- Creative professionals create stunning portfolio pages with images and videos
- Showcase work, pricing, availability, and verified reviews
- Customizable bio, service descriptions, and social links
- Verified badge system for trusted creatives

**Booking System**
- Clients browse and filter creatives by category, location, and budget
- Real-time availability calendar
- Secure booking with deposit payment
- Booking status tracking (pending, confirmed, completed, cancelled)

**Payment Integration**
- Paystack and Stripe integration for secure deposits
- Transaction history and payment tracking
- Deposit calculation and management
- Refund processing

**In-App Messaging**
- Direct messaging between clients and creatives
- Real-time conversation updates
- File sharing capabilities
- Message history and read status

**Deliverables Management**
- Secure file upload for final work
- Client download access with tracking
- Multiple file format support (images, videos, PDFs, archives)
- Optional expiration dates for deliverables

**Reviews & Ratings**
- Verified reviews from completed bookings
- 5-star rating system
- Average rating calculation
- Review moderation

**Gig Board**
- Clients post project requirements and budgets
- Creatives browse and apply for gigs
- Application management (accept/reject)
- Job completion tracking

**AI Assistant**
- Pricing suggestions based on service type and experience
- Portfolio caption generation
- Response template generation for inquiries
- Profile bio generation
- Service description writing
- Profile analysis and improvement suggestions

### Admin Features
- User management and moderation
- Booking analytics and reports
- Payment transaction monitoring
- Platform statistics and insights

## Tech Stack

**Frontend**
- React 19 with TypeScript
- Tailwind CSS 4 for styling
- shadcn/ui component library
- tRPC for type-safe API calls
- Wouter for routing

**Backend**
- Node.js with Express
- tRPC for API procedures
- Drizzle ORM for database management
- OpenAI API for AI features
- Paystack & Stripe APIs for payments

**Database**
- MySQL/TiDB with Drizzle migrations
- Comprehensive schema with 12 core tables
- Indexed queries for performance

**Infrastructure**
- Manus OAuth for authentication
- S3 for file storage
- Cloudinary for image optimization
- Built-in notification system

## Project Structure

```
createspace/
├── client/                 # React frontend
│   ├── src/
│   │   ├── pages/         # Page components
│   │   │   ├── Landing.tsx
│   │   │   ├── Marketplace.tsx
│   │   │   ├── CreativeProfile.tsx
│   │   │   ├── ClientDashboard.tsx
│   │   │   ├── ReviewPage.tsx
│   │   │   └── GigBoard.tsx
│   │   ├── components/    # Reusable components
│   │   ├── lib/           # Utilities and tRPC client
│   │   └── App.tsx        # Route definitions
│   └── public/            # Static assets
├── server/                # Node.js backend
│   ├── routers.ts         # Main tRPC router
│   ├── routers/
│   │   └── ai.ts          # AI assistant procedures
│   ├── db.ts              # Database query helpers
│   └── _core/             # Framework utilities
├── drizzle/               # Database schema and migrations
│   └── schema.ts          # All table definitions
├── shared/                # Shared types and constants
└── storage/               # S3 storage helpers
```

## Database Schema

### Core Tables

**users** - User accounts with OAuth integration
- Supports both clients and creative professionals
- Admin role for platform management

**creative_profiles** - Creative professional profiles
- Portfolio management
- Pricing and availability
- Ratings and verification status

**bookings** - Service bookings
- Client-creative relationships
- Service details and pricing
- Booking status and payment tracking

**conversations** - Messaging system
- Direct messaging between users
- Booking-related conversations

**messages** - Individual messages
- Message content and attachments
- Read status tracking

**deliverables** - Project deliverables
- File uploads and downloads
- Download tracking
- Expiration management

**reviews** - Client reviews
- Ratings and comments
- Verified booking badges

**gig_posts** - Job postings
- Client project requirements
- Budget and deadline

**gig_applications** - Creative applications
- Application status tracking
- Proposed pricing

**transactions** - Payment records
- Deposit and payment tracking
- Multiple payment methods

**portfolio_items** - Creative work samples
- Images and videos
- Categorization and ordering

**availability** - Creative availability calendar
- Time slot management
- Booking status

## API Routes

### Creative Management
- `creative.getProfile()` - Get current user's profile
- `creative.getById(id)` - Get creative by ID
- `creative.updateProfile(data)` - Update profile
- `creative.search(filters)` - Search creatives

### Bookings
- `booking.create(data)` - Create new booking
- `booking.getMyBookings()` - Get user's bookings
- `booking.getById(id)` - Get booking details
- `booking.updateStatus(id, status)` - Update booking status

### Messaging
- `messaging.getConversations()` - List conversations
- `messaging.getMessages(conversationId)` - Get messages
- `messaging.sendMessage(data)` - Send message
- `messaging.startConversation(userId)` - Start conversation

### Reviews
- `review.getCreativeReviews(creativeId)` - Get reviews
- `review.getAverageRating(creativeId)` - Get rating
- `review.create(data)` - Create review

### Gig Board
- `gig.listPosts(filters)` - List job postings
- `gig.createPost(data)` - Post new gig
- `gig.applyForGig(data)` - Apply for gig
- `gig.getApplications(gigPostId)` - Get applications

### AI Assistant
- `ai.generatePricingSuggestion(data)` - Pricing suggestions
- `ai.generateCaption(data)` - Portfolio captions
- `ai.generateResponseTemplate(data)` - Response templates
- `ai.generateProfileBio(data)` - Profile bio
- `ai.generateServiceDescription(data)` - Service descriptions
- `ai.analyzeProfile(data)` - Profile analysis

### Portfolio
- `portfolio.getCreativePortfolio(creativeId)` - Get portfolio
- `portfolio.addItem(data)` - Add portfolio item

### Payments
- `payment.getTransactions()` - Get payment history
- `payment.initiatePayment(data)` - Start payment

### Availability
- `availability.getCreativeAvailability(creativeId)` - Get availability
- `availability.addAvailability(data)` - Add time slot

## Getting Started

### Prerequisites
- Node.js 18+
- npm or pnpm
- MySQL/TiDB database
- Manus account for OAuth

### Installation

1. Clone the repository
```bash
git clone https://github.com/osasbenny/createspace.git
cd createspace
```

2. Install dependencies
```bash
pnpm install
```

3. Set up environment variables
```bash
# Copy .env.example to .env and fill in your credentials
cp .env.example .env
```

4. Push database schema
```bash
pnpm db:push
```

5. Start development server
```bash
pnpm dev
```

The application will be available at `http://localhost:3000`

## Environment Variables

Required environment variables:
- `DATABASE_URL` - MySQL connection string
- `VITE_APP_ID` - Manus OAuth application ID
- `JWT_SECRET` - Session signing secret
- `BUILT_IN_FORGE_API_KEY` - Manus API key (for AI features)
- `VITE_FRONTEND_FORGE_API_KEY` - Frontend API key

Optional:
- `PAYSTACK_SECRET_KEY` - Paystack integration
- `STRIPE_SECRET_KEY` - Stripe integration
- `CLOUDINARY_API_KEY` - Image optimization

## Features Implementation Status

### Completed ✓
- Database schema and migrations
- Backend API routes (tRPC)
- Landing page with features showcase
- Marketplace with search and filtering
- Creative profile pages
- Client dashboard with booking management
- Payment history tracking
- Review and rating system
- Gig board for job postings
- AI assistant features
- Authentication and authorization

### In Progress / Future
- Real-time messaging with WebSockets
- Advanced booking calendar UI
- Creative dashboard with analytics
- Admin panel
- Email notifications
- Mobile app
- Video streaming for deliverables
- Advanced search with filters
- Recommendation engine

## Deployment

### Publish to Production
1. Create a checkpoint: `pnpm webdev:checkpoint`
2. Click the "Publish" button in the Management UI
3. Configure custom domain if needed

### Database Migrations
```bash
pnpm db:push
```

## Contributing

Contributions are welcome! Please follow these guidelines:
1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For issues and questions:
- GitHub Issues: [CreateSpace Issues](https://github.com/osasbenny/createspace/issues)
- Email: support@createspace.local

## Roadmap

**Q1 2024**
- Real-time messaging with WebSockets
- Advanced booking calendar
- Email notifications

**Q2 2024**
- Creative dashboard with analytics
- Admin panel
- Mobile app (React Native)

**Q3 2024**
- Video streaming optimization
- Advanced search filters
- Recommendation engine

**Q4 2024**
- International payment support
- Multi-language support
- API for third-party integrations

## Acknowledgments

Built with modern web technologies and best practices for scalability, security, and user experience.
