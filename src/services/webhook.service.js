const { httpService } = require('./http.service');

async function sendEvent(type, data) {
    try {
        await httpService.post(`/${data.sessionId}/${type}`, data);
    } catch (error) {
        throw new Error(error);
    }
}

module.exports = {
    sendEvent,
};
