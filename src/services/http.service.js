const { axios } = require('../providers/axios');

const handleResponse = (promise) => {
    return promise
        .then((response) => {
            return { data: response.data, status: response.status };
        })
        .catch((error) => {
            if (error.response) {
                // Handle known response errors
                return Promise.reject({
                    data: error.response.data,
                    status: error.response.status,
                    headers: error.response.headers,
                });
            } else if (error.request) {
                return Promise.reject(
                    new Error('No response received from server.'),
                );
            } else {
                return Promise.reject(new Error(error.message));
            }
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
