const dotenv = require('dotenv');

dotenv.config();

module.exports = {
    sessionId: process.env.SESSION_ID || 'default_session',
    maxRetries: process.env.MAX_RETRIES || 5,
    retryDelayMs: process.env.RETRY_DELAY_MS || 2000,
};
