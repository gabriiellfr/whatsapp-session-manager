const { Client, LocalAuth } = require('whatsapp-web.js');
const logger = require('../utils/logger');

const clientConfig = require('./client-config');
const status = require('./client-status');
const handlers = require('./client-handlers');

const { sendStatusToWebhook } = require('./status.service');

const initializeClient = (retryCount = 0) => {
    try {
        logger.info(
            `Attempting to initialize client... (${clientConfig.sessionId})`,
        );

        const client = new Client({
            takeoverOnConflict: true,
            restartOnAuthFail: true,
            puppeteer: {
                headless: true,
                args: [
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                    '--disable-dev-shm-usage',
                    '--disable-accelerated-2d-canvas',
                    '--no-first-run',
                    '--no-zygote',
                    '--disable-gpu',
                ],
            },
            authStrategy: new LocalAuth({
                dataPath: 'local_store',
                clientId: clientConfig.sessionId,
            }),
        });

        client.on('qr', (qr) => {
            handlers.qrHandler(qr, clientConfig.sessionId);
            status.updateStatus({ connected: false });
        });

        client.on('ready', () => {
            handlers.readyHandle(clientConfig.sessionId);
            status.updateStatus({ connected: true });
        });

        client.on('authenticated', () => {
            handlers.authenticatedHandler(clientConfig.sessionId);
            status.updateStatus({ authenticated: true });
        });

        client.on('message', (message) =>
            handlers.messageHandler(message, clientConfig.sessionId),
        );

        client.on('message_create', (message) =>
            handlers.messageCreateHandler(message, clientConfig.sessionId),
        );

        client.initialize();

        status.startProcess(); // Start tracking uptime and mark as initialized

        setInterval(() => {
            sendStatusToWebhook(clientConfig.sessionId);
        }, 5000);
    } catch (error) {
        status.logError(error); // Log the error using the updated status management
        logger.error(`Error initializing client: ${error}`);

        if (retryCount < clientConfig.maxRetries) {
            logger.info(
                `Retrying initialization... (Attempt ${retryCount + 1}/${
                    clientConfig.maxRetries
                })`,
            );
            setTimeout(
                () => initializeClient(retryCount + 1),
                clientConfig.retryDelayMs,
            );
        } else {
            status.updateStatus({
                error: 'Max retry attempts reached. Initialization failed.',
                running: false,
            });
            logger.error('Max retry attempts reached. Initialization failed.');
        }
    }
};

module.exports = initializeClient;
