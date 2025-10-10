import { Router } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { env } from '../config/env';
import { getPrisma } from '../services/prisma';

export const authRouter = Router();

const signupSchema = z.object({
	email: z.string().email(),
	password: z.string().min(8),
	name: z.string().optional(),
});

authRouter.post('/auth/signup', async (req, res) => {
	const parsed = signupSchema.safeParse(req.body);
	if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
	const { email, password, name } = parsed.data;
	const prisma = getPrisma();
	const existing = await prisma.user.findUnique({ where: { email } });
	if (existing) return res.status(409).json({ error: 'Email already in use' });
	const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({ data: { email, passwordHash, name: name ?? null } });
  const token = jwt.sign({ sub: user.id, role: user.role }, env.JWT_SECRET as any, { expiresIn: env.JWT_EXPIRES_IN } as any);
	res.status(201).json({ token, user: { id: user.id, email: user.email, name: user.name, role: user.role } });
});

const loginSchema = z.object({
	email: z.string().email(),
	password: z.string(),
});

authRouter.post('/auth/login', async (req, res) => {
	const parsed = loginSchema.safeParse(req.body);
	if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
	const { email, password } = parsed.data;
	const prisma = getPrisma();
	const user = await prisma.user.findUnique({ where: { email } });
	if (!user) return res.status(401).json({ error: 'Invalid credentials' });
	const ok = await bcrypt.compare(password, user.passwordHash);
	if (!ok) return res.status(401).json({ error: 'Invalid credentials' });
  const token = jwt.sign({ sub: user.id, role: user.role }, env.JWT_SECRET as any, { expiresIn: env.JWT_EXPIRES_IN } as any);
	res.json({ token, user: { id: user.id, email: user.email, name: user.name, role: user.role } });
});

