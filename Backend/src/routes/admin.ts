import { Router } from 'express';
import { authenticateJwt, requireAdmin } from '../middleware/auth';
import { getPrisma } from '../services/prisma';

export const adminRouter = Router();

adminRouter.get('/admin/stats', authenticateJwt, requireAdmin, async (req, res) => {
	const prisma = getPrisma();
	const [users, transactions] = await Promise.all([
		prisma.user.count(),
		prisma.transaction.count(),
	]);
	res.json({ users, transactions });
});

