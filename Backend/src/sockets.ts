import { Server } from 'socket.io';
import type { Server as HttpServer } from 'http';
import jwt from 'jsonwebtoken';
import { env } from './config/env';

let ioInstance: Server | null = null;

export function initializeSockets(server: HttpServer) {
	const io = new Server(server, {
		cors: {
			origin: env.FRONTEND_ORIGIN,
			credentials: true,
		},
	});

	ioInstance = io;

	io.use((socket, next) => {
		try {
			const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.replace('Bearer ', '');
			if (!token) return next(new Error('Unauthorized'));
            jwt.verify(token, env.JWT_SECRET);
			return next();
		} catch (err) {
			return next(new Error('Unauthorized'));
		}
	});

	io.on('connection', (socket) => {
		console.log('Client connected:', socket.id);
		socket.emit('connected', { sid: socket.id });
	});

	return io;
}

export function getSocketIO(): Server | null {
	return ioInstance;
}

