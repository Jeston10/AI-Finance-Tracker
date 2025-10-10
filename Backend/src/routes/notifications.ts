import { Router } from 'express';
import { authenticateJwt } from '../middleware/auth';
import { initializeSockets } from '../sockets';

export const notificationsRouter = Router();

notificationsRouter.get('/notifications', authenticateJwt, async (req, res) => {
	res.json({ notifications: [] });
});

