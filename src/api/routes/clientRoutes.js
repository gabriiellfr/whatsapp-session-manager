// src/api/routes/clientRoutes.js
const express = require('express');
const clientController = require('../controllers/clientController');
const authenticateToken = require('../middleware/auth');

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

// Client management routes
router.post('/clients', clientController.createClient);
router.get('/clients', clientController.getAllClients);
router.get('/clients/:sessionId', clientController.getClientStatus);
router.post('/clients/:sessionId/start', clientController.startClient);
router.post('/clients/:sessionId/stop', clientController.stopClient);
router.delete('/clients/:sessionId', clientController.removeClient);

// Chats route
router.get('/clients/:sessionId/chats', clientController.getAllChats);
router.get(
    '/clients/:sessionId/chats/:chatId/messages',
    clientController.getMessages
);

module.exports = router;
