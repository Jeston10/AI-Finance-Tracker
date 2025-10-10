# 🔧 Railway Deployment Fix

## Issue
Error: `Cannot find module '/app/index.js'`

## Root Cause
Railway is trying to run the app before it's built, or using the wrong entry point.

## ✅ Solution Applied

### 1. Updated `package.json`
- Changed `main` to `dist/index.js`
- Updated `start` script to ensure Prisma generates before starting
- Added `start:prod` for production use
- Added `postinstall` to auto-generate Prisma client

### 2. Created `railway.json`
Explicit configuration for Railway deployment with:
- Build command: `npm install && npm run build`
- Start command: `npm run start:prod`

### 3. Created `render.yaml`
Alternative configuration for Render.com deployment

---

## 🚀 Deployment Steps for Railway

### Method 1: Using Railway Dashboard (Recommended)

1. **Create New Project** on Railway.app
2. **Deploy from GitHub** - Select your repository
3. **Configure Settings**:
   - Go to **Settings** → **Service Settings**
   - **Root Directory**: `Backend`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm run start:prod`
   - **Watch Paths**: `Backend/**`

4. **Add Environment Variables** (Variables tab):
   ```
   PORT=4000
   NODE_ENV=production
   DATABASE_URL=<your_supabase_connection_string>
   JWT_SECRET=<generate_new_secret>
   OPENAI_API_KEY=<your_key>
   GROQ_API_KEY=<your_key>
   HUGGINGFACE_API_KEY=<your_key>
   EMAIL_USER=<your_email>
   EMAIL_PASSWORD=<your_app_password>
   NEWS_API_KEY=<your_newsapi_key>
   FRONTEND_ORIGIN=https://your-app.vercel.app
   FRONTEND_URL=https://your-app.vercel.app
   SUPABASE_URL=<your_supabase_url>
   SUPABASE_ANON_KEY=<your_key>
   SUPABASE_SERVICE_ROLE_KEY=<your_key>
   ```

5. **Deploy** - Railway will automatically build and start your app

### Method 2: Using Railway CLI

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Link project
railway link

# Deploy
railway up
```

---

## 🔍 Verify Deployment

### Check if backend is running:
```bash
curl https://your-app.up.railway.app/api/health
```

### Check logs in Railway:
- Go to your project
- Click on the service
- View **Deployments** → **Logs**

---

## 🐛 Common Issues & Fixes

### Issue: Build fails with Prisma error
**Fix**: Ensure `DATABASE_URL` is set in environment variables before build

### Issue: Module not found errors
**Fix**: 
- Verify `npm run build` completes successfully locally
- Check that `dist/` folder is created
- Ensure `tsconfig.json` is correct

### Issue: Port binding error
**Fix**: Railway automatically sets `PORT` env var, ensure your code uses `process.env.PORT`

### Issue: Database connection fails
**Fix**:
- Verify `DATABASE_URL` is correct
- Check Supabase allows connections from Railway IPs
- Ensure `?pgbouncer=true` is in connection string

---

## ✅ Success Indicators

Your deployment is successful when you see:
```
⚠️  Using hardcoded DATABASE_URL as fallback
Server listening on http://localhost:4000
🕐 Starting cron jobs for budget monitoring...
✅ All cron jobs started successfully
```

---

## 🎯 Next Steps After Successful Deployment

1. **Copy your Railway URL** (e.g., `https://your-app.up.railway.app`)
2. **Deploy Frontend to Vercel** using this backend URL
3. **Update Backend CORS** with your Vercel frontend URL
4. **Test the full application**

---

**Your backend is now configured for successful deployment! 🚀**

