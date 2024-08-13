const { httpService } = require('../services/http.service');

async function sendMessageToBackend(sessionId, data) {
    try {
        await httpService.post(`/${sessionId}`, data);
    } catch (error) {
        console.error(
            `Failed to send message to backend for session ${sessionId}:`,
        );
        throw error;
    }
}

async function sendStatusToBackend(sessionId, status) {
    try {
        await httpService.post(`/${sessionId}/status`, status);
    } catch (error) {
        console.error(
            `Failed to send message to backend for session ${sessionId}:`,
        );
        throw error;
    }
}

module.exports = {
    sendMessageToBackend,
    sendStatusToBackend,
};
