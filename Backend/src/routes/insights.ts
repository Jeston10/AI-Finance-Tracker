import { Router } from 'express';
import { authenticateJwt } from '../middleware/auth';
import { getPrisma } from '../services/prisma';
import { AiClientService } from '../services/ai-client';

export const insightsRouter = Router();

insightsRouter.get('/insights/savings-projection', authenticateJwt, async (req, res) => {
	console.log('🔍 [Backend] Savings projection endpoint called');
	const prisma = getPrisma();
	const userId = (req as any).user.sub as string;
	const monthlyTarget = req.query.monthlyTarget ? Number(req.query.monthlyTarget) : null;
	console.log('🔍 [Backend] User ID:', userId);
	console.log('🔍 [Backend] Monthly Target from query:', monthlyTarget);
	
	// Get detailed transaction history for better AI analysis
	const history = await prisma.transaction.findMany({ 
		where: { userId }, 
		select: { 
			date: true, 
			amount: true, 
			category: true, 
			description: true 
		},
		orderBy: { date: 'desc' }
	});
	
	// Group by month for spending analysis
	const monthly = new Map<string, number>();
	history.forEach((h) => {
		const k = `${h.date.getUTCFullYear()}-${String(h.date.getUTCMonth() + 1).padStart(2, '0')}`;
		monthly.set(k, (monthly.get(k) ?? 0) + Math.abs(Number(h.amount)));
	});
	
	const series = Array.from(monthly.entries())
		.map(([period, amount]) => ({ period, amount }))
		.sort((a, b) => a.period.localeCompare(b.period));
	
	// Get user's budget limits for accurate overspending calculation
	const budgets = await prisma.budget.findMany({
		where: { userId },
		select: { month: true, year: true, totalLimit: true }
	});
	
	console.log('🔍 [Backend] User budgets:', budgets);
	
	// Calculate spending patterns for AI
	const totalSpending = history.reduce((sum, t) => sum + Math.abs(Number(t.amount)), 0);
	const avgMonthlySpending = totalSpending / Math.max(series.length, 1);
	
	// Calculate overspending months based on actual budget limits
	let overspendingMonths = 0;
	series.forEach(monthData => {
		const [year, month] = monthData.period.split('-').map(Number);
		const budget = budgets.find(b => b.year === year && b.month === month);
		
		if (budget) {
			const budgetLimit = Number(budget.totalLimit);
			if (monthData.amount > budgetLimit) {
				overspendingMonths++;
				console.log(`💰 [Backend] Overspending detected: ${monthData.period} - Spent: $${monthData.amount}, Limit: $${budgetLimit}`);
			}
		} else if (monthlyTarget && monthlyTarget > 0) {
			// Use monthly target from localStorage if no budget in database
			if (monthData.amount > monthlyTarget) {
				overspendingMonths++;
				console.log(`💰 [Backend] Overspending detected (monthly target): ${monthData.period} - Spent: $${monthData.amount}, Target: $${monthlyTarget}`);
			}
		} else {
			// If no budget set for this month, use average as fallback
			if (monthData.amount > avgMonthlySpending * 1.2) {
				overspendingMonths++;
				console.log(`💰 [Backend] Overspending detected (no budget): ${monthData.period} - Spent: $${monthData.amount}, Avg: $${avgMonthlySpending}`);
			}
		}
	});
	
	// Get category breakdown for better insights
	const categorySpending = new Map<string, number>();
	history.forEach(t => {
		const category = t.category || 'Other';
		categorySpending.set(category, (categorySpending.get(category) || 0) + Math.abs(Number(t.amount)));
	});
	
	const topCategories = Array.from(categorySpending.entries())
		.sort((a, b) => b[1] - a[1])
		.slice(0, 3);
	
	console.log('🔍 [Backend] History length:', history.length);
	console.log('🔍 [Backend] Series:', series);
	console.log('🔍 [Backend] Analysis:', {
		totalSpending,
		avgMonthlySpending: Math.round(avgMonthlySpending),
		overspendingMonths,
		topCategories: topCategories.map(([name, amount]) => ({ name, amount }))
	});
	
	const ai = new AiClientService();
	console.log('🤖 [Backend] Calling AI service...');
	const text = await ai.generateBudgetInsights(series.map((s) => ({ date: `${s.period}-01`, amount: s.amount }))).catch((error) => {
		console.error('❌ [Backend] AI service error:', error);
		return null;
	});
	
	console.log('✅ [Backend] AI response:', text);
	
	res.json({ 
		series, 
		advice: text,
		analysis: {
			totalSpending,
			avgMonthlySpending: Math.round(avgMonthlySpending),
			overspendingMonths,
			topCategories: topCategories.map(([name, amount]) => ({ name, amount }))
		}
	});
});

