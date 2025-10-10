# ✅ Pre-Deployment Checklist

## Before You Deploy

### 1. Push Code to GitHub
```bash
git init
git add .
git commit -m "Initial commit - AI Budget Forecasting App"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

### 2. Get Your API Keys Ready
Have these ready to paste into Railway/Vercel:

- ✅ DATABASE_URL (from Supabase)
- ✅ SUPABASE_ANON_KEY
- ✅ SUPABASE_SERVICE_ROLE_KEY
- ✅ JWT_SECRET (generate: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`)
- ✅ OPENAI_API_KEY / GROQ_API_KEY / HUGGINGFACE_API_KEY
- ✅ EMAIL_USER (Gmail)
- ✅ EMAIL_PASSWORD (Gmail App Password)
- ✅ NEWS_API_KEY (from newsapi.org)

---

## 🚂 Deploy Backend to Railway

### Step-by-Step:

1. **Go to Railway.app** → https://railway.app/
2. **Sign in with GitHub**
3. **New Project** → "Deploy from GitHub repo"
4. **Select your repository**
5. **Configure**:
   - Root Directory: `Backend`
   - Build Command: Leave empty (Railway auto-detects)
   - Start Command: `npm start`

6. **Add Environment Variables** (click Variables tab):
   ```
   PORT=4000
   NODE_ENV=production
   DATABASE_URL=<your_supabase_url>
   SUPABASE_URL=<your_supabase_url>
   SUPABASE_ANON_KEY=<your_key>
   SUPABASE_SERVICE_ROLE_KEY=<your_key>
   JWT_SECRET=<generate_new_32_char_secret>
   JWT_EXPIRES_IN=7d
   OPENAI_API_KEY=<your_key>
   GROQ_API_KEY=<your_key>
   HUGGINGFACE_API_KEY=<your_key>
   EMAIL_USER=sjestonsingh@gmail.com
   EMAIL_PASSWORD=<your_gmail_app_password>
   FRONTEND_ORIGIN=https://your-app.vercel.app
   FRONTEND_URL=https://your-app.vercel.app
   NEWS_API_KEY=<your_newsapi_key>
   ```

7. **Deploy** → Railway will give you a URL like:
   ```
   https://your-app.up.railway.app
   ```
   **COPY THIS URL** - you'll need it for frontend!

8. **Verify Backend**:
   ```
   curl https://your-app.up.railway.app/api/health
   ```

---

## ▲ Deploy Frontend to Vercel

### Step-by-Step:

1. **Go to Vercel** → https://vercel.com/
2. **Sign in with GitHub**
3. **Add New Project** → Import your repository
4. **Configure**:
   - Framework Preset: **Next.js**
   - Root Directory: `Frontend`
   - Build Command: `npm run build` (auto-detected)
   - Output Directory: `.next` (auto-detected)

5. **Add Environment Variables**:
   ```
   NEXT_PUBLIC_API_URL=https://your-backend.up.railway.app/api
   NEXT_PUBLIC_SOCKET_URL=https://your-backend.up.railway.app
   ```
   ⚠️ **Replace with your actual Railway URL from step 7 above**

6. **Deploy** → Vercel will give you a URL like:
   ```
   https://your-app.vercel.app
   ```

7. **Update Backend CORS**:
   - Go back to Railway
   - Update environment variables:
     ```
     FRONTEND_ORIGIN=https://your-app.vercel.app
     FRONTEND_URL=https://your-app.vercel.app
     ```
   - Railway will auto-redeploy

---

## 🔄 Update Order (Important!)

**Deploy in this order:**

1. ✅ **Backend First** (Railway) → Get backend URL
2. ✅ **Frontend Second** (Vercel) → Use backend URL in env vars
3. ✅ **Update Backend** → Add frontend URL to CORS

---

## 🧪 Post-Deployment Testing

### Test these features:

1. **Authentication**
   - [ ] Sign up new user
   - [ ] Login
   - [ ] Logout
   - [ ] Protected routes work

2. **Transactions**
   - [ ] Add transaction
   - [ ] View transactions
   - [ ] AI categorization works
   - [ ] Real-time updates

3. **Analytics**
   - [ ] Charts display correctly
   - [ ] Category breakdown works
   - [ ] Spending analysis accurate

4. **AI Insights**
   - [ ] Budget advice generates
   - [ ] Spending forecast works
   - [ ] Categorization summary displays

5. **Financial News**
   - [ ] Real-time news loads
   - [ ] Search works
   - [ ] Category filter works
   - [ ] Read More opens articles

6. **Budget Alerts**
   - [ ] Email notifications sent
   - [ ] Budget monitoring works
   - [ ] Alerts display correctly

---

## 🔐 Security Notes

### Production Recommendations:

1. **Generate New JWT_SECRET** for production:
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

2. **Use Strong Passwords** for all services

3. **Enable 2FA** on:
   - GitHub
   - Vercel
   - Railway
   - Supabase

4. **Rotate API Keys** regularly

5. **Monitor Usage**:
   - Check Railway logs
   - Monitor Supabase usage
   - Track API rate limits

---

## 💰 Cost Optimization

### Free Tier Limits:

**Railway:**
- $5 credit/month
- ~500 hours of uptime
- Enough for hobby projects

**Vercel:**
- 100GB bandwidth/month
- Unlimited deployments
- Perfect for personal projects

**Supabase:**
- 500MB database
- 2GB bandwidth
- 50,000 monthly active users

### If You Exceed Free Tier:

**Railway Alternative**: **Render.com**
- 750 hours/month free
- Similar to Railway
- Deploy: https://render.com/

**Backend Alternative**: **Fly.io**
- 3 shared VMs free
- Deploy: https://fly.io/

---

## 🛠️ Troubleshooting

### Common Issues:

#### Backend won't start:
```bash
# Check Railway logs
# Verify all env vars are set
# Ensure DATABASE_URL is correct
# Check if Prisma generated correctly
```

#### Frontend can't reach Backend:
```bash
# Verify NEXT_PUBLIC_API_URL is correct
# Check CORS settings in backend
# Ensure backend is running (check Railway dashboard)
```

#### Database connection fails:
```bash
# Verify DATABASE_URL format
# Check Supabase is running
# Ensure connection pooler is enabled
# Verify IP restrictions in Supabase
```

#### Email notifications not working:
```bash
# Verify EMAIL_USER and EMAIL_PASSWORD
# Ensure Gmail App Password is correct
# Check Gmail security settings
```

---

## 📱 Custom Domain (Optional)

### Add Custom Domain to Vercel:
1. Go to Project Settings → Domains
2. Add your domain
3. Update DNS records as instructed
4. SSL certificate auto-configured

### Add Custom Domain to Railway:
1. Go to Settings → Domains
2. Add custom domain
3. Update DNS CNAME record
4. SSL certificate auto-configured

---

## 🎉 You're Done!

Your AI Budget Forecasting app is now live and accessible worldwide!

**Share your app:**
- Frontend: `https://your-app.vercel.app`
- Backend API: `https://your-backend.up.railway.app/api`

**Monitor your app:**
- Vercel Analytics: Built-in
- Railway Logs: Real-time in dashboard
- Supabase Dashboard: Database metrics

---

## 📞 Support

If you encounter issues:
1. Check Railway/Vercel logs
2. Verify environment variables
3. Test API endpoints with curl/Postman
4. Check Supabase connection

**Happy Deploying! 🚀**

