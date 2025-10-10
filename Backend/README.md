# AI Budget Forecasting Backend (Express + TypeScript)

Modern, production-ready backend for AI-powered budgeting and forecasting using Express, TypeScript, Prisma, Supabase (Postgres), Socket.IO, and external AI APIs (OpenAI + Hugging Face).

## Requirements
- Node.js 18+
- Supabase project (Postgres connection string)

## Setup
1. Copy `.env.example` to `.env` and set values:
   - `DATABASE_URL` from Supabase
   - `JWT_SECRET`
   - Optional: `OPENAI_API_KEY`, `HUGGINGFACE_API_KEY`
2. Install deps and generate Prisma client:
   ```bash
   npm i
   npx prisma generate
   ```
3. Create the database schema:
   ```bash
   npx prisma db push
   ```
4. Start dev server:
   ```bash
   npm run dev
   ```

## Scripts
- `dev`: run with tsx + nodemon
- `build`: compile TypeScript
- `start`: run compiled code
- `test`: run Jest

## API
- `GET /api/health`
- `POST /api/auth/signup`
- `POST /api/auth/login`
- `GET /api/users/me` (JWT)
- `GET /api/transactions` (JWT)
- `POST /api/transactions` (JWT)
- `POST /api/budgets` (JWT)
- `GET /api/budgets` (JWT)
- `GET /api/insights/savings-projection` (JWT)
- `GET /api/notifications` (JWT)
- `GET /api/admin/stats` (JWT admin)

## Realtime
- Socket.IO at same origin; connect with `{ auth: { token: "Bearer <JWT>" } }` or `Authorization` header.

## Notes
- Keep request/response shapes consistent with frontend.
- Prisma schema is designed for Supabase. Use `db push` to sync.
