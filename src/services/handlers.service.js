const qrcode = require('qrcode');

const logger = require('../utils/logger');

const { handleIncomingMessage } = require('./message.service');

const qrHandler = (qr, sessionId) => {
    logger.info(`QR Code received: ${sessionId}`);

    qrcode.toDataURL(qr, (err, url) => {
        if (err) return logger.error(`Error generating QR code: ${err}`);

        handleIncomingMessage(sessionId, {
            status: 'qr_code_received',
            data: {
                message: 'Scan QR code to start.',
                qr: url,
            },
        });
    });
};

const readyHandle = (sessionId) => {
    try {
        logger.info(`WhatsApp client is ready! ${sessionId}`);

        handleIncomingMessage(sessionId, {
            status: 'client_ready',
            data: {
                message: 'You are succefully connected.',
            },
        });
    } catch (err) {
        logger.info(`Error on ready event: ${err}`);
    }
};

const authenticatedHandler = (sessionId) => {
    try {
        logger.info('Authenticated!');

        handleIncomingMessage(sessionId, {
            status: 'client_authenticated',
            data: {
                message: 'You are Authenticated.',
            },
        });
    } catch (err) {
        logger.info(`Error on authenticated event: ${err}`);
    }
};

const messageHandler = (message, sessionId) => {
    try {
        logger.info('Message received!');

        handleIncomingMessage(sessionId, {
            status: 'message_received',
            data: {
                message: {
                    fromMe: message.fromMe,
                    to: message.to,
                    from: message.from,
                    body: message.body,
                },
            },
        });
    } catch (err) {
        logger.info(`Error on message event: ${err}`);
    }
};

const messageCreateHandler = (message, sessionId) => {
    try {
        logger.info('Message sent!');

        handleIncomingMessage(sessionId, {
            status: 'message_sent',
            data: {
                message: {
                    fromMe: message.fromMe,
                    to: message.to,
                    from: message.from,
                    body: message.body,
                },
            },
        });
    } catch (err) {
        logger.info(`Error on messageCreate event: ${err}`);
    }
};

module.exports = {
    qrHandler,
    readyHandle,
    authenticatedHandler,
    messageHandler,
    messageCreateHandler,
};
