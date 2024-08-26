const express = require('express');
const http = require('http');
const cors = require('cors');
const morgan = require('morgan');

const sessionRoutes = require('../../routes/session.router');

const app = express();
const httpServer = http.createServer(app);

app.use(express.json());

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(morgan('dev'));

const corsOptions = {
    origin: ['http://localhost:3000', 'http://localhost:3001'],
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

app.use('/', sessionRoutes);

app.use('*', (req, res) => {
    return res.status(404).json({
        error: "API endpoint doesn't exist",
    });
});

module.exports = httpServer;
