const axiosInstance = require('axios');

const { webHookURL } = require('../../config');

const axios = axiosInstance.create({
    baseURL: webHookURL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

module.exports = {
    axios,
};
