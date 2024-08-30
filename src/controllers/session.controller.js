const sessionService = require('../services/session.service');

const startSession = async (req, res) => {
    const { sessionId } = req.body;

    if (!sessionId) {
        return res.status(400).json({ error: 'Session ID is required' });
    }

    try {
        const result = await sessionService.startSession(sessionId);

        res.status(200).json(result);
    } catch (error) {
        res.status(500).json(error);
    }
};

const stopSession = async (req, res) => {
    const { sessionId } = req.body;

    if (!sessionId) {
        return res.status(400).json({ error: 'Session ID is required' });
    }

    try {
        const result = await sessionService.stopSession(sessionId);

        res.status(200).json(result);
    } catch (error) {
        res.status(500).json(error);
    }
};

const sendSession = async (req, res) => {
    const { sessionId, type, data } = req.body;

    try {
        const result = await sessionService.sendSessions(sessionId, type, data);

        res.status(200).send(result);
    } catch (error) {
        res.status(500).json(error);
    }
};

const listSessions = async (req, res) => {
    const sessions = await sessionService.listSessions();

    res.status(200).json(sessions);
};

module.exports = {
    startSession,
    stopSession,
    sendSession,
    listSessions,
};
