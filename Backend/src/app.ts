import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { env } from './config/env';
import { registerRoutes } from './routes';

export function createApp() {
	const app = express();

	app.use(helmet());
	
	// Configure CORS to allow all origins
	app.use(cors({ 
		origin: true, // Allow all origins
		credentials: true,
		methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
		allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
	}));
	
	app.use(express.json({ limit: '1mb' }));
	app.use(express.urlencoded({ extended: true }));

	app.use('/api', registerRoutes());

	// Basic error handler
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
		const status = err.status || 500;
		res.status(status).json({ error: err.message ?? 'Internal Server Error' });
	});

	return app;
}

