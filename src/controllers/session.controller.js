const sessionService = require('../services/session.service');

const startSession = async (req, res) => {
    const { sessionId } = req.body;

    if (!sessionId)
        return res.status(400).json({ error: 'Session ID is required' });

    try {
        await sessionService.startSession(sessionId);
        res.status(200).json({
            message: `WhatsApp session ${sessionId} started successfully.`,
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const stopSession = async (req, res) => {
    const { sessionId } = req.body;

    if (!sessionId) {
        return res.status(400).json({ error: 'Session ID is required' });
    }

    try {
        await sessionService.stopSession(sessionId);
        res.status(200).json({
            message: `WhatsApp session ${sessionId} stopped successfully.`,
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const listSessions = async (req, res) => {
    const sessions = await sessionService.listSessions();

    res.status(200).json(sessions);
};

module.exports = {
    startSession,
    stopSession,
    listSessions,
};
