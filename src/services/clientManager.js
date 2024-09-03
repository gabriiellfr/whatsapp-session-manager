// src/services/ClientManager.js
const WhatsAppClient = require('./WhatsAppClient');
const EventEmitter = require('events');

const SessionData = require('../models/sessionData');

const logger = require('../utils/logger');
const { db } = require('../config/firebase');

class ClientManager extends EventEmitter {
    constructor() {
        super();
        if (!ClientManager.instance) {
            this.clients = new Map();
            ClientManager.instance = this;
        }
        return ClientManager.instance;
    }

    async createClient(config, userId) {
        const sessionData = new SessionData({ ...config, userId });
        const { sessionId } = sessionData;

        if (this.clients.has(sessionId)) {
            throw new Error(
                `Client with session ID ${sessionId} already exists`
            );
        }

        this.emit('join_room', { sessionId, userId });

        const client = new WhatsAppClient({ ...config, sessionId });
        this.clients.set(sessionId, client);

        try {
            client.initialize();

            client.on('status_update', (status) => {
                this.emit('status_update', {
                    id: sessionId,
                    data: status,
                    timestamp: new Date().toISOString(),
                });
            });

            client.on('info', (info) => {
                this.emit('info', { sessionId, info });
            });

            sessionData.update(client.getStatus());
            await this.saveSessionToFirebase(sessionData);

            return {
                id: sessionId,
                isRunning: true,
                data: client.status,
                timestamp: new Date().toISOString(),
            };
        } catch (error) {
            this.clients.delete(sessionId);
            throw error;
        }
    }

    async startAllSessions() {
        try {
            logger.info('Starting all existing sessions...');
            const snapshot = await db.collection('whatsapp_sessions').get();

            const startPromises = snapshot.docs.map(async (doc) => {
                const sessionData = new SessionData(doc.data());
                const { sessionId, userId } = sessionData;

                if (!this.clients.has(sessionId)) {
                    try {
                        await this.startClient(sessionId, userId);
                    } catch (error) {
                        logger.error(
                            `Failed to start client for session ${sessionId}`,
                            error
                        );
                    }
                }
            });

            await Promise.all(startPromises);
            logger.info('Finished starting all existing sessions');
        } catch (error) {
            logger.error('Error starting all sessions', error);
        }
    }

    async startClient(sessionId, userId) {
        let clientInfo;

        try {
            clientInfo = await this.getClient(sessionId, userId);
        } catch (error) {
            logger.error(`Error getting client ${sessionId}`, error);
            return { sessionId, isRunning: false, error: error.message };
        }

        if (clientInfo.isRunning) {
            logger.info(`Client ${sessionId} is already running`);
            return { sessionId, isRunning: true, status: clientInfo.status };
        }

        try {
            const client = new WhatsAppClient({
                ...clientInfo.status,
                sessionId,
            });
            client.initialize();
            this.clients.set(sessionId, client);

            /*
            // Update session data in Firebase
            await this.saveSessionToFirebase({
                ...clientInfo.status,
                connectionState: 'connected',
            });

            */

            // Set up event listeners
            client.on('status_update', (status) => {
                this.emit('status_update', {
                    id: sessionId,
                    data: status,
                    timestamp: new Date().toISOString(),
                });
            });

            client.on('info', (info) => {
                this.emit('info', { sessionId, info });
            });

            logger.info(`Successfully started client ${sessionId}`);
            return {
                id: sessionId,
                isRunning: true,
                status: client.getStatus(),
                timestamp: new Date().toISOString(),
            };
        } catch (error) {
            logger.error(`Error initializing client ${sessionId}`, error);
            return { sessionId, isRunning: false, error: error.message };
        }
    }

    async stopClient(sessionId, userId) {
        const clientInfo = await this.getClient(sessionId, userId);

        if (!clientInfo.isRunning) {
            throw new Error(`Client ${sessionId} is not running`);
        }

        await clientInfo.client.destroy();
        this.clients.delete(sessionId);

        // Update session data in Firebase
        const sessionData = await this.getSessionFromFirebase(sessionId);

        /*
        await this.saveSessionToFirebase({
            ...sessionData,
            connectionState: 'disconnected',
        });
        */

        return {
            id: sessionId,
            isRunning: false,
            status: sessionData,
            timestamp: new Date().toISOString(),
        };
    }

    async removeClient(sessionId, userId) {
        const clientInfo = await this.getClient(sessionId, userId);

        if (clientInfo.isRunning) {
            // Stop the client if it's running
            await this.stopClient(sessionId, userId);
        }

        // Remove the session from Firebase
        await this.removeSessionFromFirebase(sessionId);

        return { sessionId, removed: true };
    }

    async getClient(sessionId, userId) {
        let client = this.clients.get(sessionId);

        if (client) {
            // Client is running
            return {
                isRunning: true,
                client: client,
                status: client.getStatus(),
            };
        } else {
            // Client is not running, check if it exists in Firebase
            const sessionData = await this.getSessionFromFirebase(sessionId);

            if (sessionData && sessionData.userId === userId) {
                // Session exists but client is not running
                return {
                    isRunning: false,
                    client: null,
                    status: sessionData,
                };
            } else {
                // Session doesn't exist or user is not authorized
                throw new Error(
                    `Client with session ID ${sessionId} not found or unauthorized`
                );
            }
        }
    }

    async getAllChats(sessionId, userId) {
        const clientInfo = await this.getClient(sessionId, userId);
        if (!clientInfo.isRunning) {
            throw new Error(`Client ${sessionId} is not running`);
        }
        return await clientInfo.client.getAllChats();
    }

    async getMessages(sessionId, userId, chatId, limit) {
        const clientInfo = await this.getClient(sessionId, userId);
        if (!clientInfo.isRunning) {
            throw new Error(`Client ${sessionId} is not running`);
        }
        return await clientInfo.client.getMessages(chatId, limit);
    }

    async getAllClientsForUser(userId) {
        const sessions = await this.getAllSessionsFromFirebase(userId);

        return Promise.all(
            sessions.map(async (session) => {
                const sessionId = session.id;
                const sessionData = session.data();
                const isRunning = this.clients.has(sessionId);

                let status;
                if (isRunning) {
                    const runningClient = this.clients.get(sessionId);
                    status = runningClient.getStatus();
                } else {
                    status = sessionData;
                }

                return {
                    id: sessionId,
                    isRunning,
                    data: status,
                    timestamp: new Date().toISOString(),
                };
            })
        );
    }

    async saveSessionToFirebase(sessionData) {
        try {
            await db
                .collection('whatsapp_sessions')
                .doc(sessionData.sessionId)
                .set(sessionData.toJSON());
            logger.info(`Session ${sessionData.sessionId} saved to Firebase`);
        } catch (error) {
            logger.error(
                `Error saving session ${sessionData.sessionId} to Firebase`,
                error
            );
        }
    }

    async getSessionFromFirebase(sessionId) {
        try {
            const doc = await db
                .collection('whatsapp_sessions')
                .doc(sessionId)
                .get();
            if (doc.exists) {
                logger.info(`Session ${sessionId} retrieved from Firebase`);
                return new SessionData(doc.data());
            } else {
                logger.info(`Session ${sessionId} not found in Firebase`);
                return null;
            }
        } catch (error) {
            logger.error(
                `Error retrieving session ${sessionId} from Firebase`,
                error
            );
            return null;
        }
    }

    async removeSessionFromFirebase(sessionId) {
        try {
            await db.collection('whatsapp_sessions').doc(sessionId).delete();
            logger.info(`Session ${sessionId} removed from Firebase`);
        } catch (error) {
            logger.error(
                `Error removing session ${sessionId} from Firebase`,
                error
            );
        }
    }

    async getAllSessionsFromFirebase(userId) {
        try {
            const snapshot = await db
                .collection('whatsapp_sessions')
                .where('userId', '==', userId)
                .get();
            logger.info(
                `All sessions for user ${userId} retrieved from Firebase`
            );
            return snapshot.docs;
        } catch (error) {
            logger.error(
                `Error retrieving all sessions for user ${userId} from Firebase`,
                error
            );
            return [];
        }
    }
}

// Create and export a single instance
const clientManagerInstance = new ClientManager();
module.exports = clientManagerInstance;
