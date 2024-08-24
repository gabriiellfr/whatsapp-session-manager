const express = require('express');
const http = require('http');
const cors = require('cors');

const app = express();
const httpServer = http.createServer(app);

// parse json request body
app.use(express.json());

// Parse incoming request bodies
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// enable cors
const corsOptions = {
    origin: [
        'http://localhost:3000',
        'http://localhost:3001',
        'http://localhost:3002',
    ],
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

app.post('/webhook/:sessionId/data', (req, res) => {
    const { sessionId } = req.params;
    const data = req.body;

    console.log(sessionId, data);

    res.send();
});

app.post('/webhook/:sessionId/status', (req, res) => {
    const { sessionId } = req.params;
    const status = req.body;

    console.log(sessionId, status);

    res.send();
});

httpServer.listen(3000, () => {
    console.log('+---------------------------------------+');
    console.log('|                                       |');
    console.log('|            WebHook Server             |');
    console.log(`|   🚀 Server ready at localhost:${3000}   |`);
    console.log('|                                       |');
    console.log('\x1b[37m+---------------------------------------+');
});
