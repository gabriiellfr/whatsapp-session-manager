const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode');

const SESSION_ID = process.env.SESSION_ID || 'default_session';
const HEARTBEAT_INTERVAL = 10000;

const notifyParent = (type, category, data = {}) => {
    process.send({
        type,
        category,
        sessionId: SESSION_ID,
        data,
        timestamp: new Date().toISOString(),
    });
};

const updateWhatsAppStatus = (status, extraDetails = {}) => {
    notifyParent('status_update', 'whatsapp_session', {
        status,
        ...extraDetails,
    });
};

const sendHeartbeat = () => {
    notifyParent('status_update', 'heartbeat', {
        message: 'Client heartbeat check.',
    });
};

const handleIncomingMessage = (eventType, payload) => {
    notifyParent('incoming_message', 'message', { eventType, payload });
};

const generateQRCode = async (qr) => {
    try {
        const qrUrl = await qrcode.toDataURL(qr);
        updateWhatsAppStatus('qr', { qrUrl });
    } catch (err) {
        updateWhatsAppStatus('qr_error', { message: err.toString() });
    }
};

const initializeClient = async () => {
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
            clientId: SESSION_ID,
        }),
    });

    client.on('qr', (qr) => {
        generateQRCode(qr);
    });

    client.on('ready', () => {
        updateWhatsAppStatus('ready', {
            message: 'WhatsApp session is ready.',
        });
    });

    client.on('authenticated', () => {
        updateWhatsAppStatus('authenticated', {
            message: 'WhatsApp session is authenticated.',
        });
    });

    client.on('message', (message) => {
        handleIncomingMessage('message', message);
    });

    client.on('message_create', (message) => {
        handleIncomingMessage('message_create', message);
    });

    client.on('disconnected', (reason) => {
        updateWhatsAppStatus('disconnected', { reason });
    });

    try {
        await client.initialize();
    } catch (error) {
        updateWhatsAppStatus('error', {
            message: error.toString(),
        });

        process.exit();
    }
};

initializeClient();

// Send a heartbeat every 10 seconds
setInterval(() => {
    sendHeartbeat();
}, HEARTBEAT_INTERVAL);
