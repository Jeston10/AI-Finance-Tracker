import { Router } from 'express';
import { z } from 'zod';
import { authenticateJwt } from '../middleware/auth';
import { getPrisma } from '../services/prisma';
import { AiClientService } from '../services/ai-client';

export const budgetsRouter = Router();

const upsertSchema = z.object({
	month: z.number().int().min(1).max(12),
	year: z.number().int().min(2000).max(2100),
	totalLimit: z.number(),
});

budgetsRouter.post('/budgets', authenticateJwt, async (req, res) => {
	const parsed = upsertSchema.safeParse(req.body);
	if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
	const prisma = getPrisma();
	const userId = (req as any).user.sub as string;
	const ai = new AiClientService();
	const history = await prisma.transaction.findMany({ where: { userId }, select: { date: true, amount: true } });
	const insights = await ai.generateBudgetInsights(history.map((h) => ({ date: h.date.toISOString(), amount: Number(h.amount) }))).catch(() => null);
  const suggestionsValue = insights ? (JSON.stringify({ text: insights }) as unknown as any) : (null as unknown as any);
  const budget = await prisma.budget.upsert({
    where: { userId_month_year: { userId, month: parsed.data.month, year: parsed.data.year } },
    update: { totalLimit: parsed.data.totalLimit, suggestions: suggestionsValue },
    create: { userId, month: parsed.data.month, year: parsed.data.year, totalLimit: parsed.data.totalLimit, suggestions: suggestionsValue },
  });
	res.status(201).json({ budget });
});

budgetsRouter.get('/budgets', authenticateJwt, async (req, res) => {
	const prisma = getPrisma();
	const userId = (req as any).user.sub as string;
	const list = await prisma.budget.findMany({ where: { userId }, orderBy: [{ year: 'desc' }, { month: 'desc' }] });
	res.json({ budgets: list });
});

