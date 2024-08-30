const { axios } = require('../providers/axios');

const handleResponse = (promise) => {
    return promise
        .then(() => {
            return {
                success: true,
                message: null,
            };
        })
        .catch((error) => {
            return {
                success: false,
                message: error,
            };
        });
};

const httpService = {
    get: (url, config = {}) => {
        return handleResponse(axios.get(url, config));
    },
    post: (url, data, config = {}) => {
        return handleResponse(axios.post(url, data, config));
    },
    put: (url, data, config = {}) => {
        return handleResponse(axios.put(url, data, config));
    },
    delete: (url, config = {}) => {
        return handleResponse(axios.delete(url, config));
    },
};

module.exports = {
    httpService,
};
