const { sendStatusToBackend } = require('./api.service');
const status = require('./client-status');

async function sendStatusToWebhook(sessionId) {
    try {
        const statusData = await status.getStatus();
        await sendStatusToBackend(sessionId, statusData);
    } catch (error) {
        console.error(`Error in sendStatusToWebhook for session ${sessionId}`);
        throw error;
    }
}

module.exports = {
    sendStatusToWebhook,
};
