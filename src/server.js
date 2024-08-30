require('dotenv').config();

const httpServer = require('./providers/express');
const socket = require('./providers/socket');

const port = process.env.PORT || 3000;

const startServer = async () => {
    httpServer.listen(port, () => {
        console.log('+---------------------------------------+');
        console.log('|                                       |');
        console.log('|             WhatsApp MGMT             |');
        console.log(`|   🚀 Server ready at localhost:${port}   |`);
        console.log('|                                       |');
        console.log('\x1b[37m+---------------------------------------+');
    });

    socket.setup(httpServer);
};

startServer().catch((err) => {
    console.log(err);
});
