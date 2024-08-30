const socketIo = require('socket.io');

const authMiddleware = require('../../middlewares/socket.middleware');

const adminHandler = require('../../handlers/admin.handler');
const userHandler = require('../../handlers/user.handler');

const logger = require('../../utils/logger');

const setup = (server) => {
    logger.info(`Starting socket server`);

    const io = socketIo(server, {
        cors: {
            origin: '*',
        },
    });

    authMiddleware(io);

    io.on('connection', (socket) => {
        if (!socket.user) {
            socket.disconnect(true);
            return;
        }

        logger.info(
            `User connected: ${socket.user.id}, Admin: ${socket.user.isAdmin}`
        );

        if (socket.user.isAdmin) {
            adminHandler(io, socket);
        } else {
            userHandler(io, socket);
        }

        socket.on('disconnect', () => {
            logger.info(`User ${socket.user.id} disconnected`);
        });
    });
};

module.exports = {
    setup,
};
