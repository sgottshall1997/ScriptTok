# Railway Deployment Guide

This guide will walk you through deploying your TikTok Viral Product Generator application to Railway, a modern cloud platform that makes deployment simple and scalable.

## Prerequisites

Before you begin, make sure you have:
- Your Replit project ready with all code committed
- Access to your environment variables (Clerk keys, API keys)
- A GitHub account
- A Railway account (free tier available)

---

## Step 1: GitHub Setup

### 1.1 Push Code to GitHub Using Replit

Replit has a built-in GitHub integration that makes pushing your code easy:

1. **Open the Version Control panel** in Replit (left sidebar, git branch icon)
2. **Click "Create a Git repository"** if you haven't already
3. **Connect to GitHub**:
   - Click the "Connect to GitHub" button
   - Authorize Replit to access your GitHub account
   - Follow the prompts to link your Replit account

4. **Create a new GitHub repository**:
   - In the Version Control panel, click "Create new repository"
   - Choose a repository name (e.g., `tiktok-viral-generator`)
   - Select visibility (Public or Private)
   - Click "Create repository"

5. **Push your code**:
   - Replit will automatically push your current code to GitHub
   - Future changes can be pushed using the "Push" button in Version Control

**Alternative: Manual GitHub Setup**

If you prefer to create the repository manually:

```bash
# In Replit Shell
git init
git add .
git commit -m "Initial commit for Railway deployment"
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git branch -M main
git push -u origin main
```

---

## Step 2: Railway Account Setup

### 2.1 Create a Railway Account

1. Go to [railway.app](https://railway.app)
2. Click **"Start a New Project"** or **"Login"**
3. Sign up using one of these methods:
   - **GitHub** (recommended - makes deployment easier)
   - Email
   - Google

### 2.2 Connect GitHub to Railway

1. After logging in, go to your Railway dashboard
2. Click on your profile icon (top-right)
3. Select **"Account Settings"**
4. Navigate to **"Integrations"** tab
5. Click **"Connect"** next to GitHub
6. Authorize Railway to access your GitHub repositories
7. Select which repositories Railway can access (you can choose "All repositories" or specific ones)

---

## Step 3: Deploy the Application

### 3.1 Create a New Railway Project

1. From the Railway dashboard, click **"New Project"**
2. Select **"Deploy from GitHub repo"**
3. Choose your repository: `tiktok-viral-generator` (or whatever you named it)
4. Railway will automatically detect it's a Node.js application

### 3.2 Add PostgreSQL Database

Your application requires a PostgreSQL database. Here's how to add it:

1. In your Railway project dashboard, click **"+ New"**
2. Select **"Database"**
3. Choose **"Add PostgreSQL"**
4. Railway will automatically:
   - Provision a PostgreSQL database
   - Create a `DATABASE_URL` environment variable
   - Link it to your application

### 3.3 Configure Environment Variables

You need to set up all required environment variables from your Replit Secrets:

1. In your Railway project, click on your **application service** (not the database)
2. Navigate to the **"Variables"** tab
3. Click **"+ New Variable"** and add each of the following:

#### Required Environment Variables:

| Variable Name | Description | Where to Find |
|--------------|-------------|---------------|
| `CLERK_PUBLISHABLE_KEY` | Clerk public key for authentication | Replit Secrets or Clerk Dashboard |
| `CLERK_SECRET_KEY` | Clerk secret key for server-side auth | Replit Secrets or Clerk Dashboard |
| `VITE_CLERK_PUBLISHABLE_KEY` | Clerk public key for frontend | Same as CLERK_PUBLISHABLE_KEY |
| `ANTHROPIC_API_KEY` | Claude AI API key | Replit Secrets or Anthropic Console |
| `OPENAI_API_KEY` | OpenAI API key | Replit Secrets or OpenAI Platform |
| `NODE_ENV` | Set to `production` | Enter manually: `production` |

**Note about DATABASE_URL**: 
- ✅ **Already configured** - Railway automatically provides this when you add PostgreSQL
- ❌ **Do NOT manually set** - Let Railway manage this

**Note about VITE_CLERK_FRONTEND_API**: 
- ✅ **Not needed** - Clerk auto-detects this from the publishable key
- ❌ **Do NOT add** - It's deprecated in newer Clerk versions

4. After adding all variables, click **"Deploy"** if prompted, or the deployment will trigger automatically

### 3.4 Verify Build Configuration

Railway should automatically detect your build settings from `railway.json`. Verify these are correct:

1. Go to **"Settings"** tab in your application service
2. Check **"Build"** section:
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`

3. Check **"Deploy"** section:
   - **Health Check Path**: `/health/server` (optional, can be left empty)
   - **Restart Policy**: `ON_FAILURE` with max 10 retries

If anything is missing, you can manually set these in the Settings.

---

## Step 4: Database Migration

After deployment, you need to set up your database schema.

### Option A: Using Railway CLI (Recommended)

1. **Install Railway CLI** (if not already installed):
   ```bash
   npm install -g @railway/cli
   ```

2. **Login to Railway**:
   ```bash
   railway login
   ```

3. **Link to your project**:
   ```bash
   railway link
   ```
   Select your project from the list.

4. **Run database migration**:
   ```bash
   railway run npm run db:push
   ```

   If you get a data-loss warning, use:
   ```bash
   railway run npm run db:push -- --force
   ```

### Option B: Using Railway Dashboard

1. In Railway dashboard, go to your **application service**
2. Click on the **"Deployments"** tab
3. Find the most recent successful deployment
4. Click the **three dots (⋮)** menu
5. Select **"Run a command"**
6. Enter: `npm run db:push`
7. Click **"Run"**
8. Monitor the logs to ensure it completes successfully

### What This Does

The `npm run db:push` command will create all necessary database tables:
- `users` - User accounts (Clerk integration)
- `content_generations` - Generated content storage
- `content_history` - Historical content tracking with ratings
- `trending_products` - Trending product data
- `scraper_status` - API health monitoring
- `daily_scraper_cache` - Cached trending data
- `trend_history` - Historical trend analysis
- `amazon_products` - Product catalog
- `affiliate_links` - Monetization tracking
- `sessions` - Session management
- `api_usage` - Usage statistics

---

## Step 5: Verification

### 5.1 Check Deployment Status

1. In Railway dashboard, go to **"Deployments"** tab
2. Verify the latest deployment shows **"SUCCESS"** status
3. Check the deployment logs for any errors:
   - Click on the deployment
   - Review the **"Build Logs"** and **"Deploy Logs"** tabs

### 5.2 Test Your Live Application

1. In Railway dashboard, go to **"Settings"** tab
2. Under **"Domains"**, you'll see your Railway-provided URL (e.g., `your-app.up.railway.app`)
3. Click **"Generate Domain"** if not already generated
4. Open the URL in your browser

### 5.3 Verify Clerk Authentication

Railway deployment solves the iframe issues common with Replit:

1. Navigate to your deployed application
2. Click on any "Sign In" or "Sign Up" button
3. **Verify that**:
   - ✅ Clerk authentication modal opens properly (no iframe errors)
   - ✅ You can sign up for a new account
   - ✅ You can log in with existing credentials
   - ✅ After login, you're redirected to the dashboard

4. **Check Clerk Dashboard**:
   - Go to [Clerk Dashboard](https://dashboard.clerk.com)
   - Navigate to your application
   - Go to **"Domains"** section
   - Add your Railway domain to allowed domains if needed

### 5.4 Test Core Features

Verify the main application functionality:

1. **Content Generation**:
   - Navigate to "Generate Content" page
   - Enter a product name
   - Select niche, tone, and template
   - Click "Generate" and verify content is created

2. **Trending Products**:
   - Check "Trending AI Picks" page
   - Verify trending products are displayed

3. **Content History**:
   - Go to "Content History" page
   - Verify previously generated content appears
   - Test rating and feedback features

---

## Step 6: Troubleshooting

### Common Issues and Solutions

#### 6.1 Build Failures

**Problem**: Build fails with dependency errors

**Solution**:
```bash
# Check package.json is committed to git
# Ensure node version compatibility
# In Railway Settings > Deploy, try setting:
# - Node Version: 20
```

**Problem**: Build timeout

**Solution**:
- Increase timeout in Railway Settings
- Check for unnecessary build steps
- Review build logs for slow operations

#### 6.2 Database Connection Issues

**Problem**: "DATABASE_URL must be set" error

**Solution**:
1. Verify PostgreSQL service is added to project
2. Check that DATABASE_URL appears in Variables tab
3. Ensure database and app are in the same project
4. Try redeploying the application

**Problem**: Database migration fails

**Solution**:
```bash
# Use force flag if needed
railway run npm run db:push -- --force

# Or check database connection manually
railway run npm run check
```

#### 6.3 Application Runtime Errors

**Problem**: 500 Internal Server Error

**Solution**:
1. Check **Deploy Logs** in Railway dashboard
2. Look for error messages about missing environment variables
3. Verify all required secrets are set
4. Check database connection is successful

**Problem**: Clerk authentication not working

**Solution**:
1. Verify `CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY` are set
2. Ensure `VITE_CLERK_PUBLISHABLE_KEY` matches `CLERK_PUBLISHABLE_KEY`
3. Add Railway domain to Clerk's allowed domains:
   - Go to Clerk Dashboard
   - Navigate to **"Domains"** 
   - Add your Railway URL

#### 6.4 Port/Network Issues

**Problem**: Application won't start

**Solution**:
- Railway automatically assigns PORT
- Ensure your app uses `process.env.PORT` (already configured in `server/index.ts`)
- Server listens on `0.0.0.0` (already configured)

#### 6.5 Checking Logs

**View Real-time Logs**:
1. Railway Dashboard → Your Service → **"Deployments"** tab
2. Click on active deployment
3. View live logs in **"Deploy Logs"** tab

**View Historical Logs**:
1. Use Railway CLI:
   ```bash
   railway logs
   ```

**Search Logs**:
```bash
# Filter by error
railway logs | grep -i error

# Filter by specific service
railway logs --service=web
```

#### 6.6 Environment Variable Issues

**Problem**: Features not working (AI generation, trending products)

**Solution**:
1. Double-check all API keys are correctly copied (no extra spaces)
2. Verify keys are valid and active:
   - Test Clerk keys in Clerk Dashboard
   - Test OpenAI key at [OpenAI Platform](https://platform.openai.com)
   - Test Anthropic key at [Anthropic Console](https://console.anthropic.com)
3. Ensure `NODE_ENV=production` is set
4. Redeploy after adding/updating variables

---

## Step 7: Post-Deployment Best Practices

### 7.1 Custom Domain (Optional)

1. Purchase a domain from any registrar (Namecheap, Google Domains, etc.)
2. In Railway dashboard → **Settings** → **Domains**
3. Click **"Custom Domain"**
4. Follow instructions to add DNS records
5. Wait for SSL certificate provisioning (automatic)

### 7.2 Monitoring & Alerts

1. **Set up Railway Alerts**:
   - Railway Dashboard → Project Settings → Notifications
   - Add email or Slack notifications for deployments
   - Configure alerts for service failures

2. **Monitor Database Usage**:
   - Check PostgreSQL metrics in Railway dashboard
   - Monitor storage and connection limits

3. **Track Costs**:
   - Railway free tier: $5/month credit
   - Monitor usage in Settings → Billing
   - Set up billing alerts to avoid surprises

### 7.3 Continuous Deployment

Railway automatically redeploys when you push to GitHub:

1. Make changes in Replit
2. Commit and push to GitHub via Replit's Version Control
3. Railway detects the push and automatically deploys
4. Monitor deployment in Railway dashboard

### 7.4 Scaling Considerations

As your application grows:

1. **Upgrade Database**: Switch to Pro plan for more connections
2. **Add Redis**: For caching and session management
3. **Set up Replicas**: For high availability
4. **Monitor Performance**: Use Railway metrics and external tools

---

## Helpful Resources

- 📚 [Railway Documentation](https://docs.railway.app)
- 🎓 [Railway CLI Guide](https://docs.railway.app/develop/cli)
- 🔐 [Clerk Documentation](https://clerk.com/docs)
- 🤖 [OpenAI API Docs](https://platform.openai.com/docs)
- 🧠 [Anthropic API Docs](https://docs.anthropic.com)
- 💬 [Railway Discord Community](https://discord.gg/railway)

---

## Quick Command Reference

```bash
# Railway CLI Commands
railway login                    # Login to Railway
railway link                     # Link to project
railway run <command>            # Run command in Railway environment
railway logs                     # View application logs
railway variables                # List environment variables
railway open                     # Open project in browser

# Database Commands
railway run npm run db:push      # Push database schema
railway run npm run db:push -- --force  # Force push schema (with data loss)

# Deployment
git push origin main             # Push to GitHub (triggers auto-deploy)
railway up                       # Manual deployment via CLI
```

---

## Success Checklist

Before considering your deployment complete, verify:

- [ ] ✅ Application builds successfully without errors
- [ ] ✅ All environment variables are set correctly
- [ ] ✅ PostgreSQL database is connected
- [ ] ✅ Database schema is migrated (`npm run db:push` completed)
- [ ] ✅ Application is accessible via Railway URL
- [ ] ✅ Clerk authentication works (sign up/login)
- [ ] ✅ Content generation features work
- [ ] ✅ Trending products are displayed
- [ ] ✅ Content history is saved and retrievable
- [ ] ✅ No console errors in browser developer tools
- [ ] ✅ Deployment logs show no errors
- [ ] ✅ SSL certificate is active (https:// works)

---

## Need Help?

If you encounter issues not covered in this guide:

1. **Check Railway Status**: [status.railway.app](https://status.railway.app)
2. **Railway Discord**: Join the community for quick support
3. **Clerk Support**: [support.clerk.com](https://support.clerk.com)
4. **GitHub Issues**: Review deployment logs and search for similar issues

---

**Congratulations!** 🎉 Your TikTok Viral Product Generator is now live on Railway with proper authentication, database, and all features working. Share your Railway URL and start generating viral content!
