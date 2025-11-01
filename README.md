# 💰 AI Budget Forecasting & Finance Tracker

An intelligent personal finance management application powered by AI, featuring real-time transaction tracking, budget monitoring, financial insights, and automated email alerts.

![Next.js](https://img.shields.io/badge/Next.js-15-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue)
![Node.js](https://img.shields.io/badge/Node.js-22-green)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Supabase-blue)

---

## ✨ Features

### 🎯 Core Features
- **Smart Transaction Management** - Add, track, and categorize expenses with AI
- **Real-time Analytics** - Interactive charts and spending insights
- **AI-Powered Categorization** - Automatic transaction categorization using ML
- **Budget Monitoring** - Set daily, weekly, monthly, and yearly budget limits
- **Email Alerts** - Receive notifications when exceeding budget limits
- **Financial News** - Real-time global financial news integration
- **Spending Forecasts** - AI-driven predictions and recommendations

### 🤖 AI Capabilities
- **Intelligent Categorization** - Automatically categorizes transactions using Hugging Face, OpenAI, or Groq
- **Budget Advice** - Personalized budget recommendations based on spending patterns
- **Spending Analysis** - AI-powered insights into spending habits
- **Savings Projections** - Forecast potential savings and financial goals

### 📊 Analytics & Insights
- **Category Breakdown** - Visualize spending by category
- **Monthly Trends** - Track income vs expenses over time
- **Top Expense Categories** - Identify biggest spending areas
- **Spending Patterns** - Analyze financial behavior

### 🔔 Smart Notifications
- **Budget Exceedance Alerts** - Email notifications when limits are exceeded
- **Real-time Updates** - Socket.io for instant transaction updates
- **Scheduled Monitoring** - Automated daily, weekly, and monthly checks

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI, shadcn/ui
- **Charts**: Recharts
- **Animations**: Framer Motion
- **State Management**: React Context API
- **Real-time**: Socket.io Client

### Backend
- **Runtime**: Node.js 22
- **Framework**: Express.js 5
- **Language**: TypeScript
- **Database**: PostgreSQL (Supabase)
- **ORM**: Prisma
- **Authentication**: JWT
- **Real-time**: Socket.io
- **Email**: Nodemailer
- **Scheduling**: node-cron

### AI Services
- **OpenAI GPT-4** - Budget insights and advice
- **Groq** - Fast inference fallback
- **Hugging Face** - Transaction categorization

### External APIs
- **NewsAPI** - Real-time financial news
- **Supabase** - Database and authentication

---

## 📁 Project Structure

```
Final Infosys Project/
├── Frontend/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/
│   │   │   └── signup/
│   │   ├── about/
│   │   ├── ai-insights/
│   │   ├── analytics/
│   │   ├── connect-bank/
│   │   ├── news/
│   │   ├── transactions/
│   │   └── page.tsx
│   ├── components/
│   │   ├── ui/
│   │   ├── auth-form.tsx
│   │   ├── sidebar-nav.tsx
│   │   ├── budget-alert-card.tsx
│   │   └── ...
│   ├── lib/
│   │   ├── api-client.ts
│   │   ├── config.ts
│   │   └── contexts/
│   └── public/
│       └── *.svg (icons)
├── Backend/
│   ├── src/
│   │   ├── routes/
│   │   │   ├── auth.ts
│   │   │   ├── transactions.ts
│   │   │   ├── budgets.ts
│   │   │   ├── news.ts
│   │   │   └── ...
│   │   ├── services/
│   │   │   ├── ai-client.ts
│   │   │   ├── email-service.ts
│   │   │   ├── budget-monitor-service.ts
│   │   │   ├── news-service.ts
│   │   │   └── ...
│   │   ├── middleware/
│   │   │   └── auth.ts
│   │   ├── config/
│   │   │   └── env.ts
│   │   └── index.ts
│   ├── prisma/
│   │   └── schema.prisma
│   └── package.json
├── .gitignore
├── DEPLOYMENT_GUIDE.md
└── README.md
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- PostgreSQL database (Supabase account)
- API keys (OpenAI/Groq/Hugging Face, NewsAPI)

### 1. Clone Repository
```bash
git clone https://github.com/YOUR_USERNAME/YOUR_REPO.git
cd "Final Infosys Project"
```

### 2. Setup Backend
```bash
cd Backend
npm install
```

Create `.env` file:
```env
PORT=4000
NODE_ENV=development
DATABASE_URL=your_postgresql_url
JWT_SECRET=your_secret_key
OPENAI_API_KEY=your_key
GROQ_API_KEY=your_key
HUGGINGFACE_API_KEY=your_key
EMAIL_USER=your_email
EMAIL_PASSWORD=your_app_password
NEWS_API_KEY=your_newsapi_key
FRONTEND_ORIGIN=http://localhost:3000
FRONTEND_URL=http://localhost:3000
```

Generate Prisma client and push schema:
```bash
npx prisma generate
npx prisma db push
```

Start backend:
```bash
npm run dev
```

### 3. Setup Frontend
```bash
cd ../Frontend
npm install
npm run dev
```

### 4. Access Application
- Frontend: http://localhost:3000
- Backend API: http://localhost:4000/api

---

## 🔑 Getting API Keys

### 1. Supabase (Database)
- Sign up: https://supabase.com/
- Create new project
- Get connection string from Settings → Database

### 2. AI Services (Choose at least one)

**OpenAI:**
- Sign up: https://platform.openai.com/
- Get API key from API Keys section

**Groq (Recommended - Faster & Free):**
- Sign up: https://console.groq.com/
- Get API key from Keys section

**Hugging Face:**
- Sign up: https://huggingface.co/
- Get API key from Settings → Access Tokens

### 3. NewsAPI
- Sign up: https://newsapi.org/register
- Get API key from dashboard
- Free tier: 100 requests/day

### 4. Gmail App Password
- Enable 2FA: https://myaccount.google.com/security
- Generate App Password: https://myaccount.google.com/apppasswords
- Use for EMAIL_PASSWORD

---

## 📊 Database Schema

### Models:
- **User** - User accounts and authentication
- **Transaction** - Financial transactions with AI categorization
- **Budget** - Monthly budget limits and suggestions
- **BudgetTarget** - Daily/weekly/monthly/yearly budget limits
- **BudgetAlert** - Alert tracking to prevent spam

---

## 🎨 Key Features Breakdown

### 1. Transaction Management
- Add expenses with description, amount, date
- AI automatically categorizes transactions
- Real-time updates across all connected clients
- View transaction history with filters

### 2. Budget Monitoring
- Set custom budget limits (daily, weekly, monthly, yearly)
- Automatic spending calculation
- Email alerts when limits exceeded
- Visual indicators for budget status

### 3. AI Financial Insights
- Personalized budget advice
- Spending pattern analysis
- Category-wise recommendations
- Future spending forecasts

### 4. Analytics Dashboard
- Monthly spending vs income charts
- Category breakdown pie chart
- Top expense categories bar chart
- Spending trends over time

### 5. Financial News
- Real-time global financial news
- Category filters (Markets, Economy, Banking, Crypto, etc.)
- Search functionality
- Direct links to full articles

---

## 🔒 Security Features

- **JWT Authentication** - Secure token-based auth
- **Password Hashing** - bcrypt with salt rounds
- **CORS Protection** - Restricted origins
- **Helmet.js** - Security headers
- **Input Validation** - Zod schema validation
- **SQL Injection Protection** - Prisma ORM
- **XSS Protection** - Input sanitization

---

## 🌐 Deployment

See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for detailed deployment instructions.

**Recommended Stack:**
- Frontend: **Vercel** (Free)
- Backend: **Railway.app** (Free $5/month credit)
- Database: **Supabase** (Already configured)

**Total Cost:** $0/month on free tiers!

---

## 📝 Environment Variables

### Backend (.env)
```env
PORT=4000
NODE_ENV=development
DATABASE_URL=postgresql://...
JWT_SECRET=your_secret
OPENAI_API_KEY=sk-...
GROQ_API_KEY=gsk_...
HUGGINGFACE_API_KEY=hf_...
EMAIL_USER=your@email.com
EMAIL_PASSWORD=app_password
NEWS_API_KEY=your_key
FRONTEND_ORIGIN=http://localhost:3000
FRONTEND_URL=http://localhost:3000
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:4000/api
NEXT_PUBLIC_SOCKET_URL=http://localhost:4000
```

---

## 🤝 Contributing

This is a final year project. For any questions or issues, please contact the development team.

---

## 📄 License

This project is developed as part of an academic requirement.

---

## 👥 Team

Developed by: Infosys Final Year Project Team

---

## 🙏 Acknowledgments

- **Supabase** - Database hosting
- **Vercel** - Frontend hosting
- **Railway** - Backend hosting
- **OpenAI/Groq/Hugging Face** - AI services
- **NewsAPI** - Financial news data

---

**Built with ❤️ using Next.js, Express, and AI**





