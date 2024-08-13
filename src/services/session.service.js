const { spawn } = require('child_process');
const path = require('path');

function startWhatsAppMicroservice(sessionId) {
    return new Promise((resolve, reject) => {
        const service = spawn(
            'node',
            [path.join(__dirname, '../', '/session', '/index.js')],
            {
                env: { ...process.env, SESSION_ID: sessionId },
                stdio: 'inherit', // Optional: see logs in the terminal
            },
        );

        service.on('error', (err) => {
            console.error(
                `Error starting WhatsApp microservice for session ${sessionId}:`,
                err,
            );
            reject(err);
        });

        service.on('close', (code) => {
            console.log(
                `WhatsApp microservice for session ${sessionId} exited with code ${code}`,
            );
            resolve(code);
        });
    });
}

module.exports = {
    startWhatsAppMicroservice,
};
