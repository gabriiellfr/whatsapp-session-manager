const socketIo = require('socket.io');
const clientManager = require('../services/clientManager');
const logger = require('../utils/logger');
const socketMiddleware = require('../api/middleware/socket');

function setupWebSocket(server) {
    const io = socketIo(server);

    socketMiddleware(io);

    setupClientManagerListeners(io);

    io.on('connection', async (socket) => {
        logger.info('New WebSocket connection', {
            socketId: socket.id,
            userId: socket.user.uid,
        });

        const sessions = await clientManager.getAllClientsForUser(
            socket.user.uid
        );

        sessions.forEach((session) => {
            socket.join(session.id);
            logger.info(
                `Socket ${socket.id} subscribed to session ${session.id}`
            );
        });

        socket.on('disconnect', () => {
            logger.info('WebSocket disconnected', {
                socketId: socket.id,
                userId: socket.user.uid,
            });
            // Update client count for each session this socket was in
            socket.rooms.forEach((room) => {
                if (room !== socket.id) {
                    // Exclude the socket's own room
                    const clientCount =
                        io.sockets.adapter.rooms.get(room)?.size || 0;
                    io.to(room).emit('client_count', {
                        sessionId: room,
                        count: clientCount,
                    });
                }
            });
        });
    });

    return io;
}

function setupClientManagerListeners(io) {
    clientManager.on('join_room', async ({ sessionId, userId }) => {
        const sockets = await io.fetchSockets();
        sockets.forEach((socket) => {
            if (socket.user && socket.user.uid === userId) {
                socket.join(sessionId);
                logger.info(`Socket ${socket.id} joined room ${sessionId}`);
            }
        });
    });

    clientManager.on('status_update', (status) => {
        io.to(status.id).emit('status_update', status);
    });

    clientManager.on('info', ({ sessionId, info }) => {
        console.log(info);
        io.to(sessionId).emit('info', { sessionId, info });
    });

    clientManager.on('incoming_message', ({ sessionId, message }) => {
        io.to(sessionId).emit('incoming_message', { sessionId, message });
    });
}

module.exports = setupWebSocket;
