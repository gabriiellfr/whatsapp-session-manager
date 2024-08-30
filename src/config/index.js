const config = {
    port: process.env.PORT || 3000,
    allowedOrigins: process.env.CORS_ALLOWED_ORIGINS || '',
    environment: process.env.NODE_ENV || 'development',
    logLevel: process.env.LOG_LEVEL || 'info',
    maxSessions: parseInt(process.env.MAX_SESSIONS) || 100,
    jwtSecret: process.env.JWT_SECRET || 'your-secret-key',
};

module.exports = config;
