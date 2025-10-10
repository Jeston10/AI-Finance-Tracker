import http from 'http';
import { createApp } from './app';
import { env } from './config/env';
import { initializeSockets } from './sockets';
import { cronService } from './services/cron-service.js';

async function bootstrap() {
	const app = createApp();
	const server = http.createServer(app);

	initializeSockets(server);

	server.listen(Number(env.PORT), () => {
		// eslint-disable-next-line no-console
		console.log(`Server listening on http://localhost:${env.PORT}`);
		
		// Start cron jobs for budget monitoring
		cronService.start();
	});
}

bootstrap().catch((err) => {
	// eslint-disable-next-line no-console
	console.error('Failed to start server:', err);
	process.exit(1);
});

