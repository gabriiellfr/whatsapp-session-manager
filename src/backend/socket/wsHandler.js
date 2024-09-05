import WebSocket from 'ws';
import { processMessage } from '../utils/messageProcessor.js';

export default function setupWebSocket(wss, whatsAppClient, autoFlowService) {
    wss.on('connection', (ws) => {
        console.log('Client connected');

        // Send initial status
        if (whatsAppClient) {
            ws.send(
                JSON.stringify({
                    type: 'status',
                    data: whatsAppClient.getStatus(),
                })
            );
        }

        // Clean up event listeners when the WebSocket connection closes
        ws.on('close', () => {
            console.log('Client disconnected');
        });
    });

    // Event handlers
    const statusUpdateHandler = (status) => {
        broadcastToClients({ type: 'status', data: status });
    };

    const infoHandler = (info) => {
        broadcastToClients({ type: 'info', data: info });
    };

    const errorHandler = (error) => {
        broadcastToClients({ type: 'error', data: error });
    };

    const incomingMessageHandler = (message) => {
        if (message.from !== 'status@broadcast' && message.body !== '') {
            const processedMessage = processMessage(message);
            if (processedMessage) {
                broadcastToClients({
                    type: 'incoming_message',
                    data: processedMessage,
                });
                autoFlowService.handleIncomingMessage(processedMessage);
            }
        }
    };

    const messageCreateHandler = (message) => {
        if (message.from !== 'status@broadcast' && message.body !== '') {
            broadcastToClients({
                type: 'incoming_message',
                data: message,
            });
        } else if (message.from === 'status@broadcast') {
            console.log(message, '******status@broadcast******');
        }
    };

    // Attach event listeners
    whatsAppClient.on('status_update', statusUpdateHandler);
    whatsAppClient.on('info', infoHandler);
    whatsAppClient.on('error', errorHandler);
    whatsAppClient.on('incoming_message', incomingMessageHandler);
    whatsAppClient.on('message_create', messageCreateHandler);

    function broadcastToClients(data) {
        wss.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify(data));
            }
        });
    }

    // Return a function to remove event listeners
    return function cleanup() {
        whatsAppClient.off('status_update', statusUpdateHandler);
        whatsAppClient.off('info', infoHandler);
        whatsAppClient.off('error', errorHandler);
        whatsAppClient.off('incoming_message', incomingMessageHandler);
        whatsAppClient.off('message_create', messageCreateHandler);
    };
}
