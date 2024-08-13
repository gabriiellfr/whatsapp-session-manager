const logger = require('../utils/logger');
const status = require('./client-status');

const handleProcessEvents = () => {
    process.on('exit', (code) => {
        status.updateStatus({
            running: false,
            connected: false,
            authenticated: false,
            error: {
                message: `Process exited with code: ${code}`,
                code: code,
            },
        });
        logger.info(`Process exited with code: ${code}`);
    });

    process.on('SIGINT', () => {
        status.updateStatus({
            running: false,
            connected: false,
            authenticated: false,
            error: {
                message: 'Process terminated by SIGINT (Ctrl+C)',
            },
        });
        logger.info('Process terminated by SIGINT (Ctrl+C)');
        process.exit();
    });

    process.on('SIGTERM', () => {
        status.updateStatus({
            running: false,
            connected: false,
            authenticated: false,
            error: {
                message: 'Process terminated by SIGTERM',
            },
        });
        logger.info('Process terminated by SIGTERM');
        process.exit();
    });

    process.on('uncaughtException', (err) => {
        status.updateStatus({
            running: false,
            connected: false,
            authenticated: false,
            error: {
                message: `Uncaught Exception: ${err.message}`,
                stack: err.stack,
            },
        });
        logger.error(`Uncaught Exception: ${err.message}\n${err.stack}`);
        process.exit(1);
    });

    process.on('unhandledRejection', (reason, promise) => {
        const errorDetails =
            typeof reason === 'object' && reason !== null
                ? {
                      message: reason.message,
                      stack: reason.stack,
                  }
                : { message: String(reason) };

        status.updateStatus({
            running: false,
            connected: false,
            authenticated: false,
            error: {
                message: `Unhandled Rejection: ${errorDetails.message}`,
                stack: errorDetails.stack,
            },
        });
        logger.error(
            `Unhandled Rejection at: ${promise}\nReason: ${
                errorDetails.message
            }\n${errorDetails.stack || ''}`,
        );
        process.exit(1);
    });
};

module.exports = handleProcessEvents;
