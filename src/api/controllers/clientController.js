// src/api/controllers/clientController.js

const clientManager = require('../../services/clientManager');
const logger = require('../../utils/logger');

exports.createClient = async (req, res, next) => {
    try {
        const { config } = req.body;
        const clientInfo = await clientManager.createClient(
            config,
            req.user.uid
        );

        res.status(201).json(clientInfo);
    } catch (error) {
        next(error);
    }
};

exports.getClientStatus = async (req, res, next) => {
    try {
        const { sessionId } = req.params;
        const clientInfo = await clientManager.getClient(
            sessionId,
            req.user.uid
        );
        res.json({
            sessionId,
            isRunning: clientInfo.isRunning,
            status: clientInfo.status,
        });
    } catch (error) {
        next(error);
    }
};

exports.startClient = async (req, res, next) => {
    try {
        const { sessionId } = req.params;
        const result = await clientManager.startClient(sessionId, req.user.uid);
        res.json(result);
    } catch (error) {
        logger.error('Error starting client', error);
        next(error);
    }
};

exports.stopClient = async (req, res, next) => {
    try {
        const { sessionId } = req.params;
        const result = await clientManager.stopClient(sessionId, req.user.uid);
        res.json(result);
    } catch (error) {
        logger.error('Error stopping client', error);
        next(error);
    }
};

exports.removeClient = async (req, res, next) => {
    try {
        const { sessionId } = req.params;
        const result = await clientManager.removeClient(
            sessionId,
            req.user.uid
        );
        res.json(result);
    } catch (error) {
        logger.error('Error removing client', error);
        next(error);
    }
};

exports.getAllChats = async (req, res, next) => {
    try {
        const { sessionId } = req.params;
        const chats = await clientManager.getAllChats(sessionId, req.user.uid);
        res.json(chats);
    } catch (error) {
        logger.error('Error getting all chats', error);
        next(error);
    }
};

exports.getMessages = async (req, res, next) => {
    try {
        const { sessionId, chatId } = req.params;
        const { limit } = req.query;
        const messages = await clientManager.getMessages(
            sessionId,
            req.user.uid,
            chatId,
            limit ? parseInt(limit) : undefined
        );
        res.json(messages);
    } catch (error) {
        logger.error('Error getting messages', error);
        next(error);
    }
};

exports.getAllClients = async (req, res, next) => {
    try {
        const clients = await clientManager.getAllClientsForUser(req.user.uid);
        res.json(clients);
    } catch (error) {
        next(error);
    }
};
