const axiosInstance = require('axios');

const WEBHOOK_URL = process.env.WEBHOOK_URL;

const axios = axiosInstance.create({
    baseURL: WEBHOOK_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

module.exports = {
    axios,
};
