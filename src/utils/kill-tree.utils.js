const kill = require('tree-kill');

function isProcessRunning(pid) {
    try {
        process.kill(pid, 0);
        return true;
    } catch (error) {
        return error;
    }
}

const killTree = (pid, signal = 'SIGTERM') => {
    return new Promise((resolve, reject) => {
        kill(pid, signal, (err) => {
            if (err) {
                reject(
                    new Error(`Error stopping process ${pid}: ${err.message}`)
                );
                return;
            }

            const checkProcess = () => {
                if (!isProcessRunning(pid)) {
                    resolve(`Process ${pid} successfully killed.`);
                } else {
                    // Recursively call killTree until the process is confirmed dead
                    killTree(pid, signal).then(resolve).catch(reject);
                }
            };

            setTimeout(checkProcess, 100);
        });
    });
};

module.exports = killTree;
