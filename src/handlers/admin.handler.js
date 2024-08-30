const { sessions, stopSession } = require('../session-manager');

const adminHandler = (io, socket) => {
    socket.on('getAllSessions', () => {
        const sessionsInfo = Array.from(sessions.entries()).map(
            ([id, data]) => ({
                id,
                startTime: data.startTime,
                logsCount: data.logs.length,
                userId: data.userId,
            })
        );
        socket.emit('allSessions', sessionsInfo);
    });

    socket.on('getSessionLogs', (sessionId) => {
        if (sessions.has(sessionId)) {
            const { logs } = sessions.get(sessionId);
            socket.emit('sessionLogs', { sessionId, logs });
        } else {
            socket.emit('error', { message: 'Session not found' });
        }
    });

    socket.on('stopSession', async (sessionId) => {
        if (sessions.has(sessionId)) {
            await stopSession(sessionId, io);
            socket.emit('sessionStopped', { sessionId });
            io.to(sessionId).emit('sessionStopped', { sessionId });
        } else {
            socket.emit('error', { message: 'Session not found' });
        }
    });
};

module.exports = adminHandler;
