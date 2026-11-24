import dotenv from 'dotenv';
import { z } from 'zod';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Explicitly load .env from Backend directory
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// DATABASE_URL must be provided via environment (.env or host config).
// The schema below fails fast with a clear message if it is missing or invalid.

const EnvSchema = z.object({
	PORT: z.string().default('4000'),
	NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
	DATABASE_URL: z.string().url(),
	JWT_SECRET: z.string().min(16),
	JWT_EXPIRES_IN: z.string().default('7d'),
	OPENAI_API_KEY: z.string().optional(),
	GROQ_API_KEY: z.string().optional(),
	HUGGINGFACE_API_KEY: z.string().optional(),
	FRONTEND_ORIGIN: z.string().url().default('http://localhost:3000'),
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

