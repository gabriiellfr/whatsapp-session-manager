const express = require('express');
const http = require('http');
const cors = require('cors');

const { startWhatsAppMicroservice } = require('../../services/session.service');

const app = express();
const httpServer = http.createServer(app);

// parse json request body
app.use(express.json());

// Parse incoming request bodies
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// enable cors
const corsOptions = {
    origin: ['http://localhost:3001'],
    credentials: true,
    methods: ['POST'],
    allowedHeaders: [
        'Content-Type',
        'Authorization',
        'Access-Control-Allow-Credentials',
        'Access-Control-Allow-Origin',
    ],
};

app.use(cors(corsOptions));
app.options('*', cors());

app.post('/start', (req, res) => {
    const { sessionId } = req.body;

    if (!sessionId)
        return res.status(400).json({ error: 'Session ID is required' });

    try {
        startWhatsAppMicroservice(sessionId);
        res.status(200).json({
            message: `WhatsApp session ${sessionId} started successfully.`,
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to start WhatsApp session' });
    }
});

module.exports = httpServer;
