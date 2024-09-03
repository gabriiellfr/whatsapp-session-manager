const express = require('express');
const http = require('http');
const cors = require('cors');

const clientRoutes = require('./api/routes/clientRoutes');

const setupWebSocket = require('./websocket/socketHandler');

const clientManager = require('./services/clientManager');
const logger = require('./utils/logger');

const app = express();
const server = http.createServer(app);

app.use(express.json());

app.use(
    cors({
        origin: 'http://localhost:3000', // Replace with your frontend domain
        methods: ['GET', 'POST', 'DELETE'], // Allowed methods
        allowedHeaders: ['Content-Type', 'Authorization'], // Allowed headers
    })
);

// API routes
app.use('/api', clientRoutes);

// WebSocket setup
setupWebSocket(server);

const PORT = process.env.PORT || 3002;

function startServer() {
    try {
        server.listen(PORT, async () => {
            console.log('+---------------------------------------+');
            console.log('|                                       |');
            console.log('|             WhatsApp MGMT             |');
            console.log(`|   🚀 Server ready at localhost:${PORT}   |`);
            console.log('|                                       |');
            console.log('\x1b[37m+---------------------------------------+');

            // Start all existing sessions
            await clientManager.startAllSessions();
        });
    } catch (error) {
        logger.error('Failed to start server', error);
        process.exit(1);
    }
}

startServer();
