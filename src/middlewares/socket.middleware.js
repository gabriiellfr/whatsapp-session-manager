const jwt = require('jsonwebtoken');

const config = require('../config');
const logger = require('../utils/logger');

const socketMiddleware = (io) => {
    io.use(async (socket, next) => {
        const token =
            socket.handshake.auth.token ||
            socket.handshake.headers['authorization'];

        console.log(
            socket.handshake.headers['authorization'],
            config.jwtSecret
        );

        if (!token) {
            return next(new Error('Authentication error: No token provided'));
        }

        try {
            const decoded = jwt.verify(token, config.jwtSecret);
            socket.user = {
                id: decoded.userId,
                isAdmin: decoded.isAdmin,
            };

            next();
        } catch (error) {
            logger.error('Authentication error: Invalid token', error);
            return next(new Error('Authentication error: Invalid token'));
        }
    });
};

module.exports = socketMiddleware;
