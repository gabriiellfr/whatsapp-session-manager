const express = require('express');
const http = require('http');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const { allowedOrigins } = require('../../config');

const app = express();
const httpServer = http.createServer(app);

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(helmet());
app.use(morgan('dev'));

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
});
app.use(limiter);

const corsOptions = {
    origin: allowedOrigins.split(','),
    credentials: true,
    methods: ['GET,HEAD,PUT,PATCH,POST,DELETE'],
    allowedHeaders: [
        'Content-Type',
        'Authorization',
        'Access-Control-Allow-Credentials',
        'Access-Control-Allow-Origin',
    ],
};

app.use(cors(corsOptions));
app.options('*', cors());

app.use('*', (req, res) => {
    return res.status(404).json({
        error: "API endpoint doesn't exist",
    });
});

module.exports = httpServer;
