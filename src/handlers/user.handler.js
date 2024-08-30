const { sessions, stopSession, startSession } = require('../manager');

const logger = require('../utils/logger');

const userHandler = (io, socket) => {
    const sessionId = socket.handshake.query.sessionId;

    if (!sessionId) {
        socket.emit('error', { message: 'No session id provided!' });
        return;
    }

    socket.join(sessionId);

    socket.on('startSession', async () => {
        await startSession(sessionId, socket, io);
    });

    socket.on('stopSession', async () => {
        if (sessions.has(sessionId)) {
            await stopSession(sessionId, io);
        } else {
            socket.emit('error', { message: 'Session not found' });
        }
    });

    socket.on('getLogs', async () => {
        if (sessions.has(sessionId)) {
            const { logs } = sessions.get(sessionId);
            socket.emit('sessionLogs', { sessionId, logs });
        } else {
            socket.emit('error', { message: 'Session not found' });
        }
    });

    socket.on('executeCommand', async (command) => {
        if (sessions.has(sessionId)) {
            const { process } = sessions.get(sessionId);
            process.send({ type: 'command', command });
            logger.info(`Command executed in session ${sessionId}: ${command}`);
        } else {
            socket.emit('error', { message: 'Session not found' });
        }
    });
};

module.exports = userHandler;
