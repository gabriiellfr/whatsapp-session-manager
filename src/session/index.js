const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode');

const { v4: uuidv4 } = require('uuid');

class WhatsAppManager {
    constructor(sessionId = 'default_session', heartbeatInterval = 5000) {
        this.SESSION_ID = sessionId;
        this.HEARTBEAT_INTERVAL = heartbeatInterval;

        this.client = null;
        this.clientInfo = null;
        this.heartbeatTimer = null;
        this.isReconnecting = false;

        this.status = this.createStatus('initializing');
    }

    createStatus(connectionStatus, extraData = {}) {
        return {
            isConnected: connectionStatus === 'ready',
            clientInfo: this.clientInfo,
            status: connectionStatus,
            statusInfo: extraData,
        };
    }

    updateStatus(connectionStatus, extraData = {}) {
        this.status = this.createStatus(connectionStatus, extraData);
        this.notifyParent('status_update', this.status);
    }

    createMessage(message) {
        return { ...message };
    }

    async initialize() {
        this.client = new Client({
            puppeteer: {
                headless: true,
                args: [
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                    '--disable-dev-shm-usage',
                    '--disable-accelerated-2d-canvas',
                    '--no-first-run',
                    '--disable-extensions',
                    '--disable-component-extensions-with-background-pages',
                    '--disable-default-apps',
                    '--mute-audio',
                    '--no-default-browser-check',
                    '--autoplay-policy=no-user-gesture-required',
                    '--disable-features=TranslateUI',
                    '--disable-notifications',
                    '--disable-ipc-flooding-protection',
                    '--js-flags=--expose-gc,--max-old-space-size=512',
                    '--no-zygote',
                ],
                defaultViewport: { width: 800, height: 600 },
                ignoreHTTPSErrors: true,
            },
            authStrategy: new LocalAuth({
                dataPath: 'local_store',
                clientId: this.SESSION_ID,
            }),
        });

        this.setupEventListeners();
        this.startHeartbeat();

        try {
            await this.client.initialize();
        } catch (error) {
            this.handleError('initialization_error', error);
            await this.reconnect();
        }
    }

    setupEventListeners() {
        this.client.on('qr', (qr) => this.handleQR(qr));
        this.client.on('auth_failure', (msg) => this.handleAuthFailure(msg));
        this.client.on('ready', () => this.handleReady());
        this.client.on('authenticated', () => this.handleAuthenticated());
        this.client.on('message', (message) => this.handleMessage(message));
        this.client.on('message_create', (message) =>
            this.handleMessage(message),
        );
        this.client.on('disconnected', () => this.handleDisconnected());
        this.client.on('error', (error) =>
            this.handleError('client_error', error),
        );

        process.on('message', (message) => this.handleParentMessage(message));
    }

    async handleQR(qr) {
        try {
            const qrUrl = await qrcode.toDataURL(qr);
            this.updateStatus('qr_ready', { qrUrl });
        } catch (error) {
            this.handleError('qr_generation_error', error);
        }
    }

    handleAuthFailure(msg) {
        this.updateStatus('auth_failure', { message: msg.toString() });
    }

    handleReady() {
        this.clientInfo = this.client.info;
        this.updateStatus('ready');
    }

    handleAuthenticated() {
        this.updateStatus('authenticated');
    }

    handleMessage(message) {
        const { fromMe, from, to, timestamp, body, ack, type } = message;

        const messageId = uuidv4();

        this.notifyParent(
            'incoming_message',
            this.createMessage({
                id: messageId,
                fromMe,
                from,
                to,
                timestamp,
                body,
                ack,
                type,
            }),
        );
    }

    handleDisconnected() {
        this.clientInfo = null;

        this.updateStatus('disconnected');

        this.reconnect();
    }

    handleError(event, error) {
        this.updateStatus('error', {
            event,
            error: error.toString(),
        });
    }

    async handleParentMessage(message) {
        if (message.type === 'send_message') {
            const { to, content } = message.data;

            try {
                await this.client.sendMessage(to, content);
            } catch (error) {
                this.handleError('message_send_error', error);
            }
        }
    }

    notifyParent(type, data = {}) {
        process.send({
            type,
            data,
            sessionId: this.SESSION_ID,
            timestamp: new Date().toISOString(),
        });
    }

    startHeartbeat() {
        this.heartbeatTimer = setInterval(() => {
            if (!this.isReconnecting) {
                this.notifyParent('status_update', this.status);
            }
        }, this.HEARTBEAT_INTERVAL);
    }

    stopHeartbeat() {
        if (this.heartbeatTimer) {
            clearInterval(this.heartbeatTimer);
            this.heartbeatTimer = null;
        }
    }

    async reconnect() {
        console.log('Attempting to reconnect...');
        this.isReconnecting = true;
        this.stopHeartbeat();

        this.updateStatus('reconnecting');

        await new Promise((resolve) => setTimeout(resolve, 5000)); // Wait for 5 seconds
        await this.client.initialize();

        this.isReconnecting = false;
        this.startHeartbeat();
    }
}

const manager = new WhatsAppManager(process.env.SESSION_ID);
manager.initialize();
