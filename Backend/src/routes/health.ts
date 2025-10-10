import { Router } from 'express';

export const healthRouter = Router();

healthRouter.get('/health', (req, res) => {
	res.json({ status: 'ok', service: 'ai-budget-forecasting-backend', timestamp: new Date().toISOString() });
});

