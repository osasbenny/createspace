CREATE TABLE `availability` (
	`id` int AUTO_INCREMENT NOT NULL,
	`creativeId` int NOT NULL,
	`date` varchar(50) NOT NULL,
	`startTime` varchar(50) NOT NULL,
	`endTime` varchar(50) NOT NULL,
	`isBooked` boolean DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `availability_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `bookings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`clientId` int NOT NULL,
	`creativeId` int NOT NULL,
	`serviceType` varchar(255),
	`description` text,
	`bookingDate` varchar(50) NOT NULL,
	`startTime` varchar(50) NOT NULL,
	`endTime` varchar(50) NOT NULL,
	`duration` int,
	`location` varchar(255),
	`totalPrice` int NOT NULL,
	`depositAmount` int NOT NULL,
	`depositPaid` boolean DEFAULT false,
	`status` enum('pending','confirmed','completed','cancelled','disputed') DEFAULT 'pending',
	`paymentMethod` varchar(50),
	`transactionId` varchar(255),
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `bookings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `conversations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`participantOneId` int NOT NULL,
	`participantTwoId` int NOT NULL,
	`bookingId` int,
	`lastMessage` text,
	`lastMessageAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `conversations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `creative_profiles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`businessName` varchar(255),
	`bio` text,
	`categories` text,
	`location` varchar(255),
	`latitude` varchar(50),
	`longitude` varchar(50),
	`basePrice` int,
	`hourlyRate` int,
	`profileImage` varchar(500),
	`coverImage` varchar(500),
	`averageRating` varchar(10) DEFAULT '0',
	`totalReviews` int DEFAULT 0,
	`isVerified` boolean DEFAULT false,
	`isActive` boolean DEFAULT true,
	`portfolio` text,
	`socialLinks` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `creative_profiles_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `deliverables` (
	`id` int AUTO_INCREMENT NOT NULL,
	`bookingId` int NOT NULL,
	`creativeId` int NOT NULL,
	`clientId` int NOT NULL,
	`title` varchar(255),
	`description` text,
	`fileUrl` varchar(500),
	`fileType` varchar(50),
	`fileSize` int,
	`downloadCount` int DEFAULT 0,
	`uploadedAt` timestamp NOT NULL DEFAULT (now()),
	`expiresAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `deliverables_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `gig_applications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`gigPostId` int NOT NULL,
	`creativeId` int NOT NULL,
	`proposedPrice` int,
	`coverLetter` text,
	`portfolioLinks` text,
	`status` enum('pending','accepted','rejected','withdrawn') DEFAULT 'pending',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `gig_applications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `gig_posts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`clientId` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`category` varchar(100),
	`budget` int,
	`location` varchar(255),
	`deadline` varchar(50),
	`status` enum('open','in_progress','completed','closed') DEFAULT 'open',
	`applicationsCount` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `gig_posts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `messages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`conversationId` int NOT NULL,
	`senderId` int NOT NULL,
	`content` text,
	`attachmentUrl` varchar(500),
	`attachmentType` varchar(50),
	`isRead` boolean DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `messages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `portfolio_items` (
	`id` int AUTO_INCREMENT NOT NULL,
	`creativeId` int NOT NULL,
	`title` varchar(255),
	`description` text,
	`imageUrl` varchar(500),
	`videoUrl` varchar(500),
	`category` varchar(100),
	`displayOrder` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `portfolio_items_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `reviews` (
	`id` int AUTO_INCREMENT NOT NULL,
	`bookingId` int NOT NULL,
	`reviewerId` int NOT NULL,
	`creativeId` int NOT NULL,
	`rating` int NOT NULL,
	`title` varchar(255),
	`comment` text,
	`isVerified` boolean DEFAULT true,
	`isPublished` boolean DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `reviews_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `transactions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`bookingId` int,
	`gigPostId` int,
	`payerId` int NOT NULL,
	`payeeId` int NOT NULL,
	`amount` int NOT NULL,
	`currency` varchar(10) DEFAULT 'USD',
	`type` enum('deposit','full_payment','refund') DEFAULT 'deposit',
	`paymentMethod` varchar(50) NOT NULL,
	`externalTransactionId` varchar(255),
	`status` enum('pending','completed','failed','refunded') DEFAULT 'pending',
	`metadata` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `transactions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `role` enum('user','admin','creative') NOT NULL DEFAULT 'user';--> statement-breakpoint
ALTER TABLE `users` ADD `userType` enum('client','creative') DEFAULT 'client';