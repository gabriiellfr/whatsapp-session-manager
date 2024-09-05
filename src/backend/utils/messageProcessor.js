const processedMessages = new Set();
const MESSAGE_RETENTION_TIME = 60000; // 1 minute in milliseconds

export function processMessage(message) {
    if (processedMessages.has(message.id.id)) {
        return null;
    }

    processedMessages.add(message.id.id);
    setTimeout(
        () => processedMessages.delete(message.id.id),
        MESSAGE_RETENTION_TIME
    );

    return message;
}

// Set up periodic cleanup
setInterval(() => {
    const cutoffTime = Date.now() - MESSAGE_RETENTION_TIME;
    processedMessages.forEach((id) => {
        if (id < cutoffTime) {
            processedMessages.delete(id);
        }
    });
}, MESSAGE_RETENTION_TIME);
