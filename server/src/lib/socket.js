import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import { logger } from '../config/logger.js';

let io = null;

export const initSocket = (httpServer, config) => {
    io = new Server(httpServer, {
        cors: {
            origin: config.CORS_ORIGIN,
            credentials: true,
        },
    });

    // Socket.io authentication middleware
    io.use(async (socket, next) => {
        try {
            const token = socket.handshake.auth.token;
            if (!token) {
                return next(new Error('Authentication required'));
            }
            const decoded = jwt.verify(token, config.JWT_SECRET);
            socket.userId = decoded.userId;
            next();
        } catch (error) {
            next(new Error('Unauthorized'));
        }
    });

    // Socket.io connection handling
    io.on('connection', (socket) => {
        logger.info(`User ${socket.userId} connected via socket`);

        // Join project room
        socket.on('join:project', (projectId) => {
            socket.join(`project:${projectId}`);
            logger.debug(`User ${socket.userId} joined project:${projectId}`);
        });

        // Leave project room
        socket.on('leave:project', (projectId) => {
            socket.leave(`project:${projectId}`);
            logger.debug(`User ${socket.userId} left project:${projectId}`);
        });

        // Join workspace room
        socket.on('join:workspace', (workspaceId) => {
            socket.join(`workspace:${workspaceId}`);
            logger.debug(`User ${socket.userId} joined workspace:${workspaceId}`);
        });

        // Leave workspace room
        socket.on('leave:workspace', (workspaceId) => {
            socket.leave(`workspace:${workspaceId}`);
            logger.debug(`User ${socket.userId} left workspace:${workspaceId}`);
        });

        socket.on('disconnect', () => {
            logger.debug(`User ${socket.userId} disconnected`);
        });
    });

    return io;
};

export const getIO = () => {
    if (!io) {
        throw new Error('Socket.io not initialized');
    }
    return io;
};
