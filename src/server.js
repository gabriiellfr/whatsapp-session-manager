const httpServer = require('./providers/express');

const { port } = require('./config');

const startServer = async () => {
    httpServer.listen(port, () => {
        console.log('+---------------------------------------+');
        console.log('|                                       |');
        console.log('|             WhatsApp MGMT             |');
        console.log(`|   🚀 Server ready at localhost:${port}   |`);
        console.log('|                                       |');
        console.log('\x1b[37m+---------------------------------------+');
    });
};

startServer().catch((err) => {
    console.log(err);
});
