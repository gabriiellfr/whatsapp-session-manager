const { spawn } = require('child_process');
const path = require('path');
const kill = require('tree-kill');

const logger = require('../utils/logger');
const config = require('../config');

const sessions = new Map();

async function startSession(sessionId, socket, io) {
    if (sessions.has(sessionId)) {
        socket.emit('error', { message: 'Session is already running.' });
        return;
    }

    if (sessions.size >= config.maxSessions) {
        socket.emit('error', { message: 'Maximum session limit reached' });
        return;
    }

    try {
        const child = spawn(
            'node',
            [path.join(__dirname, '../session/index.js')],
            {
                stdio: ['pipe', 'pipe', 'pipe', 'ipc'],
                env: { ...process.env, SESSION_ID: sessionId },
            }
        );

        const sessionData = {
            process: child,
            logs: [],
            startTime: Date.now(),
            userId: socket.user.id,
        };
        sessions.set(sessionId, sessionData);

        logger.info(`Session started ${sessionId} for user ${socket.user.id}`);

        child.stdout.on('data', (data) =>
            handleProcessOutput(sessionId, data, 'stdout', io)
        );
        child.stderr.on('data', (data) =>
            handleProcessOutput(sessionId, data, 'stderr', io)
        );

        child.on('message', (message) => {
            io.to(sessionId).emit('sessionMessage', { sessionId, message });
        });

        child.on('close', (code) => handleSessionClose(sessionId, code, io));

        socket.emit('sessionStarted', { sessionId });
    } catch (error) {
        logger.error('Error starting session', {
            sessionId,
            error: error.message,
        });
        socket.emit('error', { message: 'Failed to start session' });
    }
}

async function stopSession(sessionId, io) {
    if (sessions.has(sessionId)) {
        const { process } = sessions.get(sessionId);
        kill(process.pid, 'SIGTERM', (err) => {
            if (err) {
                logger.error(`Error stopping session ${sessionId}`, {
                    error: err.message,
                });
            }
        });

        sessions.delete(sessionId);
        logger.info(`Session stopped ${sessionId}`);
        io.to(sessionId).emit('sessionStopped', { sessionId });
    }
}

function handleProcessOutput(sessionId, data, type, io) {
    const log = `[${type}] ${data.toString().trim()}`;
    if (sessions.has(sessionId)) {
        const sessionData = sessions.get(sessionId);
        sessionData.logs.push(log);
        if (sessionData.logs.length > 1000) {
            sessionData.logs.shift(); // Keep only the last 1000 logs in memory
        }

        io.to(sessionId).emit('sessionLog', { sessionId, log });
    }
}

function handleSessionClose(sessionId, code, io) {
    logger.info(`Session closed`, { sessionId, code });
    const sessionData = sessions.get(sessionId);
    if (sessionData) {
        const duration = Date.now() - sessionData.startTime;

        sessions.delete(sessionId);
        io.to(sessionId).emit('sessionClosed', { sessionId, duration, code });

        io.in(sessionId).socketsLeave(sessionId);
    }
}

// Graceful shutdown
const gracefulShutdown = () => {
    sessions.forEach(({ process }) => {
        if (process && !process.killed) {
            process.kill();
        }
    });
    process.exit();
};

process.on('exit', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);
process.on('uncaughtException', (error) => {
    logger.error('Uncaught Exception', error);
    gracefulShutdown();
});
process.on('unhandledRejection', (reason) => {
    logger.error('Unhandled Rejection', { reason: reason.stack || reason });
    gracefulShutdown();
});

module.exports = {
    sessions,
    startSession,
    stopSession,
    handleProcessOutput,
    handleSessionClose,
};
