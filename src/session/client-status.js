const logger = require('../utils/logger');

let clientStatus = {
    initialized: false,
    connected: false,
    authenticated: false,
    running: false,
    error: null,
    uptime: 0,
    lastUpdate: null,
    startTime: null,
};

const updateStatus = (statusUpdate) => {
    // Update running time if the process is active
    if (clientStatus.running && clientStatus.startTime) {
        clientStatus.uptime = Date.now() - clientStatus.startTime;
    }

    // Update the status object with the new values
    clientStatus = { ...clientStatus, ...statusUpdate };

    // Always update the last update timestamp
    clientStatus.lastUpdate = new Date().toISOString();

    logger.info(`Client status updated: ${JSON.stringify(clientStatus)}`);
};

const startProcess = () => {
    clientStatus.startTime = Date.now();
    updateStatus({
        initialized: true,
        running: true,
        error: null,
    });
};

const stopProcess = () => {
    updateStatus({
        running: false,
        uptime: Date.now() - clientStatus.startTime,
    });
};

const logError = (error) => {
    let errorDetails;

    if (typeof error === 'string') {
        errorDetails = {
            message: error,
            stack: null,
        };
    } else if (typeof error === 'object' && error !== null) {
        errorDetails = {
            message: error.message || 'Unknown error',
            stack: error.stack || 'No stack trace available',
        };
    } else {
        errorDetails = {
            message: 'An unknown error occurred',
            stack: null,
        };
    }

    updateStatus({
        error: errorDetails,
        running: false,
    });
};

const getStatus = () => clientStatus;

module.exports = {
    updateStatus,
    getStatus,
    startProcess,
    stopProcess,
    logError,
};
