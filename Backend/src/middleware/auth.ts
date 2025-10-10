import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import type { Request, Response, NextFunction } from 'express';

export interface AuthPayload { sub: string; role: 'USER' | 'ADMIN' }

export function authenticateJwt(req: Request, res: Response, next: NextFunction) {
	try {
		const auth = req.headers.authorization;
		const token = auth?.startsWith('Bearer ') ? auth.slice(7) : undefined;
		if (!token) return res.status(401).json({ error: 'Unauthorized' });
    const payload = jwt.verify(token, env.JWT_SECRET) as AuthPayload;
		(req as any).user = payload;
		return next();
	} catch (err) {
		return res.status(401).json({ error: 'Unauthorized' });
	}
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
	const user = (req as any).user as AuthPayload | undefined;
	if (!user || user.role !== 'ADMIN') return res.status(403).json({ error: 'Forbidden' });
	return next();
}

