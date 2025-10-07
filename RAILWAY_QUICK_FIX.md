# 🚨 Railway Deployment Health Check Fix

## Problem
Your Railway deployment is failing with health check errors because `DATABASE_URL` is not configured. The server crashes on startup with:
```
DATABASE_URL must be set. Did you forget to provision a database?
```

## Quick Fix Steps (5 minutes)

### Step 1: Add PostgreSQL Database to Railway
1. Go to your Railway project dashboard
2. Click **"+ New"** button
3. Select **"Database"**
4. Choose **"Add PostgreSQL"**
5. Wait for Railway to provision the database (30-60 seconds)

### Step 2: Verify DATABASE_URL is Auto-Injected
1. Click on your **application service** (the Node.js app, not the database)
2. Go to **"Variables"** tab
3. Look for `DATABASE_URL` - it should appear automatically
4. If you don't see it:
   - Click on the **PostgreSQL database service**
   - Go to **"Connect"** tab
   - Copy the **"Database URL"**
   - Go back to your app service → Variables tab
   - Click **"+ New Variable"**
   - Name: `DATABASE_URL`
   - Value: paste the database URL you copied

### Step 3: Add Missing Environment Variables
While you're in the Variables tab, add these required variables from your Replit Secrets:

```
CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
VITE_CLERK_PUBLISHABLE_KEY=pk_test_... (same as above)
ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-...
NODE_ENV=production
```

### Step 4: Trigger Redeploy
1. After adding all variables, Railway will auto-redeploy
2. OR click **"Deploy"** button manually
3. Watch the deployment logs in the **"Deployments"** tab

### Step 5: Run Database Migration
Once the app is running successfully:

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Link to your project
railway link

# Run migration
railway run npm run db:push

# If you get a data-loss warning:
railway run npm run db:push -- --force
```

### Step 6: Verify Success
1. Check the **"Deployments"** tab - status should be "Active"
2. Click on your deployment URL (e.g., `your-app.up.railway.app`)
3. The app should load successfully
4. Try the Clerk authentication - it should work without iframe issues! ✅

## What Was Wrong?
- Railway built your app successfully
- But when it tried to start the server, it crashed immediately
- The server requires DATABASE_URL to initialize the database connection
- Without it, the health check at `/health/server` never responds
- Result: Railway keeps restarting your app in a crash loop

## Prevention for Next Time
✅ **Always add PostgreSQL BEFORE deploying** - Railway auto-injects DATABASE_URL
✅ **Set all environment variables BEFORE first deployment** - Avoids crash loops
✅ **Use Railway's dashboard to verify variable injection** - Check Variables tab

---

## Troubleshooting

### Health Check Still Failing?
1. Check deployment logs: Click **"View Logs"** in your deployment
2. Look for error messages related to missing environment variables
3. Verify all 6 required variables are set (see Step 3)

### Database Connection Errors?
1. Verify DATABASE_URL format: `postgresql://username:password@host:port/database`
2. Make sure PostgreSQL service is running (green dot in Railway dashboard)
3. Check if PostgreSQL is in the same Railway project as your app

### Clerk Authentication Not Working?
1. Verify both CLERK_PUBLISHABLE_KEY and CLERK_SECRET_KEY are set
2. Make sure they're from the same Clerk application
3. Check Clerk dashboard → Configure → Domains → Add your Railway domain

## Next Steps After Fix
Once your app is running:
1. ✅ Test user signup/login with Email and Google
2. ✅ Generate some viral content to test functionality  
3. ✅ Verify content history persistence
4. ✅ Monitor the deployment logs for any runtime errors

Your app will now work perfectly on Railway with proper Clerk authentication! 🎉
