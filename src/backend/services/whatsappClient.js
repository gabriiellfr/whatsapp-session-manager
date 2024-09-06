import pkg from 'whatsapp-web.js';
const { Client, LocalAuth } = pkg;
import qrcode from 'qrcode';
import EventEmitter from 'events';

class WhatsAppClient extends EventEmitter {
    constructor(config) {
        super();
        this.config = {
            sessionId: 'default_session',
            maxReconnectAttempts: 10,
            reconnectInterval: 10000,
            heartbeatInterval: 10000,
            messageRetryAttempts: 3,
            messageRetryDelay: 5000,
            maxQRAttempts: 5,
            puppeteerListenerRetryInterval: 1000,
            maxPuppeteerListenerRetries: 10,
            ...config,
        };

        this.client = null;
        this.clientInfo = null;

        this.heartbeatTimer = null;
        this.puppeteerRetryTimer = null;
        this.reconnectAttempts = 0;
        this.QRAttempts = 0;

        this.isDestroying = false;
        this.isLoggingOut = false;
        this.isStopping = false;
        this.isInitialized = false;

        this.ownListeners = {
            client: new Map(),
            pupPage: new Map(),
            pupBrowser: new Map(),
        };

        this.updateStatus('created');
        this.emit('info', {
            message: 'Client started and waiting to initialize.',
        });
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
        this.emit('status_update', this.status);
    }

    handleError(message, error) {
        this.updateStatus(message, { message: error });
        this.emit('error', { message, error });
    }

    async initialize() {
        if (this.isInitialized) {
            this.emit('info', {
                message: 'Client already initialized. Skipping initialization.',
            });
            return;
        }

        if (this.isStopping) {
            this.emit('error', {
                message: 'Cannot initialize after stop. Create a new instance.',
            });
            return;
        }

        this.updateStatus('initializing');
        this.emit('info', {
            message: 'Starting client setup',
        });

        try {
            this.client = new Client({
                authStrategy: new LocalAuth({
                    dataPath: 'local_store',
                    clientId: this.config.sessionId,
                }),
                puppeteer: {
                    headless: true,
                    args: ['--no-sandbox', '--disable-setuid-sandbox'],
                    defaultViewport: null,
                },
            });

            this.setupEventListeners();
            this.startHeartbeat();
            await this.client.initialize();
            this.attemptPuppeteerListenerSetup();

            this.isInitialized = true;
            this.emit('info', { message: 'Starting client setup: Success' });
        } catch (error) {
            this.handleError('initialization_error', error);

            this.emit('info', {
                message: 'Error while initializing',
            });

            await this.handleReconnection();
        }
    }

    addOwnListener(target, event, listener) {
        if (!this.ownListeners[target]) {
            this.ownListeners[target] = new Map();
        }
        if (!this.ownListeners[target].has(event)) {
            this.ownListeners[target].set(event, new Set());
        }
        this.ownListeners[target].get(event).add(listener);

        if (target === 'client' && this.client) {
            this.client.on(event, listener);
        } else if (target === 'pupPage' && this.client && this.client.pupPage) {
            this.client.pupPage.on(event, listener);
        } else if (
            target === 'pupBrowser' &&
            this.client &&
            this.client.pupBrowser
        ) {
            this.client.pupBrowser.on(event, listener);
        }
    }

    setupEventListeners() {
        this.emit('info', { message: 'Setting up client listeners' });

        this.addOwnListener('client', 'qr', async (qr) => {
            this.QRAttempts++;

            if (this.QRAttempts < this.config.maxQRAttempts) {
                const qrUrl = await qrcode.toDataURL(qr);
                this.updateStatus('qr_ready', { qrUrl });
            } else {
                this.emit('info', {
                    message: 'Max QR code scan attempts reached.',
                });

                this.stop();
            }
        });

        this.addOwnListener('client', 'ready', async () => {
            this.clientInfo = this.client.info;
            this.updateStatus('ready');

            this.reconnectAttempts = 0;
            this.QRAttempts = 0;
        });

        this.addOwnListener('client', 'authenticated', () => {
            this.updateStatus('authenticated');
        });

        this.addOwnListener('client', 'auth_failure', (reason) => {
            this.updateStatus('auth_failure', { message: reason });
        });

        this.addOwnListener('client', 'disconnected', (reason) => {
            this.clientInfo = null;
            this.updateStatus('disconnected', { message: reason });
        });

        this.addOwnListener('client', 'message', (message) => {
            if (message.author) return;

            this.emit('incoming_message', message);
        });

        this.addOwnListener('client', 'message_create', (message) => {
            this.emit('message_create', message);
        });

        this.emit('info', { message: 'Setting up client listeners: Success' });
    }

    setupPuppeteerEventListeners() {
        this.emit('info', { message: 'Setting up browser listeners' });

        const handleError = (errorType) => {
            if (this.isDestroying) {
                this.emit('info', {
                    message: `Ignoring ${errorType} during shutdown`,
                });
                return;
            }
            this.handleError(errorType);
            this.handleReconnection();
        };

        this.addOwnListener('pupPage', 'error', () =>
            handleError('puppeteer_page_error')
        );
        this.addOwnListener('pupPage', 'close', () =>
            handleError('puppeteer_page_closed')
        );
        this.addOwnListener('pupBrowser', 'disconnected', () =>
            handleError('puppeteer_browser_disconnected')
        );

        this.emit('info', { message: 'Setting up browser listeners: Success' });
    }

    attemptPuppeteerListenerSetup(retryCount = 0) {
        this.emit('info', {
            message: 'Attempting to setup browser listeners',
        });

        if (this.client.pupPage && this.client.pupBrowser) {
            this.setupPuppeteerEventListeners();
        } else if (retryCount < this.config.maxPuppeteerListenerRetries) {
            this.puppeteerRetryTimer = setTimeout(
                () => this.attemptPuppeteerListenerSetup(retryCount + 1),
                this.config.puppeteerListenerRetryInterval
            );
        } else {
            this.handleError(
                'puppeteer_setup_error',
                'Max retries reached for setting up Puppeteer listeners'
            );
        }
    }

    startHeartbeat() {
        if (this.heartbeatTimer) {
            this.emit('info', {
                message: 'Heartbeat already started. Skipping.',
            });
            return;
        }

        this.emit('info', {
            message: 'Starting Heartbeat.',
        });

        this.heartbeatListener = async () => {
            if (this.isDestroying) {
                this.stopHeartbeat();
                return;
            }

            if (this.status.isConnected) {
                try {
                    const state = await this.client.getState();
                    if (state !== 'CONNECTED') {
                        this.emit('info', {
                            message:
                                'Detected disconnected state during heartbeat',
                            error: state,
                        });
                        this.updateStatus('disconnected');
                        this.stop();
                    }
                } catch (error) {
                    this.handleError('heartbeat_error', error);
                    this.stop();
                }
            }
            if (!this.isDestroying) {
                this.emit('status_update', this.status);
            }
        };

        this.heartbeatTimer = setInterval(
            this.heartbeatListener,
            this.config.heartbeatInterval
        );
    }

    stopHeartbeat() {
        if (this.heartbeatTimer) {
            this.emit('info', {
                message: 'Heartbeat stopped.',
            });

            clearInterval(this.heartbeatTimer);
            this.heartbeatTimer = null;
            this.heartbeatListener = null;
        }
    }

    async handleReconnection() {
        if (this.isDestroying || this.isStopping || this.isLoggingOut) {
            this.emit('info', {
                message: 'Ignoring reconnection attempt during shutdown/logout',
            });
            return;
        }

        this.emit('info', {
            message: 'Attempting to reconnect',
        });

        this.reconnectAttempts++;

        if (this.reconnectAttempts < this.config.maxReconnectAttempts) {
            this.updateStatus('reconnecting', {
                attempt: this.reconnectAttempts,
                max: this.config.maxReconnectAttempts,
            });

            try {
                await this.destroy();

                await new Promise((resolve) =>
                    setTimeout(resolve, this.config.reconnectInterval)
                );

                await this.initialize();
            } catch (error) {
                this.handleError('reconnection_error', error);
            }
        } else {
            this.handleError(
                'max_reconnect_attempts',
                'Max reconnection attempts reached'
            );
        }
    }

    async logout() {
        if (this.isLoggingOut) {
            this.emit('info', { message: 'Logout already in progress' });
            return;
        }

        this.isLoggingOut = true;
        this.emit('info', { message: 'Logging out client...' });

        try {
            if (this.client) {
                await this.client.logout();
            }
        } catch (error) {
            this.handleError('logout_error', error);
        } finally {
            await this.destroy();
            this.isLoggingOut = false;
            this.updateStatus('logged_out');
        }
    }

    async stop() {
        this.emit('info', { message: 'Stopping Client...' });
        this.updateStatus('stopped');
        await this.destroy();
    }

    async destroy() {
        if (this.isDestroying) {
            this.emit('info', { message: 'Destroy already in progress' });
            return;
        }

        this.isDestroying = true;
        this.emit('info', { message: 'Starting destruction process' });

        // Stop the heartbeat
        this.stopHeartbeat();

        if (this.puppeteerRetryTimer) {
            clearTimeout(this.puppeteerRetryTimer);
            this.puppeteerRetryTimer = null;
        }

        if (this.client) {
            try {
                // Remove only the listeners added by this class
                for (const [event, listeners] of this.ownListeners.client) {
                    for (const listener of listeners) {
                        this.client.removeListener(event, listener);
                    }
                }

                // Remove Puppeteer-specific listeners
                if (this.client.pupPage) {
                    for (const [event, listeners] of this.ownListeners
                        .pupPage) {
                        for (const listener of listeners) {
                            this.client.pupPage.removeListener(event, listener);
                        }
                    }
                }

                if (this.client.pupBrowser) {
                    for (const [event, listeners] of this.ownListeners
                        .pupBrowser) {
                        for (const listener of listeners) {
                            this.client.pupBrowser.removeListener(
                                event,
                                listener
                            );
                        }
                    }
                }

                // Only destroy the client if we're not logging out or stopping
                if (!this.isLoggingOut && !this.isStopping) {
                    await this.client.destroy();
                }
            } catch (error) {
                console.error('Error during client destruction:', error);
                this.emit('info', {
                    message: 'Error during client destruction:',
                    error,
                });
            } finally {
                this.client = null;
            }
        }

        // Reset all properties
        this.clientInfo = null;
        this.reconnectAttempts = 0;
        this.QRAttempts = 0;
        this.isInitialized = false;

        // Clear the tracked listeners
        this.ownListeners = {
            client: new Map(),
            pupPage: new Map(),
            pupBrowser: new Map(),
        };

        this.updateStatus('stopped');
        this.emit('info', {
            message: 'WhatsAppClient has been completely destroyed',
        });

        this.isDestroying = false;
    }

    getStatus() {
        return { ...this.status };
    }

    async getAllChats() {
        if (!this.status.isConnected) {
            this.emit('error', {
                message: 'Cannot retrieve chats: Client is not running.',
            });
            return [];
        }

        try {
            const chats = await this.client.getChats();

            return chats
                .map((chat) => ({
                    id: chat.id._serialized,
                    name: chat.name,
                    isGroup: chat.isGroup,
                    timestamp: chat.timestamp,
                    unreadCount: chat.unreadCount,
                    lastMessage: chat.lastMessage?._data?.body,
                }))
                .sort((a, b) => b.timestamp - a.timestamp);
        } catch (error) {
            this.handleError('get_all_chats_error', error);
            return [];
        }
    }

    async sendMessage(message, dev = true, retryCount = 0) {
        console.log(message);

        if (dev && message.to !== '555191868922@c.us') return;

        if (!this.status.isConnected) {
            this.emit('erro', {
                message: 'Cannot send message: Client is not connected',
            });
        }

        const { to, body } = message;

        try {
            const chat = await this.client.getChatById(to);
            await chat.sendMessage(body);
        } catch (error) {
            this.emit('info', { message: 'Failed to send message', error });
            if (retryCount < this.config.messageRetryAttempts) {
                await new Promise((resolve) =>
                    setTimeout(resolve, this.config.messageRetryDelay)
                );

                return this.sendMessage(message, retryCount + 1);
            } else {
                this.emit('info', {
                    message: 'Max retry attempts reached for sending message',
                    error,
                });
            }
        }
    }

    async getMessages(chatId, limit = 50) {
        if (!this.status.isConnected) {
            this.emit('error', {
                message: 'Cannot retrieve messages: Client is not running.',
            });
            return [];
        }

        try {
            const chat = await this.client.getChatById(chatId);
            const messages = await chat.fetchMessages({ limit });

            await chat.sendSeen();

            return messages.map((msg) => ({
                id: msg.id.id,
                body: msg.body,
                fromMe: msg.fromMe,
                author: msg.author,
                timestamp: msg.timestamp,
                hasMedia: msg.hasMedia,
                from: msg.from,
                to: msg.to,
                ack: msg.ack,
            }));
        } catch (error) {
            this.emit('info', {
                message: error,
            });
            return;
        }
    }
}

export default WhatsAppClient;
