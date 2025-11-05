# CreateSpace Deployment Guide

This guide provides comprehensive instructions for deploying CreateSpace to production and managing the platform.

## Table of Contents

1. [Local Development Setup](#local-development-setup)
2. [Database Setup](#database-setup)
3. [Environment Configuration](#environment-configuration)
4. [Running the Application](#running-the-application)
5. [Production Deployment](#production-deployment)
6. [Monitoring and Maintenance](#monitoring-and-maintenance)
7. [Troubleshooting](#troubleshooting)

## Local Development Setup

### Prerequisites

Ensure you have the following installed:
- Node.js 18.0 or higher
- npm 9.0 or higher (or pnpm 8.0+)
- Git
- MySQL 8.0+ or TiDB compatible database

### Installation Steps

1. **Clone the repository**
```bash
git clone https://github.com/osasbenny/createspace.git
cd createspace
```

2. **Install dependencies**
```bash
pnpm install
# or
npm install
```

3. **Create environment file**
```bash
cp .env.example .env.local
```

4. **Configure environment variables** (see [Environment Configuration](#environment-configuration))

5. **Set up database**
```bash
pnpm db:push
```

6. **Start development server**
```bash
pnpm dev
```

The application will be available at `http://localhost:3000`

## Database Setup

### MySQL/TiDB Configuration

CreateSpace uses Drizzle ORM with MySQL/TiDB. Follow these steps:

1. **Create database**
```sql
CREATE DATABASE createspace CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

2. **Create database user**
```sql
CREATE USER 'createspace'@'localhost' IDENTIFIED BY 'secure_password';
GRANT ALL PRIVILEGES ON createspace.* TO 'createspace'@'localhost';
FLUSH PRIVILEGES;
```

3. **Update DATABASE_URL in .env**
```
DATABASE_URL=mysql://createspace:secure_password@localhost:3306/createspace
```

4. **Run migrations**
```bash
pnpm db:push
```

### Schema Overview

The database includes 12 core tables:

| Table | Purpose |
|-------|---------|
| `users` | User accounts and authentication |
| `creative_profiles` | Creative professional profiles |
| `bookings` | Service bookings and reservations |
| `conversations` | Messaging conversations |
| `messages` | Individual messages |
| `deliverables` | Project deliverables and files |
| `reviews` | Client reviews and ratings |
| `gig_posts` | Job postings on gig board |
| `gig_applications` | Applications to gig posts |
| `transactions` | Payment records |
| `portfolio_items` | Creative work samples |
| `availability` | Creative availability calendar |

## Environment Configuration

### Required Environment Variables

```env
# Database
DATABASE_URL=mysql://user:password@host:3306/createspace

# Authentication
JWT_SECRET=your_jwt_secret_key_here
VITE_APP_ID=your_manus_app_id

# OAuth
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://oauth.manus.im

# API Keys
BUILT_IN_FORGE_API_KEY=your_forge_api_key
BUILT_IN_FORGE_API_URL=https://api.manus.im
VITE_FRONTEND_FORGE_API_KEY=your_frontend_key
VITE_FRONTEND_FORGE_API_URL=https://api.manus.im

# App Configuration
VITE_APP_TITLE=CreateSpace
VITE_APP_LOGO=https://your-domain.com/logo.png
OWNER_NAME=Your Name
OWNER_OPEN_ID=your_open_id
```

### Optional Environment Variables

```env
# Payment Processing
PAYSTACK_SECRET_KEY=your_paystack_key
STRIPE_SECRET_KEY=your_stripe_key

# File Storage
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_CLOUD_NAME=your_cloud_name

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_app_password

# Analytics
VITE_ANALYTICS_ENDPOINT=https://analytics.your-domain.com
VITE_ANALYTICS_WEBSITE_ID=your_website_id
```

## Running the Application

### Development Mode

```bash
pnpm dev
```

This starts:
- Frontend dev server on `http://localhost:5173`
- Backend API on `http://localhost:3000`
- Database migrations (if needed)

### Production Build

```bash
pnpm build
```

This creates optimized builds for both frontend and backend.

### Start Production Server

```bash
pnpm start
```

## Production Deployment

### Deployment Options

#### Option 1: Traditional Server (VPS/EC2)

1. **SSH into your server**
```bash
ssh user@your-server.com
```

2. **Clone and setup**
```bash
git clone https://github.com/osasbenny/createspace.git
cd createspace
pnpm install
```

3. **Configure environment**
```bash
nano .env.production
```

4. **Build application**
```bash
pnpm build
```

5. **Start with PM2**
```bash
npm install -g pm2
pm2 start "pnpm start" --name createspace
pm2 save
pm2 startup
```

6. **Configure Nginx reverse proxy**
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

7. **Enable HTTPS with Let's Encrypt**
```bash
sudo certbot --nginx -d your-domain.com
```

#### Option 2: Docker Deployment

1. **Create Dockerfile**
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN pnpm install --prod

COPY . .
RUN pnpm build

EXPOSE 3000

CMD ["pnpm", "start"]
```

2. **Build and run**
```bash
docker build -t createspace:latest .
docker run -p 3000:3000 --env-file .env.production createspace:latest
```

#### Option 3: Vercel/Netlify

1. **Connect GitHub repository**
2. **Set environment variables** in platform settings
3. **Deploy** (automatic on push to main)

### Database Backup Strategy

**Daily backups:**
```bash
#!/bin/bash
BACKUP_DIR="/backups/createspace"
DATE=$(date +%Y%m%d_%H%M%S)
mysqldump -u createspace -p createspace > $BACKUP_DIR/backup_$DATE.sql
gzip $BACKUP_DIR/backup_$DATE.sql
```

**Schedule with cron:**
```bash
0 2 * * * /path/to/backup-script.sh
```

## Monitoring and Maintenance

### Application Monitoring

**PM2 Monitoring:**
```bash
pm2 monit
pm2 logs createspace
```

**Health Check Endpoint:**
```bash
curl http://localhost:3000/api/health
```

### Database Maintenance

**Check database size:**
```sql
SELECT table_name, ROUND(((data_length + index_length) / 1024 / 1024), 2) AS size_mb
FROM information_schema.tables
WHERE table_schema = 'createspace'
ORDER BY size_mb DESC;
```

**Optimize tables:**
```sql
OPTIMIZE TABLE users, creative_profiles, bookings;
```

### Performance Optimization

1. **Enable query caching** in MySQL
2. **Add database indexes** for frequently queried fields
3. **Implement Redis** for session storage
4. **Use CDN** for static assets
5. **Enable gzip compression** in Nginx

### Security Updates

**Keep dependencies updated:**
```bash
pnpm update
pnpm audit
```

**SSL/TLS Certificate Renewal:**
```bash
sudo certbot renew --dry-run
sudo certbot renew
```

## Troubleshooting

### Common Issues

**Issue: Database connection failed**
- Check DATABASE_URL format
- Verify MySQL service is running
- Confirm user permissions
```bash
mysql -u createspace -p -h localhost createspace -e "SELECT 1;"
```

**Issue: OAuth authentication not working**
- Verify VITE_APP_ID is correct
- Check OAUTH_SERVER_URL is accessible
- Clear browser cookies and cache

**Issue: File uploads failing**
- Check S3/storage permissions
- Verify file size limits
- Check disk space availability

**Issue: High memory usage**
- Check for memory leaks: `pm2 monit`
- Review application logs: `pm2 logs createspace`
- Restart application: `pm2 restart createspace`

**Issue: Slow database queries**
- Run `EXPLAIN` on slow queries
- Add missing indexes
- Check query optimization

### Viewing Logs

**Application logs:**
```bash
pm2 logs createspace
tail -f logs/application.log
```

**Database logs:**
```bash
tail -f /var/log/mysql/error.log
```

**Nginx logs:**
```bash
tail -f /var/log/nginx/error.log
tail -f /var/log/nginx/access.log
```

### Performance Metrics

**Monitor key metrics:**
- Request response time
- Database query time
- Memory usage
- CPU usage
- Disk I/O

**Tools:**
- PM2 Plus for monitoring
- New Relic for APM
- DataDog for infrastructure
- Sentry for error tracking

## Scaling Considerations

### Horizontal Scaling

1. **Load Balancing:** Use Nginx or HAProxy
2. **Database Replication:** Master-slave setup
3. **Caching Layer:** Redis for sessions and data
4. **Message Queue:** Bull/RabbitMQ for async jobs

### Vertical Scaling

1. Increase server RAM
2. Upgrade CPU
3. Optimize database indexes
4. Implement query caching

## Support and Resources

- **Documentation:** See PROJECT_README.md
- **GitHub Issues:** https://github.com/osasbenny/createspace/issues
- **Community:** Join our community forums
- **Email Support:** support@createspace.local

## Rollback Procedures

If deployment fails:

```bash
# Revert to previous version
git revert HEAD
pnpm build
pm2 restart createspace

# Or restore from backup
git checkout previous-tag
pnpm install
pnpm db:push
pm2 restart createspace
```

## Next Steps

After deployment:

1. Test all features in production
2. Monitor error logs and performance
3. Set up automated backups
4. Configure monitoring alerts
5. Document any customizations
6. Train support team
7. Plan maintenance windows
