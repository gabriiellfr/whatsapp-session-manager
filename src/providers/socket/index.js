const socketIo = require('socket.io');

const { socketMiddleware } = require('../../middlewares/');

const { adminHandler, userHandler } = require('../../handlers');

const { logger } = require('../../utils');

const setup = (server) => {
    logger.info(`Starting socket server`);

    const io = socketIo(server, {
        cors: {
            origin: '*',
        },
    });

    socketMiddleware(io);

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
