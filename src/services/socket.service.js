const { Server } = require('socket.io');

let io;
const clients = new Map();

const setup = (server) => {
    io = new Server(server, {
        cors: {
            origin: '*',
            methods: ['GET', 'POST'],
        },
    });

    io.on('connection', (socket) => {
        const sessionId = socket.handshake.query.sessionId;

        console.log('Client connected', sessionId);

        if (!sessionId) {
            socket.disconnect(true);
            return;
        }

        registerClient(sessionId, socket);

        socket.on('message', (message) => {
            console.log(`Received message from client: ${message}`);
        });

        socket.on('disconnect', () => {
            console.log('Client disconnected', sessionId);
        });
    });

    console.log('Socket.IO server is ready.');
};

const sendToClient = (event, sessionId, data) => {
    try {
        const clientsForSession = clients.get(sessionId) || [];

        clientsForSession.forEach((client) => {
            client.emit(event, data);
        });

        return {
            success: true,
            message: `Message sent to sessionId ${sessionId}`,
        };
    } catch (error) {
        return {
            success: false,
            message: `Error sending message: ${error.message}`,
        };
    }
};

const registerClient = (sessionId, client) => {
    const clientsForSession = clients.get(sessionId) || [];
    clientsForSession.push(client);
    clients.set(sessionId, clientsForSession);

    client.join(sessionId); // Socket.IO automatically handles joining a "room" with the sessionId
};

module.exports = {
    setup,
    registerClient,
    sendToClient,
};
