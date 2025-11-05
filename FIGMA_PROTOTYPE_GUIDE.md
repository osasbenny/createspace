# CreateSpace Mobile App - Figma Prototype Design Guide

## Overview

This document provides a comprehensive guide for building the CreateSpace mobile app prototype in Figma using the provided mockup images. The prototype includes all essential screens for both iOS and Android platforms with a consistent design system based on the CreateSpace brand identity.

---

## Design System

### Color Palette

| Color | Hex Code | Usage |
|-------|----------|-------|
| Primary Purple | #8B5CF6 | Main brand color, buttons, accents |
| Secondary Pink | #EC4899 | Gradient accents, highlights |
| Dark Background | #0F172A | Dark mode background |
| Light Background | #FFFFFF | Light mode background |
| Text Primary | #1F2937 | Main text color |
| Text Secondary | #6B7280 | Secondary text, descriptions |
| Border | #E5E7EB | Dividers, borders |
| Success | #10B981 | Positive actions, confirmations |
| Danger | #EF4444 | Destructive actions, errors |
| Warning | #F59E0B | Warnings, alerts |

### Typography

- **Font Family**: Inter (Google Fonts)
- **Display/Heading**: 32px, Bold (weight 700)
- **Large Heading**: 24px, Bold (weight 700)
- **Subheading**: 18px, Semibold (weight 600)
- **Body**: 16px, Regular (weight 400)
- **Small Text**: 14px, Regular (weight 400)
- **Caption**: 12px, Regular (weight 400)

### Spacing System

- **xs**: 4px
- **sm**: 8px
- **md**: 16px
- **lg**: 24px
- **xl**: 32px
- **2xl**: 48px

### Border Radius

- **sm**: 4px
- **md**: 8px
- **lg**: 12px
- **xl**: 16px
- **full**: 999px (for circular elements)

### Shadows

- **sm**: 0 1px 2px rgba(0, 0, 0, 0.05)
- **md**: 0 4px 6px rgba(0, 0, 0, 0.1)
- **lg**: 0 10px 15px rgba(0, 0, 0, 0.1)
- **xl**: 0 20px 25px rgba(0, 0, 0, 0.1)

---

## Screen Inventory

### Authentication Flow (5 Screens)

#### 1. Splash Screen (01-splash-screen.png)
**Purpose**: App launch screen with branding
- **Elements**:
  - CreateSpace logo (centered)
  - App name "Create Space"
  - Loading animation
  - Gradient background (purple to pink)
- **Duration**: 2-3 seconds
- **Next Screen**: Onboarding or Home (if logged in)

#### 2. Onboarding Screen 1 (02-onboarding-1.png)
**Purpose**: Introduce marketplace concept
- **Elements**:
  - Full-screen illustration
  - Headline: "Connect with Creative Professionals"
  - Subheading: "Book photographers, stylists, makeup artists, videographers and more"
  - Skip button (top right)
  - Next button (bottom right)
- **Navigation**: Skip → Login | Next → Onboarding 2

#### 3. Onboarding Screen 2 (03-onboarding-2.png)
**Purpose**: Highlight secure payments
- **Elements**:
  - Illustration of payment/booking
  - Headline: "Secure Payments & Easy Booking"
  - Subheading: "Pay deposits via Paystack or Stripe. Manage your bookings with ease"
  - Skip button
  - Next button
- **Navigation**: Skip → Login | Next → Onboarding 3

#### 4. Onboarding Screen 3 (04-onboarding-3.png)
**Purpose**: Showcase messaging feature
- **Elements**:
  - Illustration of communication
  - Headline: "Direct Messaging"
  - Subheading: "Communicate with creatives in real-time. Share requirements and coordinate projects"
  - Skip button
  - Next button → Login
- **Navigation**: Skip → Login | Next → Login

#### 5. Login Screen (05-login-screen.png)
**Purpose**: User authentication
- **Elements**:
  - CreateSpace logo at top
  - Email input field (with icon)
  - Password input field (with show/hide toggle)
  - "Forgot Password?" link
  - Sign In button (purple gradient)
  - "Don't have an account? Sign Up" link
- **Interactions**:
  - Email validation
  - Password visibility toggle
  - Forgot password → Password reset flow
  - Sign Up link → Sign Up screen

---

### Registration Flow (3 Screens)

#### 6. Sign Up Screen (06-signup-screen.png)
**Purpose**: Create new account
- **Elements**:
  - CreateSpace logo
  - Full name input
  - Email input
  - Password input (with toggle)
  - Confirm password input
  - Terms & Conditions checkbox
  - Create Account button (purple/pink gradient)
  - Sign In link
- **Validations**:
  - Email format validation
  - Password strength indicator
  - Password match validation
  - Terms acceptance required

#### 7. Role Selection (07-role-selection.png)
**Purpose**: Determine user type
- **Elements**:
  - Headline: "What brings you here?"
  - Two large cards:
    - "I'm a Client" (with illustration)
    - "I'm a Creative" (with illustration)
  - Selection buttons on each card
- **Navigation**:
  - Client → Client Dashboard
  - Creative → Creative Profile Setup

#### 8. Creative Profile Setup (08-creative-profile-setup.png)
**Purpose**: Complete creative profile
- **Elements**:
  - Profile picture upload (with camera icon)
  - Name field
  - Category dropdown (Photographer, Videographer, Makeup Artist, Stylist, etc.)
  - Bio text area
  - Hourly rate field
  - Location field
  - Continue button
- **Validations**:
  - All fields required
  - Rate must be positive number
  - Bio character limit (500 chars)

---

### Marketplace & Discovery (3 Screens)

#### 9. Marketplace Home (09-marketplace-home.png)
**Purpose**: Browse and discover creatives
- **Elements**:
  - Search bar (with filter icon)
  - "Browse Creatives" heading
  - Grid of creative profile cards (2 columns):
    - Profile image
    - Name
    - Category
    - Rating (with stars)
    - Hourly rate
    - Location
  - Bottom navigation bar (5 icons):
    - Home (active)
    - Search
    - Messages
    - Bookings
    - Profile
- **Interactions**:
  - Search functionality
  - Filter by category/location/budget
  - Tap card → Creative Detail
  - Bottom nav navigation

#### 10. Creative Detail (10-creative-detail.png)
**Purpose**: View creative profile
- **Elements**:
  - Large profile photo (top)
  - Name and category
  - Rating with stars and review count
  - Location and hourly rate
  - About/bio section
  - Portfolio gallery (3-4 images in grid)
  - Book Now button (purple/pink gradient)
  - Bottom navigation bar
- **Interactions**:
  - Tap portfolio images → Lightbox/gallery view
  - Book Now → Booking screen
  - Message button → Messaging screen
  - Back button → Marketplace

---

### Booking Flow (1 Screen)

#### 11. Booking Confirmation (11-booking-screen.png)
**Purpose**: Confirm and pay for booking
- **Elements**:
  - Creative name and profile image (header)
  - Service details section:
    - Service name
    - Selected date and time
    - Location
  - Price breakdown:
    - Service fee
    - Deposit amount
    - Total price
  - Payment method selector:
    - Paystack (radio button)
    - Stripe (radio button)
  - Confirm Booking button (purple/pink gradient)
  - Cancel button
- **Interactions**:
  - Select payment method
  - Confirm → Payment processing
  - Cancel → Back to creative detail

---

### Messaging (1 Screen)

#### 12. Messaging Screen (12-messaging-screen.png)
**Purpose**: Real-time communication
- **Elements**:
  - Header with creative name and online status
  - Chat message area:
    - User messages (right, purple)
    - Creative messages (left, gray)
    - Timestamps
    - Typing indicator animation
  - Message input field (bottom)
  - Send button (purple circle with arrow)
  - Attachment icon
- **Interactions**:
  - Send message
  - Attach file/image
  - Scroll to load message history
  - Real-time message updates

---

### Booking Management (2 Screens)

#### 13. My Bookings List (13-bookings-list.png)
**Purpose**: View all bookings
- **Elements**:
  - "My Bookings" heading
  - Filter tabs:
    - Upcoming (active)
    - Completed
    - Cancelled
  - Booking cards showing:
    - Creative profile image
    - Creative name
    - Service type
    - Booking date/time
    - Status badge (Confirmed, Pending, Cancelled)
    - Action buttons:
      - Message
      - View Details
      - Cancel (if applicable)
  - Bottom navigation bar
- **Interactions**:
  - Tap card → Booking details
  - Message → Messaging screen
  - Filter by status
  - Cancel booking → Confirmation dialog

#### 14. Deliverables Screen (14-deliverables-screen.png)
**Purpose**: Access project deliverables
- **Elements**:
  - "My Deliverables" heading
  - Project list with:
    - Project thumbnail/preview
    - Project name
    - Creative name
    - Delivery status (Delivered, Pending)
    - Date received
    - Download button
  - Expandable sections for multiple files
  - Bottom navigation bar
- **Interactions**:
  - Download files
  - Expand/collapse project sections
  - View file details

---

### Reviews & Ratings (1 Screen)

#### 15. Review Screen (15-review-screen.png)
**Purpose**: Leave feedback after booking
- **Elements**:
  - "Leave a Review" heading
  - Creative profile image and name (header)
  - 5-star rating selector (interactive stars)
  - Review text area:
    - Placeholder: "Share your experience..."
    - Character limit: 500
  - Optional photo upload button
  - Submit Review button (purple/pink gradient)
  - Bottom navigation bar
- **Interactions**:
  - Tap stars to rate (1-5)
  - Type review text
  - Upload photo
  - Submit → Confirmation message

---

### Gig Board (1 Screen)

#### 16. Gig Board (16-gig-board.png)
**Purpose**: Browse and apply for jobs
- **Elements**:
  - "Gig Board" heading
  - Filter tabs:
    - All (active)
    - My Posts
    - Applied
  - Job posting cards showing:
    - Client name
    - Job title
    - Description
    - Budget range
    - Deadline
    - Number of applications
    - Apply Now / View Applications button
  - Bottom navigation bar
- **Interactions**:
  - Filter by tab
  - Apply for job → Application form
  - View applications (for job posters)
  - Tap card → Job details

---

### User Profile (3 Screens)

#### 17. Profile Screen (17-profile-screen.png)
**Purpose**: View and manage user profile
- **Elements**:
  - Cover image (background)
  - Profile picture (circular, overlapping cover)
  - Name and role badge (Client/Creative)
  - Bio/description
  - Stats section:
    - Ratings (for creatives)
    - Completed bookings
    - Earnings (for creatives) / Spent (for clients)
  - Edit Profile button
  - Portfolio section (for creatives)
  - Saved/Favorites section (for clients)
  - Bottom navigation bar
- **Interactions**:
  - Edit Profile → Profile edit screen
  - View portfolio
  - View saved items

#### 18. Settings Screen (18-settings-screen.png)
**Purpose**: App preferences and account settings
- **Elements**:
  - "Settings" heading
  - Menu items with icons:
    - Account Settings (user icon)
    - Payment Methods (card icon)
    - Notifications (bell icon) - with toggle
    - Privacy & Security (shield icon)
    - Help & Support (question mark icon)
    - About (info icon)
  - Each item has arrow indicator
  - Bottom navigation bar
- **Interactions**:
  - Tap item → Respective settings screen
  - Toggle notifications on/off

#### 19. Payment Methods (19-payment-methods.png)
**Purpose**: Manage payment options
- **Elements**:
  - "Payment Methods" heading
  - Saved payment methods:
    - Paystack account (with logo)
    - Last 4 digits
    - Primary badge (if applicable)
    - Remove button
    - Stripe account (with logo)
    - Last 4 digits
    - Remove button
  - Add Payment Method button (with + icon)
- **Interactions**:
  - Add new payment method
  - Remove payment method
  - Set as primary
  - Edit payment details

---

### Logout (1 Screen)

#### 20. Logout Confirmation (20-logout-confirmation.png)
**Purpose**: Confirm sign out action
- **Elements**:
  - Modal dialog (centered)
  - "Sign Out?" heading
  - Confirmation message: "Are you sure you want to sign out?"
  - Two buttons:
    - Cancel (light purple)
    - Sign Out (red/destructive)
- **Interactions**:
  - Cancel → Close dialog, stay in app
  - Sign Out → Clear session, return to login

---

## Navigation Structure

### Bottom Tab Navigation (5 Tabs)
1. **Home** - Marketplace/Discovery
2. **Search** - Advanced search and filters
3. **Messages** - Conversations list
4. **Bookings** - My bookings and deliverables
5. **Profile** - User profile and settings

### Screen Flow Diagram

```
Splash Screen
    ↓
Onboarding (3 screens)
    ↓
Login/Sign Up
    ↓
Role Selection
    ↓
[Client Path]              [Creative Path]
├─ Marketplace Home        ├─ Creative Profile Setup
├─ Creative Detail         ├─ Marketplace Home
├─ Booking Screen          ├─ Creative Detail
├─ Booking Confirmation    ├─ Booking Screen
├─ My Bookings             ├─ My Bookings
├─ Messaging               ├─ Messaging
├─ Deliverables            ├─ Deliverables
├─ Review                  ├─ Review
├─ Gig Board               ├─ Gig Board
├─ Profile                 ├─ Profile
├─ Settings                ├─ Settings
└─ Logout                  └─ Logout
```

---

## Component Library

### Buttons

**Primary Button**
- Background: Purple to Pink gradient (#8B5CF6 → #EC4899)
- Text: White
- Padding: 12px 24px
- Border radius: 12px
- Font: 16px, Semibold

**Secondary Button**
- Background: Transparent
- Border: 2px solid #8B5CF6
- Text: #8B5CF6
- Padding: 12px 24px
- Border radius: 12px

**Destructive Button**
- Background: #EF4444
- Text: White
- Padding: 12px 24px
- Border radius: 12px

### Input Fields

**Text Input**
- Border: 1px solid #E5E7EB
- Border radius: 8px
- Padding: 12px 16px
- Font: 16px
- Focus state: Border color #8B5CF6, shadow

**Text Area**
- Same as text input
- Min height: 100px
- Resizable

### Cards

**Profile Card**
- Background: White
- Border radius: 12px
- Shadow: md
- Padding: 16px
- Border: 1px solid #E5E7EB

### Status Badges

- **Confirmed**: Green background, white text
- **Pending**: Yellow background, dark text
- **Cancelled**: Red background, white text
- **Delivered**: Green background, white text

---

## Responsive Design Guidelines

### Screen Sizes
- **Mobile**: 375px - 428px (iPhone SE to iPhone 14 Pro Max)
- **Tablet**: 768px - 1024px (iPad)

### Safe Area Considerations
- Top safe area: 44px (notch/status bar)
- Bottom safe area: 34px (home indicator)
- Side margins: 16px minimum

### Touch Target Size
- Minimum: 44px × 44px
- Recommended: 48px × 48px

---

## Animation & Micro-interactions

### Transitions
- **Page transitions**: 300ms ease-in-out
- **Button press**: 150ms scale animation (0.95)
- **Fade in**: 200ms opacity animation

### Loading States
- Skeleton loaders for content
- Spinner animation for actions
- Progress indicators for uploads

### Feedback
- Toast notifications for actions
- Haptic feedback on button press
- Confirmation dialogs for destructive actions

---

## Accessibility Guidelines

### Color Contrast
- Text on background: Minimum 4.5:1 contrast ratio
- Large text: Minimum 3:1 contrast ratio

### Text Sizing
- Minimum font size: 12px
- Line height: 1.5x font size
- Letter spacing: 0.5px for headings

### Touch Targets
- Minimum 44px × 44px
- Spacing between targets: 8px minimum

### Semantic Structure
- Proper heading hierarchy (H1, H2, H3)
- Alt text for images
- ARIA labels for interactive elements

---

## Implementation Notes

### For Figma
1. Create a shared component library with all UI elements
2. Use Figma's auto-layout for responsive design
3. Create variants for different states (hover, active, disabled)
4. Use constraints for proper scaling
5. Organize layers in logical groups
6. Name components consistently for easy identification

### For Flutter Development
1. Use the provided mockups as design reference
2. Implement Material Design 3 components
3. Use the color palette defined in this guide
4. Maintain consistent spacing and typography
5. Test on both iOS and Android devices
6. Implement proper error handling and loading states

### For Quality Assurance
1. Test all user flows end-to-end
2. Verify all buttons and links work correctly
3. Check responsive design on various screen sizes
4. Test keyboard navigation and accessibility
5. Verify animations and transitions
6. Test on both iOS and Android platforms

---

## Design Handoff

All 20 mockup images are provided in the `/mockups` directory:
- `01-splash-screen.png`
- `02-onboarding-1.png` through `04-onboarding-3.png`
- `05-login-screen.png`
- `06-signup-screen.png`
- `07-role-selection.png`
- `08-creative-profile-setup.png`
- `09-marketplace-home.png`
- `10-creative-detail.png`
- `11-booking-screen.png`
- `12-messaging-screen.png`
- `13-bookings-list.png`
- `14-deliverables-screen.png`
- `15-review-screen.png`
- `16-gig-board.png`
- `17-profile-screen.png`
- `18-settings-screen.png`
- `19-payment-methods.png`
- `20-logout-confirmation.png`

These images can be directly imported into Figma as design references or used as a basis for creating high-fidelity prototypes.

---

## Support & Questions

For questions about the design system or implementation details, refer to:
- Design specifications in this document
- Mockup images in the `/mockups` directory
- API documentation in `API_DOCUMENTATION.md`
- Deployment guide in `DEPLOYMENT_GUIDE.md`

---

**Last Updated**: November 5, 2025  
**Version**: 1.0  
**Designer**: Osagie Bernard E  
**Brand**: Create Space - Creative Marketplace & Booking Platform
