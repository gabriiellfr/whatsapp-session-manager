const { spawn } = require('child_process');
const kill = require('tree-kill');
const path = require('path');

const { sendEvent } = require('./webhook.service');

const processes = new Map();

const sendEventWithHandling = async (type, data) => {
    try {
        await sendEvent(type, data);
    } catch (error) {
        console.error(
            `Failed to send event for session ${data.sessionId}:`,
            error
        );
    }
};

const handleChildMessage = (message) => {
    const child = processes.get(message.sessionId);

    if (!child) return;

    switch (message.type) {
        case 'status_update':
            processes.set(message.sessionId, {
                ...child,
                sessionStatus: {
                    ...message.data,
                },
                lastUpdate: new Date().toISOString(),
            });

            handleStatusUpdate(message);
            break;

        case 'incoming_message':
            handleIncomingMessage(message);
            break;

        default:
            console.log(
                `Unknown message type from session ${message.sessionId}: ${message.type}`
            );
            break;
    }
};

const handleStatusUpdate = async (status) => {
    await sendEventWithHandling('status', status);
};

const handleIncomingMessage = async (message) => {
    await sendEventWithHandling('incoming_message', message);
};

const startSession = (sessionId) => {
    return new Promise((resolve) => {
        const existingProcess = processes.get(sessionId);

        if (
            existingProcess &&
            existingProcess.childStatus.status !== 'stopped'
        ) {
            return resolve({
                success: false,
                message: `Session ${sessionId} is already running.`,
            });
        }

        const child = spawn(
            'node',
            [path.join(__dirname, '../session/index.js')],
            {
                env: { ...process.env, SESSION_ID: sessionId },
                stdio: ['inherit', 'inherit', 'inherit', 'ipc'],
            }
        );

        child.on('error', (err) =>
            resolve({
                success: false,
                message: `Error starting service: ${err.message}`,
            })
        );

        child.on('spawn', () => {
            processes.set(sessionId, {
                process: child,
                childStatus: { status: 'running' },
                startTime: new Date().toISOString(),
                lastUpdate: new Date().toISOString(),
            });

            resolve({
                success: true,
                message: `Session ${sessionId} started successfully.`,
            });
        });

        child.on('message', (message) => handleChildMessage(message));

        ['exit', 'SIGINT', 'SIGTERM', 'SIGQUIT'].forEach((signal) => {
            child.on(signal, async () => {
                const proc = processes.get(sessionId);
                if (proc) {
                    processes.set(sessionId, {
                        ...proc,
                        lastUpdate: new Date().toISOString(),
                        childStatus: { status: 'stopped' },
                        sessionStatus: {
                            isConnected: false,
                            clientInfo: null,
                            status: 'stopped',
                            message: 'Session is no longer running',
                        },
                    });
                }
            });
        });
    });
};

const stopSession = (sessionId) => {
    return new Promise((resolve) => {
        const existingProcess = processes.get(sessionId);

        if (
            !existingProcess ||
            !existingProcess.process ||
            existingProcess.process.killed ||
            existingProcess.childStatus.status === 'stopped'
        ) {
            resolve({
                success: false,
                message: `Session ${sessionId} is not running or does not exist.`,
            });
        }

        kill(existingProcess.process.pid, 'SIGKILL');

        processes.set(sessionId, {
            ...existingProcess,
            childStatus: { status: 'stopped' },
            lastUpdate: new Date().toISOString(),
        });

        resolve({
            success: true,
            message: `Session ${sessionId} was stopped.`,
        });
    });
};

const sendSessions = (sessionId, type, data) => {
    return new Promise((resolve) => {
        const existingProcess = processes.get(sessionId);

        if (
            !existingProcess ||
            !existingProcess.process ||
            existingProcess.process.killed ||
            existingProcess.childStatus.status === 'stopped' ||
            existingProcess.sessionStatus.status !== 'ready'
        ) {
            resolve({
                success: false,
                message: `Session ${sessionId} is not running or does not exist.`,
            });
        }

        existingProcess.process.send({
            type,
            data: { to: data.to, content: data.content },
        });

        resolve({ success: true, message: 'Message sent successfully' });
    });
};

const listSessions = () => {
    return Array.from(processes.entries()).map(([id, info]) => {
        const { ...rest } = info;
        return { id, ...rest };
    });
};

const shutdown = () => {
    processes.forEach(({ process }) => {
        if (process && !process.killed) {
            process.kill();
        }
    });
    process.exit();
};

process.on('exit', shutdown);
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
    shutdown();
});
process.on('unhandledRejection', (reason) => {
    console.error('Unhandled Rejection:', reason);
    shutdown();
});

module.exports = {
    startSession,
    stopSession,
    sendSessions,
    listSessions,
};
