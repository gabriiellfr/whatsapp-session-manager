const { admin } = require('../../config/firebase');

const socketMiddleware = (io) => {
    io.use(async (socket, next) => {
        const token =
            socket.handshake.auth.token ||
            socket.handshake.headers['authorization'];

        if (!token) {
            return next(new Error('Authentication error'));
        }

        try {
            const decodedToken = await admin.auth().verifyIdToken(token);
            socket.user = decodedToken;
            next();
        } catch (error) {
            next(new Error(error));
        }
    });
};

module.exports = socketMiddleware;
