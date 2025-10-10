import { Router } from 'express';
import { healthRouter } from './health';
import { authRouter } from './auth';
import { usersRouter } from './users';
import { transactionsRouter } from './transactions';
import { budgetsRouter } from './budgets';
import { insightsRouter } from './insights';
import { notificationsRouter } from './notifications';
import { adminRouter } from './admin';
import budgetMonitoringRouter from './budget-monitoring';

export function registerRoutes(): Router {
	const router = Router();
		router.use(healthRouter);
		router.use(authRouter);
		router.use(usersRouter);
		router.use(transactionsRouter);
		router.use(budgetsRouter);
		router.use(insightsRouter);
		router.use(notificationsRouter);
		router.use(adminRouter);
		router.use('/budget-monitoring', budgetMonitoringRouter);
	return router;
}

