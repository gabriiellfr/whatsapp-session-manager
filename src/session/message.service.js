const { sendMessageToBackend } = require('./api.service');

async function handleIncomingMessage(sessionId, data) {
    try {
        await sendMessageToBackend(sessionId, data);
    } catch (error) {
        console.error(
            `Error in handleIncomingMessage for session ${sessionId}`,
        );
        throw error;
    }
}

module.exports = {
    handleIncomingMessage,
};
