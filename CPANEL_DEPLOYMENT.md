# CreateSpace cPanel Deployment Guide

This guide provides step-by-step instructions for deploying CreateSpace to a cPanel hosting environment.

## Prerequisites

- cPanel/WHM hosting account
- Node.js support enabled on your hosting (or SSH access to install)
- MySQL database access
- SSH access to your server
- Git installed on the server

## Step 1: Prepare Your Server

### 1.1 SSH into Your Server

```bash
ssh username@your-domain.com
```

### 1.2 Check Node.js Installation

```bash
node --version
npm --version
```

If Node.js is not installed, contact your hosting provider or use SSH to install it:

```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### 1.3 Install pnpm

```bash
npm install -g pnpm
pnpm --version
```

## Step 2: Clone and Setup Project

### 2.1 Navigate to Your Public Directory

```bash
cd ~/public_html
# or for subdomain
cd ~/public_html/createspace
```

### 2.2 Clone the Repository

```bash
git clone https://github.com/osasbenny/createspace.git .
# or if cloning into a subdirectory
git clone https://github.com/osasbenny/createspace.git createspace
cd createspace
```

### 2.3 Install Dependencies

```bash
pnpm install
```

## Step 3: Configure Environment Variables

### 3.1 Create .env File

```bash
cp .env.example .env
nano .env
```

### 3.2 Set Required Variables

```env
# Database (from cPanel MySQL)
DATABASE_URL=mysql://cpanel_user:password@localhost:3306/cpanel_dbname

# Authentication
JWT_SECRET=generate_a_random_string_here
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

# Optional: Payment Processing
PAYSTACK_SECRET_KEY=your_paystack_key
STRIPE_SECRET_KEY=your_stripe_key
```

Save with `Ctrl+O`, `Enter`, `Ctrl+X`

## Step 4: Setup Database

### 4.1 Create Database via cPanel

1. Log into cPanel
2. Go to **MySQL Databases**
3. Create a new database (e.g., `createspace_db`)
4. Create a new user with password
5. Add user to database with ALL privileges

### 4.2 Run Migrations

```bash
pnpm db:push
```

This will create all necessary tables.

## Step 5: Build for Production

### 5.1 Create Production Build

```bash
pnpm build
```

This creates a `dist` folder with:
- `dist/index.js` - Backend server
- `dist/public/` - Frontend static files

## Step 6: Configure Node.js Application in cPanel

### 6.1 Using cPanel Node.js Manager

1. Log into cPanel
2. Go to **Node.js Manager** (or **Setup Node.js App**)
3. Click **Create Application**
4. Configure:
   - **Node.js version:** 18.x or higher
   - **Application root:** `/home/username/public_html/createspace` (or your path)
   - **Application URL:** `your-domain.com` (or subdomain)
   - **Application startup file:** `dist/index.js`
5. Click **Create**

### 6.2 Manual Configuration (If Node.js Manager Not Available)

Create a `.htaccess` file in your public_html:

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteCond %{HTTP_HOST} ^your-domain\.com$ [OR]
  RewriteCond %{HTTP_HOST} ^www\.your-domain\.com$
  RewriteRule ^(.*)$ "http://127.0.0.1:3000/$1" [P,L]
</IfModule>
```

Then start the Node.js app manually via SSH:

```bash
cd ~/public_html/createspace
nohup node dist/index.js > app.log 2>&1 &
```

## Step 7: Configure Reverse Proxy (Nginx/Apache)

### 7.1 For Apache with mod_proxy

Add to `.htaccess`:

```apache
<IfModule mod_proxy.c>
  ProxyPreserveHost On
  ProxyPass / http://127.0.0.1:3000/
  ProxyPassReverse / http://127.0.0.1:3000/
</IfModule>
```

### 7.2 For Nginx (if available)

Create `/etc/nginx/sites-available/createspace`:

```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable it:

```bash
sudo ln -s /etc/nginx/sites-available/createspace /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## Step 8: Setup SSL Certificate

### 8.1 Using cPanel AutoSSL

1. Log into cPanel
2. Go to **AutoSSL**
3. Your domain should be listed
4. Click **Check & Install** for your domain

### 8.2 Manual Let's Encrypt

```bash
sudo certbot certonly --webroot -w ~/public_html -d your-domain.com -d www.your-domain.com
```

## Step 9: Process Management

### 9.1 Using PM2 (Recommended)

```bash
npm install -g pm2
cd ~/public_html/createspace
pm2 start dist/index.js --name "createspace"
pm2 save
pm2 startup
```

### 9.2 Create Restart Script

Create `restart.sh`:

```bash
#!/bin/bash
cd ~/public_html/createspace
git pull origin master
pnpm install
pnpm build
pm2 restart createspace
```

Make executable:

```bash
chmod +x restart.sh
```

## Step 10: Database Backup

### 10.1 Automatic Backups via cPanel

1. Log into cPanel
2. Go to **Backup**
3. Configure automatic backup schedule

### 10.2 Manual Backup

```bash
mysqldump -u cpanel_user -p cpanel_dbname > backup.sql
```

## Step 11: Monitoring and Logs

### 11.1 View Application Logs

```bash
# If using PM2
pm2 logs createspace

# If using nohup
tail -f ~/public_html/createspace/app.log
```

### 11.2 View Error Logs

```bash
# Apache error log
tail -f ~/logs/error_log

# cPanel error log
tail -f ~/logs/error_log
```

### 11.3 Monitor Application

```bash
pm2 monit
```

## Step 12: Update and Maintenance

### 12.1 Pull Latest Changes

```bash
cd ~/public_html/createspace
git pull origin master
pnpm install
pnpm build
pm2 restart createspace
```

### 12.2 Database Migrations

After pulling changes:

```bash
pnpm db:push
```

## Troubleshooting

### Issue: "Cannot find module" errors

**Solution:**
```bash
rm -rf node_modules pnpm-lock.yaml
pnpm install
pnpm build
```

### Issue: Database connection failed

**Solution:**
1. Verify DATABASE_URL in .env
2. Check MySQL user permissions in cPanel
3. Test connection:
```bash
mysql -u cpanel_user -p -h localhost cpanel_dbname -e "SELECT 1;"
```

### Issue: Port 3000 already in use

**Solution:**
```bash
# Find process using port 3000
lsof -i :3000

# Kill the process
kill -9 PID

# Or change port in .env
PORT=3001
```

### Issue: Application not starting

**Solution:**
1. Check logs: `pm2 logs createspace`
2. Verify .env file exists and is readable
3. Ensure database is accessible
4. Check Node.js version compatibility

### Issue: Static files not loading

**Solution:**
1. Verify `dist/public` folder exists
2. Check file permissions: `chmod -R 755 dist/public`
3. Clear browser cache
4. Check reverse proxy configuration

## Performance Optimization

### 1. Enable Gzip Compression

In `.htaccess`:

```apache
<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/html text/plain text/xml text/css text/javascript application/javascript
</IfModule>
```

### 2. Set Cache Headers

```apache
<IfModule mod_expires.c>
  ExpiresActive On
  ExpiresByType text/css "access plus 1 month"
  ExpiresByType text/javascript "access plus 1 month"
  ExpiresByType image/jpeg "access plus 1 year"
  ExpiresByType image/png "access plus 1 year"
</IfModule>
```

### 3. Database Optimization

```bash
mysql -u cpanel_user -p cpanel_dbname
OPTIMIZE TABLE users, creative_profiles, bookings;
```

## Security Hardening

### 1. Protect .env File

```apache
<Files .env>
  Order allow,deny
  Deny from all
</Files>
```

### 2. Disable Directory Listing

```apache
Options -Indexes
```

### 3. Set Secure Headers

```apache
Header set X-Content-Type-Options "nosniff"
Header set X-Frame-Options "SAMEORIGIN"
Header set X-XSS-Protection "1; mode=block"
```

## Deployment Checklist

- [ ] Node.js installed and verified
- [ ] Repository cloned
- [ ] Dependencies installed (`pnpm install`)
- [ ] .env file created and configured
- [ ] Database created and user assigned
- [ ] Migrations run (`pnpm db:push`)
- [ ] Production build created (`pnpm build`)
- [ ] Node.js app configured in cPanel
- [ ] Reverse proxy configured
- [ ] SSL certificate installed
- [ ] Process manager (PM2) setup
- [ ] Logs monitored
- [ ] Backup system configured
- [ ] Domain pointing to server
- [ ] Application tested and working

## Support

For issues or questions:
- Check logs: `pm2 logs createspace`
- Review error messages in cPanel
- Consult PROJECT_README.md
- Visit GitHub Issues: https://github.com/osasbenny/createspace/issues
