import { Router } from 'express';
import { z } from 'zod';
import dayjs from 'dayjs';
import { authenticateJwt } from '../middleware/auth';
import { getPrisma } from '../services/prisma';
import { AiClientService } from '../services/ai-client';
import { getSocketIO } from '../sockets';

export const transactionsRouter = Router();

const createSchema = z.object({
	description: z.string(),
	amount: z.number(),
	currency: z.string().default('USD'),
	date: z.string().datetime().optional(),
});

transactionsRouter.post('/transactions', authenticateJwt, async (req, res) => {
	try {
		const parsed = createSchema.safeParse(req.body);
		if (!parsed.success) {
			console.error('❌ [Transaction] Validation error:', parsed.error.flatten());
			return res.status(400).json({ error: parsed.error.flatten() });
		}

		const prisma = getPrisma();
		const userId = (req as any).user.sub as string;
		
		console.log('📝 [Transaction] Creating transaction for user:', userId);
		console.log('📝 [Transaction] Transaction data:', parsed.data);

		// Try AI classification but don't let it block transaction creation
		let category = null;
		try {
			const ai = new AiClientService();
			category = await ai.classifyTransaction(parsed.data.description);
			console.log('🤖 [Transaction] AI classification result:', category);
		} catch (aiError) {
			console.error('❌ [Transaction] AI classification failed, continuing without category:', aiError);
		}

		const created = await prisma.transaction.create({
			data: {
				userId,
				description: parsed.data.description,
				amount: parsed.data.amount,
				currency: parsed.data.currency,
				date: parsed.data.date ? new Date(parsed.data.date) : dayjs().toDate(),
				category: category ?? null,
			},
		});

		console.log('✅ [Transaction] Transaction created successfully:', created.id);

		// Emit real-time event
		const io = getSocketIO();
		if (io) {
			io.emit('transaction:created', created);
		}

		res.status(201).json({ transaction: created });

		// Trigger budget monitoring after response is sent (non-blocking)
		setImmediate(async () => {
			try {
				const { budgetMonitorService } = await import('../services/budget-monitor-service.js');
				await budgetMonitorService.checkBudgetExceedances(userId);
			} catch (budgetError) {
				console.error('❌ [Budget] Background budget check failed:', budgetError);
			}
		});
	} catch (error) {
		console.error('❌ [Transaction] Failed to create transaction:', error);
		res.status(500).json({ 
			error: 'Failed to create transaction',
			message: error instanceof Error ? error.message : 'Unknown error'
		});
	}
});

transactionsRouter.get('/transactions', authenticateJwt, async (req, res) => {
	const prisma = getPrisma();
	const userId = (req as any).user.sub as string;
	const list = await prisma.transaction.findMany({ where: { userId }, orderBy: { date: 'desc' } });
	res.json({ transactions: list });
});

