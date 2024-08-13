const axiosInstance = require('axios');

const axios = axiosInstance.create({
    baseURL: 'http://localhost:3000/webhook',
    timeout: 5000,
    headers: {
        'Content-Type': 'application/json',
    },
});

module.exports = {
    axios,
};
