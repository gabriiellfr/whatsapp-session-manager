const { spawn } = require('child_process');
const path = require('path');

let childProcesses = []; // Array to keep track of child processes

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

        childProcesses.push(service); // Add the child process to the list

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

// Function to handle termination signals and kill all child processes
const handleTermination = (signal) => {
    console.log(`Received ${signal}. Terminating all child processes...`);
    childProcesses.forEach((child) => {
        child.kill(signal); // Send termination signal to all child processes
    });
    process.exit(); // Exit the parent process
};

// Listen for termination signals
process.on('SIGINT', () => handleTermination('SIGINT'));
process.on('SIGTERM', () => handleTermination('SIGTERM'));
process.on('SIGQUIT', () => handleTermination('SIGQUIT'));

module.exports = {
    startWhatsAppMicroservice,
};
