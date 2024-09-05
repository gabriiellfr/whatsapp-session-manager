import express from 'express';
import { createServer } from 'http';
import WebSocket from 'ws';
import path from 'path';

import apiRoutes from './routes/apiRoutes.js';
import setupWebSocket from './socket/wsHandler.js';
import { initializeServices } from './services/whatsAppService.js';
import setupLivereloadMiddleware from './middlewares/livereloadMiddleware.js';

async function createServerFn() {
    const app = express();
    const server = createServer(app);
    const wss = new WebSocket.Server({ server });
    const port = 3002;

    const __dirname = path.resolve();

    // Middleware
    app.use(express.static('public'));
    app.use(express.urlencoded({ extended: true }));
    app.use(express.json());

    if (process.env.NODE_ENV === 'development') {
        await setupLivereloadMiddleware(app);
    }

    // Initialize services
    const { whatsAppClient, autoFlowService } = await initializeServices();

    // Set up WebSocket routes
    setupWebSocket(wss, whatsAppClient, autoFlowService);

    // Set up API routes
    app.use('/api', apiRoutes(whatsAppClient, autoFlowService));

    // Serve the main HTML file for all other routes
    app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, 'public', 'index.html'));
    });

    // Start the server
    server.listen(port, () => {
        console.log(`Server running at http://localhost:${port}`);
    });
}

createServerFn();
