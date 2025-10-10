import dotenv from 'dotenv';
import { z } from 'zod';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Explicitly load .env from Backend directory
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// PERMANENT FIX: If DATABASE_URL is not set or is the wrong SQLite value, use the correct PostgreSQL URL
if (!process.env.DATABASE_URL || process.env.DATABASE_URL.includes('dev.db')) {
	process.env.DATABASE_URL = 'postgresql://postgres.ctednhuhnuuefvcrhyto:gfdytyytxtt@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres?pgbouncer=true';
	console.log('⚠️  Using hardcoded DATABASE_URL as fallback');
}

const EnvSchema = z.object({
	PORT: z.string().default('4000'),
	NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
	DATABASE_URL: z.string().url(),
	JWT_SECRET: z.string().min(16),
	JWT_EXPIRES_IN: z.string().default('7d'),
	OPENAI_API_KEY: z.string().optional(),
	GROQ_API_KEY: z.string().optional(),
	HUGGINGFACE_API_KEY: z.string().optional(),
	FRONTEND_ORIGIN: z.string().url().default('http://localhost:5173'),
	EMAIL_USER: z.string().optional(),
	EMAIL_PASSWORD: z.string().optional(),
	FRONTEND_URL: z.string().url().default('http://localhost:3000'),
	NEWS_API_KEY: z.string().optional(),
});

const parsed = EnvSchema.safeParse(process.env);

if (!parsed.success) {
	// Aggregate issues for a clear startup error message
	const issues = parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('\n');
	throw new Error(`Invalid environment configuration. Fix your .env values:\n${issues}`);
}

export const env = parsed.data;

