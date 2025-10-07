# Railway + Vite Environment Variables Fix

## Problem
Getting `supabaseUrl is required` error even after adding `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` to Railway.

## Root Cause
**Vite environment variables are embedded at BUILD time, not runtime.**

When Railway builds your app:
1. It runs `vite build` to compile your frontend code
2. During this build, Vite reads `VITE_*` environment variables
3. These values are HARDCODED into the compiled JavaScript files
4. At runtime, the values cannot be changed

## Solution

### Step 1: Verify Variables in Railway
1. Go to Railway dashboard
2. Select your project
3. Click on your app service (not database)
4. Go to **Variables** tab
5. Verify these exact variables exist:
   - `VITE_SUPABASE_URL` (case-sensitive!)
   - `VITE_SUPABASE_ANON_KEY` (case-sensitive!)

### Step 2: Trigger New Deployment
After adding or modifying VITE_ variables, you MUST redeploy:

**Option A: Manual Redeploy**
1. In Railway, go to your project
2. Click the **"Deploy"** button
3. Wait for build to complete

**Option B: Git Push**
1. Make any small change (even a comment)
2. Commit and push to GitHub
3. Railway will auto-deploy

### Step 3: Verify Build Logs
1. In Railway, click on your latest deployment
2. Check build logs for:
   ```
   ✅ Supabase client initialized successfully
   ```
3. If you see the error still, variables weren't available during build

## Common Mistakes

❌ **Adding variables AFTER first deploy**
- First build: no variables → empty strings embedded
- Adding variables later: doesn't help, need to rebuild

❌ **Wrong variable names**
- `SUPABASE_URL` → ❌ Wrong (missing VITE_ prefix)
- `VITE_SUPABASE_URL` → ✅ Correct

❌ **Not redeploying after adding variables**
- Variables exist but old build still running
- Must trigger new deployment

## How to Check If It Worked

1. **In Browser Console** (after redeploy):
   ```javascript
   // Should see success message
   ✅ Supabase client initialized successfully
   ```

2. **Check Network Tab**:
   - Your app should make requests to Supabase
   - No "supabaseUrl is required" errors

3. **Test Authentication**:
   - Try to sign up/login
   - Should connect to Supabase

## Still Not Working?

### Debug Checklist:
- [ ] Variables have exact names: `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
- [ ] Variables are in the APP service (not database service)
- [ ] You triggered a NEW deployment after adding variables
- [ ] Build logs show no errors
- [ ] Browser console shows "Supabase client initialized successfully"

### Get Values from Supabase:
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to **Settings** → **API**
4. Copy:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **Project API keys** → `anon/public` key → `VITE_SUPABASE_ANON_KEY`

## Why VITE_ Prefix?

Vite only exposes environment variables to the frontend that start with `VITE_`. This prevents accidentally exposing server secrets to the browser.

**Frontend (browser) needs VITE_ prefix:**
```bash
VITE_SUPABASE_URL=...        # ✅ Available in browser
VITE_SUPABASE_ANON_KEY=...   # ✅ Available in browser
```

**Backend (server) doesn't need prefix:**
```bash
DATABASE_URL=...             # ✅ Server-only
OPENAI_API_KEY=...          # ✅ Server-only
```
