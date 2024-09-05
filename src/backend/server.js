import express from 'express';
import { createServer } from 'http';
import WebSocket from 'ws';
import path from 'path';

import WhatsAppClient from './whatsappClient.js';
import { AutoFlowService } from './autoFlowService.js';

async function createServerFn() {
    const app = express();
    const server = createServer(app);
    const wss = new WebSocket.Server({ server });
    const port = 3002;

    const __dirname = path.resolve();

    // Serve static files from the 'public' directory
    app.use(express.static('public'));

    app.use(express.urlencoded({ extended: true }));
    app.use(express.json());

    if (process.env.NODE_ENV === 'development') {
        const livereload = (await import('livereload')).default;
        const connectLivereload = (await import('connect-livereload')).default;

        const liveReloadServer = livereload.createServer();
        liveReloadServer.watch('public');
        app.use(connectLivereload());

        liveReloadServer.server.once('connection', () => {
            setTimeout(() => {
                liveReloadServer.refresh('/');
            }, 100);
        });
    }

    // Initialize WhatsAppClient and AutoFlowService
    const whatsAppClient = new WhatsAppClient();
    const autoFlowService = new AutoFlowService(whatsAppClient);
    await autoFlowService.initialize();

    // Add a Set to store recently processed message IDs
    const processedMessages = new Set();
    const MESSAGE_RETENTION_TIME = 60000; // 1 minute in milliseconds

    // Function to clean up old message IDs
    function cleanupOldMessages() {
        const cutoffTime = Date.now() - MESSAGE_RETENTION_TIME;
        processedMessages.forEach(([id, timestamp]) => {
            if (timestamp < cutoffTime) {
                processedMessages.delete(id);
            }
        });
    }

    // Set up periodic cleanup
    setInterval(cleanupOldMessages, MESSAGE_RETENTION_TIME);

    // WebSocket connection handler
    wss.on('connection', (ws) => {
        console.log('Client connected');

        // Send initial status
        ws.send(
            JSON.stringify({ type: 'status', data: whatsAppClient.getStatus() })
        );

        // Listen for WhatsAppClient events and send updates to the client
        const statusUpdateHandler = (status) => {
            console.log(status);
            ws.send(JSON.stringify({ type: 'status', data: status }));
        };

        const infoHandler = (info) => {
            ws.send(JSON.stringify({ type: 'info', data: info }));
        };

        const errorHandler = (error) => {
            ws.send(JSON.stringify({ type: 'error', data: error }));
        };

        const incomingMessageHandler = (message) => {
            console.log('incomingMessageHandler', message.from, message.body);

            if (message.from !== 'status@broadcast' && message.body !== '') {
                if (processedMessages.has(message.id.id)) return;

                processedMessages.add(message.id.id);

                ws.send(
                    JSON.stringify({ type: 'incoming_message', data: message })
                );

                autoFlowService.handleIncomingMessage(message);
            }
        };

        const messageCreateHandler = (message) => {
            //console.log('messageCreateHandler', message.from, message.body);

            if (message.from !== 'status@broadcast' && message.body !== '') {
                ws.send(
                    JSON.stringify({ type: 'incoming_message', data: message })
                );
            } else if (message.from === 'status@broadcast') {
                console.log(message, '******status@broadcast******');
            }
        };

        whatsAppClient.on('status_update', statusUpdateHandler);
        whatsAppClient.on('info', infoHandler);
        whatsAppClient.on('error', errorHandler);
        whatsAppClient.on('incoming_message', incomingMessageHandler);
        whatsAppClient.on('message_create', messageCreateHandler);

        // Clean up event listeners when the WebSocket connection closes
        ws.on('close', () => {
            console.log('Client disconnected');
            whatsAppClient.off('status_update', statusUpdateHandler);
            whatsAppClient.off('info', infoHandler);
        });
    });

    // API routes
    app.post('/api/start', async (req, res) => {
        await whatsAppClient.initialize();
        res.json({ message: 'Initialization started' });
    });

    app.post('/api/logout', async (req, res) => {
        await whatsAppClient.logout();
        res.json({ message: 'Client logged out' });
    });

    app.post('/api/stop', async (req, res) => {
        await whatsAppClient.destroy();
        res.json({ message: 'Client stopped' });
    });

    app.get('/api/contacts', async (req, res) => {
        const contacts = await whatsAppClient.getAllChats();
        res.json(contacts);
    });

    app.get('/api/contacts/:chatId/messages', async (req, res) => {
        const { chatId } = req.params;

        const messages = await whatsAppClient.getMessages(chatId);
        res.json(messages);
    });

    app.post('/api/sendMessage', express.json(), async (req, res) => {
        const { to, body } = req.body;
        try {
            await whatsAppClient.sendMessage({ to, body });
            res.json({ message: 'Message sent successfully' });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    // New API routes for AutoFlowService
    app.get('/api/flows', async (req, res) => {
        const flows = await autoFlowService.getFlows();

        res.json(flows);
    });

    app.post('/api/flows', async (req, res) => {
        const flow = req.body;

        try {
            await autoFlowService.addFlow(flow);
            res.json({ message: 'Flow added successfully' });
        } catch (error) {
            console.log(error);
        }
    });

    app.put('/api/flows/:id', async (req, res) => {
        const flow = req.body;

        try {
            await autoFlowService.updateFlow(flow);
            res.json({ message: 'Flow updated successfully' });
        } catch (error) {
            console.log(error);
        }
    });

    app.delete('/api/flows/:id', async (req, res) => {
        await autoFlowService.deleteFlow(req.params.id);
        res.json({ message: 'Flow deleted successfully' });
    });

    app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, 'public', 'index.html'));
    });

    server.listen(port, async () => {
        console.log(`Server running at http://localhost:${port}`);

        await whatsAppClient.initialize();
        console.log('almost ready');
    });
}

createServerFn();
