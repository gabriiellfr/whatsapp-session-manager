const { spawn } = require('child_process');
const path = require('path');

const { sendEvent } = require('./webhook.service');

const processes = new Map();

// Start a new session if not already running
const startSession = (sessionId) => {
    return new Promise((resolve, reject) => {
        // Check if the session is already running
        const existingProcess = processes.get(sessionId);
        if (
            existingProcess &&
            existingProcess.process &&
            !existingProcess.process.killed
        ) {
            return reject(
                new Error(`Session ${sessionId} is already running.`),
            );
        }

        // Start a new session
        const child = spawn(
            'node',
            [path.join(__dirname, '../session/index.js')],
            {
                env: { ...process.env, SESSION_ID: sessionId },
                stdio: ['inherit', 'inherit', 'inherit', 'ipc'],
            },
        );

        child.on('error', (err) =>
            reject(new Error(`Error starting service: ${err.message}`)),
        );

        child.on('spawn', () => {
            processes.set(sessionId, {
                process: child,
                childStatus: { status: 'running' },
                startTime: new Date().toISOString(),
                lastUpdate: new Date().toISOString(),
            });
            resolve();
        });

        child.on('message', (message) =>
            handleChildMessage(sessionId, message),
        );

        ['exit', 'SIGINT', 'SIGTERM', 'SIGQUIT'].forEach((signal) =>
            child.on(signal, () => {
                const proc = processes.get(sessionId);
                if (proc) {
                    processes.set(sessionId, {
                        ...proc,
                        childStatus: { status: 'stopped' },
                        lastUpdate: new Date().toISOString(),
                    });
                }
            }),
        );
    });
};

// Handle messages from child processes
const handleChildMessage = (sessionId, message) => {
    const proc = processes.get(sessionId);
    if (!proc) return;

    const { type, category, data, timestamp } = message;

    switch (type) {
        case 'status_update':
            handleStatusUpdate(sessionId, category, data, timestamp);
            break;

        case 'incoming_message':
            handleIncomingMessage(sessionId, data);
            break;

        default:
            console.warn(
                `Unknown message type from session ${sessionId}: ${type}`,
            );
            break;
    }
};

// Handle status updates
const handleStatusUpdate = (sessionId, category, data, timestamp) => {
    const proc = processes.get(sessionId);
    if (!proc) return;

    const updatedProcess = { ...proc, lastUpdate: timestamp };

    switch (category) {
        case 'child_process':
            updatedProcess.childStatus = { ...data };
            break;

        case 'whatsapp_session':
            const { status, ...sessionStatusData } = data;
            updatedProcess.sessionStatus =
                status === 'qr'
                    ? { ...data }
                    : { status, ...sessionStatusData };
            break;

        case 'heartbeat':
            break;

        default:
            console.warn(
                `Unknown status category from session ${sessionId}: ${category}`,
            );
            break;
    }

    processes.set(sessionId, updatedProcess);

    const { process: _, heartbeat: __, ...newObject } = updatedProcess;
    sendEvent(sessionId, 'status', newObject);
};

// Handle incoming messages
const handleIncomingMessage = (sessionId, messageData) => {
    sendEvent(sessionId, 'data', {
        type: 'incoming_message',
        sessionId,
        data: messageData,
    });
};

// Stop an existing session
const stopSession = (sessionId) => {
    return new Promise((resolve, reject) => {
        const proc = processes.get(sessionId);

        if (proc && proc.process && !proc.process.killed) {
            proc.process.kill();
            processes.set(sessionId, {
                ...proc,
                childStatus: { status: 'stopped' },
                lastUpdate: new Date().toISOString(),
            });
            resolve();
        } else {
            reject(
                new Error(
                    `Session ${sessionId} is not running or does not exist.`,
                ),
            );
        }
    });
};

// List all sessions
const listSessions = () => {
    return Array.from(processes.entries()).map(([id, info]) => {
        const { process, ...rest } = info;
        return { id, ...rest };
    });
};

// Graceful shutdown: terminate all processes
const shutdown = () => {
    processes.forEach(({ process }) => {
        if (process && !process.killed) {
            process.kill();
        }
    });
    process.exit();
};

// Handle various termination signals to ensure cleanup
process.on('exit', shutdown);
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
    shutdown();
});

module.exports = {
    startSession,
    stopSession,
    listSessions,
};
