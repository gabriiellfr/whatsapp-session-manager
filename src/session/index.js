const { Client, LocalAuth } = require('whatsapp-web.js');
const dotenv = require('dotenv');
const logger = require('../utils/logger');
const handlers = require('../services/handlers.service');

dotenv.config();

const sessionId = process.env.SESSION_ID || 'default_session';

const MAX_RETRIES = 5;
const RETRY_DELAY_MS = 2000;

const startClient = (retryCount = 0) => {
    try {
        logger.info(`Attempting to initialize client... (${sessionId})`);

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
                clientId: sessionId,
            }),
        });

        // Pass sessionId to handlers
        client.on('qr', (qr) => handlers.qrHandler(qr, sessionId));
        client.on('ready', () => handlers.readyHandle(sessionId));
        client.on('authenticated', () =>
            handlers.authenticatedHandler(sessionId),
        );
        client.on('message', (message) =>
            handlers.messageHandler(message, sessionId),
        );
        client.on('message_create', (message) =>
            handlers.messageCreateHandler(message, sessionId),
        );

        client.initialize();
    } catch (error) {
        logger.error(`Error initializing client: ${error}`);

        if (retryCount < MAX_RETRIES) {
            retryCount += 1;
            logger.info(
                `Retrying initialization... (Attempt ${retryCount}/${MAX_RETRIES})`,
            );
            setTimeout(() => startClient(retryCount), RETRY_DELAY_MS);
        } else {
            logger.error('Max retry attempts reached. Initialization failed.');
        }
    }
};

startClient();

process.on('exit', () => {
    console.log('exit');
});

process.on('SIGINT', () => {
    console.log('SIGINT');
    process.exit();
});

process.on('SIGTERM', () => {
    console.log('SIGTERM');
    process.exit();
});
