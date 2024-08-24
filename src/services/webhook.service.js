const { httpService } = require('./http.service');

async function sendEvent(sessionId, type, data) {
    try {
        await httpService.post(`/${sessionId}/${type}`, data);
    } catch (error) {
        console.error(
            `Failed to send message to backend for session ${sessionId}:`,
        );
        throw error;
    }
}

module.exports = {
    sendEvent,
};
