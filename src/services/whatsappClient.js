const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode');
const EventEmitter = require('events');

class WhatsAppClient extends EventEmitter {
    constructor(config) {
        super();
        this.config = {
            sessionId: 'default_session',
            maxReconnectAttempts: 10,
            reconnectInterval: 5000,
            heartbeatInterval: 5000,
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

        this.isDestroying = false;

        this.updateStatus('created');
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
    }

    async initialize() {
        if (this.client) {
            this.emit('info', {
                message: 'Client already initialized. Skipping initialization.',
            });
            return;
        }

        this.updateStatus('initializing');

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
        } catch (error) {
            this.handleError('initialization_error', error);
            this.handleReconnection();
        }
    }

    setupEventListeners() {
        this.emit('info', { message: 'Setting up EventListeners' });

        this.client.on('qr', async (qr) => {
            const qrUrl = await qrcode.toDataURL(qr);

            this.updateStatus('qr_ready', { qrUrl });
        });

        this.client.on('ready', async () => {
            this.clientInfo = this.client.info;
            this.updateStatus('ready');
            this.reconnectAttempts = 0;
        });

        this.client.on('authenticated', () => {
            this.updateStatus('authenticated');
        });

        this.client.on('auth_failure', (reason) => {
            this.updateStatus('auth_failure', { message: reason });
        });

        this.client.on('disconnected', (reason) => {
            this.clientInfo = null;

            this.updateStatus('disconnected', { message: reason });
        });
    }

    setupPuppeteerEventListeners() {
        this.emit('info', { message: 'Setting up PuppeteerEventListeners' });

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

        this.client.pupPage.on('error', () =>
            handleError('puppeteer_page_error')
        );
        this.client.pupPage.on('close', () =>
            handleError('puppeteer_page_closed')
        );
        this.client.pupBrowser.on('disconnected', () =>
            handleError('puppeteer_browser_disconnected')
        );
    }

    attemptPuppeteerListenerSetup(retryCount = 0) {
        this.emit('info', {
            message: 'Attempting to setup PuppeteerListenerSetup',
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

        this.heartbeatTimer = setInterval(async () => {
            if (this.isStopped) {
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
                        this.handleReconnection();
                    }
                } catch (error) {
                    this.handleError('heartbeat_error', error);
                    this.handleReconnection();
                }
            }
            if (!this.isStopped) {
                this.emit('status_update', this.status);
            }
        }, this.config.heartbeatInterval);
    }

    async handleReconnection() {
        if (this.isDestroying) {
            this.emit('info', {
                message: 'Ignoring reconnection attempt during shutdown',
            });
            return;
        }

        this.reconnectAttempts++;

        if (this.reconnectAttempts < this.config.maxReconnectAttempts) {
            this.updateStatus('reconnecting', {
                attempt: this.reconnectAttempts,
                max: this.config.maxReconnectAttempts,
            });

            try {
                await this.client.destroy();
                this.client = null;

                setTimeout(
                    () => this.initialize(),
                    this.config.reconnectInterval
                );
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

    async sendMessage(message, retryCount = 0) {
        if (!this.status.isConnected) {
            throw new Error('Client is not connected');
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

    async destroy() {
        if (this.isDestroying) {
            this.emit('info', { message: 'Destroy already in progress' });
            return;
        }

        this.isDestroying = true;
        this.emit('info', { message: 'Starting destruction process' });

        // Clear all timers
        clearInterval(this.heartbeatTimer);
        this.heartbeatTimer = null;

        if (this.puppeteerRetryTimer) {
            clearTimeout(this.puppeteerRetryTimer);
            this.puppeteerRetryTimer = null;
        }

        if (this.client) {
            try {
                // Remove all listeners from the client
                this.client.removeAllListeners();

                // Remove Puppeteer-specific listeners
                if (this.client.pupPage) {
                    this.client.pupPage.removeAllListeners();
                }
                if (this.client.pupBrowser) {
                    this.client.pupBrowser.removeAllListeners();
                }

                // Destroy the client
                await this.client.destroy();
            } catch (error) {
                console.error('Error during client destruction:', error);
                this.emit('info', {
                    message: 'Error during client destruction:',
                });
            } finally {
                this.client = null;
            }
        }

        // Reset all properties
        this.clientInfo = null;
        this.reconnectAttempts = 0;

        // Final status update
        this.updateStatus('stopped');

        // Remove all remaining listeners after the final emit
        this.removeAllListeners();

        this.emit('info', {
            message: 'WhatsAppClient has been completely destroyed',
        });
    }

    getStatus() {
        return { ...this.status };
    }

    async getAllChats() {
        if (!this.status.isConnected) {
            this.emit('info', {
                message: 'Cannot retrieve chats, client is not running.',
            });
            return [];
        }

        try {
            const chats = await this.client.getChats();

            console.log(chats[0].lastMessage._data.body);
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
            this.emit('error', {
                message: 'Error retrieving chats',
                error: error.message,
            });
            return [];
        }
    }

    async getMessages(chatId, limit = 50) {
        if (!this.status.isConnected) {
            this.emit('info', {
                message: 'Cannot retrieve messages, client is not running.',
            });
            return;
        }

        const chat = await this.client.getChatById(chatId);
        const messages = await chat.fetchMessages({ limit });

        return messages.map((msg) => ({
            id: msg.id._serialized,
            body: msg.body,
            fromMe: msg.fromMe,
            author: msg.author,
            timestamp: msg.timestamp,
            hasMedia: msg.hasMedia,
            from: msg.from,
            to: msg.to,
            ack: msg.ack,
        }));
    }
}

module.exports = WhatsAppClient;
