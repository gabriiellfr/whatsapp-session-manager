const winston = require('winston');
const path = require('path');
const fs = require('fs');

// Create the logs directory if it doesn't exist
const logDir = path.join(__dirname, '../', '../', 'logs');

if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir);
}

const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp({
            format: () => {
                const now = new Date();
                return `${now.getDate().toString().padStart(2, '0')}-${(
                    now.getMonth() + 1
                )
                    .toString()
                    .padStart(2, '0')}-${now.getFullYear()} ${now
                    .getHours()
                    .toString()
                    .padStart(2, '0')}:${now
                    .getMinutes()
                    .toString()
                    .padStart(2, '0')}:${now
                    .getSeconds()
                    .toString()
                    .padStart(2, '0')}`;
            },
        }),
        winston.format.printf(({ level, message, timestamp }) => {
            return `[${timestamp}] [${level}]: ${message}`;
        }),
    ),
    transports: [
        new winston.transports.Console(),
        new winston.transports.File({
            filename: path.join(logDir, 'whatsapp-backend.log'),
        }),
    ],
});

module.exports = logger;
