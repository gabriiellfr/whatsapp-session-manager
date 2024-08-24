const axiosInstance = require('axios');

const { webHookURL } = require('../../config');

const axios = axiosInstance.create({
    baseURL: webHookURL,
    timeout: 5000,
    headers: {
        'Content-Type': 'application/json',
    },
});

module.exports = {
    axios,
};
