# 🚀 Deployment Guide

This guide will help you deploy your AI Budget Forecasting application to production.

## 📋 Architecture

- **Frontend**: Next.js → Deploy to **Vercel** ✅ (https://ai-finance-tracker-six.vercel.app/)
- **Backend**: Node.js/Express → Deploy to **Render.com** ✅
- **Database**: PostgreSQL → Already on **Supabase** ✅

---

## 🔧 Part 1: Deploy Backend (Render.com)

### Why Render?
- ✅ Free tier available
- ✅ Easy PostgreSQL integration
- ✅ Automatic deployments from GitHub
- ✅ Environment variables management
- ✅ Built-in logging and monitoring

### Steps:

#### 1. Sign up for Render
- Go to: https://render.com/
- Sign up with GitHub

#### 2. Create New Web Service
- Click "New +" → "Web Service"
- Connect your GitHub repository
- Select your repository

#### 3. Configure Service Settings
- **Name**: ai-budget-backend
- **Root Directory**: `Backend`
- **Environment**: Node
- **Build Command**: `npm install && npx prisma generate`
- **Start Command**: `npm start`

#### 4. Configure Environment Variables
In Render dashboard, go to **Environment** tab and add:

```
PORT=4000
NODE_ENV=production
DATABASE_URL=postgresql://postgres.ctednhuhnuuefvcrhyto:gfdytyytxtt@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres?pgbouncer=true
SUPABASE_URL=https://ctednhuhnuuefvcrhyto.supabase.co
SUPABASE_ANON_KEY=<your_supabase_anon_key>
SUPABASE_SERVICE_ROLE_KEY=<your_supabase_service_role_key>
JWT_SECRET=<your_jwt_secret>
JWT_EXPIRES_IN=7d
OPENAI_API_KEY=<your_openai_key>
GROQ_API_KEY=<your_groq_key>
HUGGINGFACE_API_KEY=<your_huggingface_key>
EMAIL_USER=sjestonsingh@gmail.com
EMAIL_PASSWORD=<your_gmail_app_password>
FRONTEND_ORIGIN=https://ai-finance-tracker-six.vercel.app
FRONTEND_URL=https://ai-finance-tracker-six.vercel.app
NEWS_API_KEY=<your_newsapi_key>
```

#### 5. Deploy
- Click "Create Web Service"
- Render will give you a URL like: `https://your-app.onrender.com`
- Copy this URL for frontend configuration

---

## 🎨 Part 2: Deploy Frontend (Vercel)

### Steps:

#### 1. Sign up for Vercel
- Go to: https://vercel.com/
- Sign up with GitHub

#### 2. Import Project
- Click "Add New" → "Project"
- Import your GitHub repository
- Select the `Frontend` folder as root directory

#### 3. Configure Build Settings
- **Framework Preset**: Next.js
- **Root Directory**: `Frontend`
- **Build Command**: `npm run build`
- **Output Directory**: `.next`

#### 4. Configure Environment Variables
In Vercel dashboard, add these environment variables:

```
NEXT_PUBLIC_API_URL=https://your-backend.onrender.com/api
NEXT_PUBLIC_SOCKET_URL=https://your-backend.onrender.com
```

#### 5. Deploy
- Click "Deploy"
- Vercel will give you a URL like: `https://your-app.vercel.app`

#### 6. Update Backend CORS
After getting your Vercel URL, go back to Render and update:
```
FRONTEND_ORIGIN=https://your-app.vercel.app
FRONTEND_URL=https://your-app.vercel.app
```

---

## 🔄 Part 3: Update Frontend Config

Update `Frontend/lib/config.ts`:

```typescript
export const config = {
  apiUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api',
  socketUrl: process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:4000',
}
```

---

## ✅ Part 4: Final Checks

### Test Your Deployment:

1. **Backend Health Check**
   ```
   curl https://your-backend.onrender.com/api/health
   ```

2. **Frontend**
   - Visit your Vercel URL
   - Try logging in
   - Create a transaction
   - Check if real-time updates work

3. **Database**
   - Your Supabase database is already configured ✅
   - No additional setup needed

---

## 📊 Cost Breakdown

| Service | Free Tier | Cost |
|---------|-----------|------|
| **Vercel** (Frontend) | 100GB bandwidth/month | Free |
| **Render** (Backend) | 750 hours/month | Free |
| **Supabase** (Database) | 500MB database, 2GB bandwidth | Free |
| **NewsAPI** | 100 requests/day | Free |
| **Total** | | **$0/month** |

---

## 🔐 Security Checklist

Before deploying:

- ✅ All sensitive keys in `.env` (not committed to git)
- ✅ `.gitignore` configured properly
- ✅ CORS configured for production domain
- ✅ JWT_SECRET is strong (min 32 characters recommended)
- ✅ Gmail App Password (not regular password)
- ✅ Database connection string secured

---

## 🐛 Troubleshooting

### Backend won't start on Render:
- Check logs in Render dashboard
- Verify all environment variables are set
- Ensure `package.json` has correct `start` script

### Frontend can't connect to Backend:
- Verify `NEXT_PUBLIC_API_URL` is correct
- Check CORS settings in backend
- Ensure backend is deployed and running

### Database connection fails:
- Verify `DATABASE_URL` is correct
- Check Supabase connection pooler is enabled
- Ensure IP restrictions are disabled in Supabase

---

## 🎉 Next Steps

After deployment:
1. Set up custom domain (optional)
2. Configure SSL certificates (automatic on Vercel/Render)
3. Set up monitoring and alerts
4. Configure automatic deployments from GitHub
5. Add production analytics

---

**Need help?** Check the Render/Vercel documentation or let me know if you encounter any issues!

