const { spawn } = require('child_process');
const kill = require('tree-kill');
const path = require('path');

const { sendEvent } = require('./webhook.service');

const sendEventWithHandling = async (type, data) => {
    try {
        await sendEvent(type, data);
    } catch (error) {
        console.error(
            `Failed to send event for session ${data.sessionId}:`,
            error,
        );
    }
};

const processes = new Map();

const startSession = (sessionId) => {
    return new Promise((resolve, reject) => {
        const existingProcess = processes.get(sessionId);
        if (
            existingProcess &&
            existingProcess.process &&
            !existingProcess.process.killed &&
            existingProcess.childStatus.status !== 'stopped'
        ) {
            return resolve(`Session ${sessionId} is already running.`);
        }

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

            /*
            setTimeout(() => {
                const proc = processes.get(sessionId);

                console.log('KILL IT', proc.process.pid);

                kill(proc.process.pid, 'SIGKILL');
            }, 20000);

            resolve();

            */
        });

        child.on('message', (message) => handleChildMessage(message));

        ['exit', 'SIGINT', 'SIGTERM', 'SIGQUIT'].forEach((signal) =>
            child.on(signal, async () => {
                console.log("'exit', 'SIGINT', 'SIGTERM', 'SIGQUIT'");
                const proc = processes.get(sessionId);

                if (proc) {
                    const updatedProcess = {
                        ...proc,
                        lastUpdate: new Date().toISOString(),
                        type: 'status',
                    };

                    updatedProcess.childStatus = { status: 'stopped' };
                    updatedProcess.sessionStatus = {
                        status: 'stopped',
                        message: 'Session is no longer running',
                    };

                    const {
                        process: _,
                        heartbeat: __,
                        ...newObject
                    } = updatedProcess;

                    //await sendEventWithHandling('status_update', newObject);
                }
            }),
        );
    });
};

const handleChildMessage = (message) => {
    const child = processes.get(message.sessionId);

    if (!child) return;

    switch (message.type) {
        case 'status_update':
            handleStatusUpdate(message);
            break;

        case 'incoming_message':
            handleIncomingMessage(message);
            break;

        default:
            console.warn(
                `Unknown message type from session ${message.sessionId}: ${type}`,
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

const stopSession = (sessionId) => {
    return new Promise((resolve, reject) => {
        const existingProcess = processes.get(sessionId);

        if (
            existingProcess &&
            existingProcess.process &&
            !existingProcess.process.killed
        ) {
            kill(existingProcess.process.pid, 'SIGKILL');

            processes.set(sessionId, {
                ...existingProcess,
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

const sendSessions = (sessionId, type, data) => {
    const { to, content } = data;

    const existingProcess = processes.get(sessionId);

    if (
        existingProcess &&
        existingProcess.process &&
        !existingProcess.process.killed
    ) {
        existingProcess.process.send({
            type,
            data: { to, content },
        });
    } else {
        console.error(`Session ${sessionId} is not running or does not exist.`);
    }
};

const listSessions = () => {
    return Array.from(processes.entries()).map(([id, info]) => {
        const { process, ...rest } = info;
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
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection:', reason);
    shutdown();
});

module.exports = {
    startSession,
    stopSession,
    sendSessions,
    listSessions,
};
