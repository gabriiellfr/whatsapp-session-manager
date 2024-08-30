const { sessions, startSession, stopSession } = require('../session-manager');

const { logger } = require('../utils');

const userHandler = (io, socket) => {
    socket.on('joinSession', async (data) => {
        const { sessionId } = JSON.parse(data);

        if (!sessionId) {
            socket.emit('error', { message: 'No session id provided!' });
            return;
        }

        socket.join(sessionId);
    });

    socket.on('startSession', async (data) => {
        const { sessionId } = JSON.parse(data);

        if (!sessionId) {
            socket.emit('error', { message: 'No session id provided!' });
            return;
        }

        socket.join(sessionId);
        await startSession(sessionId, socket, io);
    });

    socket.on('stopSession', async (data) => {
        const { sessionId } = JSON.parse(data);

        if (!sessionId) {
            socket.emit('error', { message: 'No session id provided!' });
            return;
        }

        if (sessions.has(sessionId)) {
            await stopSession(sessionId, io);
        } else {
            socket.emit('error', { message: 'Session not found' });
        }
    });

    socket.on('getLogs', async (data) => {
        const { sessionId } = JSON.parse(data);

        if (!sessionId) {
            socket.emit('error', { message: 'No session id provided!' });
            return;
        }

        if (sessions.has(sessionId)) {
            const { logs } = sessions.get(sessionId);
            socket.emit('sessionLogs', { sessionId, logs });
        } else {
            socket.emit('error', { message: 'Session not found' });
        }
    });

    socket.on('sendToSession', async (data) => {
        const { sessionId, type, content } = JSON.parse(data);

        if (!sessionId) {
            socket.emit('error', { message: 'No session id provided!' });
            return;
        }

        if (!type || !content) return;

        if (sessions.has(sessionId)) {
            const { process } = sessions.get(sessionId);
            process.send({ type, data: content });
            logger.info(
                `Command executed in session ${sessionId}: ${type}`,
                content
            );
        } else {
            socket.emit('error', { message: 'Session not found' });
        }
    });
};

module.exports = userHandler;
