import { Router } from 'express';
import { authenticateJwt, requireAdmin } from '../middleware/auth';
import { getPrisma } from '../services/prisma';

export const usersRouter = Router();

usersRouter.get('/users/me', authenticateJwt, async (req, res) => {
	const prisma = getPrisma();
	const userId = (req as any).user.sub as string;
	const user = await prisma.user.findUnique({ where: { id: userId }, select: { id: true, email: true, name: true, role: true, createdAt: true } });
	res.json({ user });
});

usersRouter.get('/users', authenticateJwt, requireAdmin, async (req, res) => {
	const prisma = getPrisma();
	const users = await prisma.user.findMany({ select: { id: true, email: true, name: true, role: true, createdAt: true } });
	res.json({ users });
});

