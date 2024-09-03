// src/models/SessionData.js
const { v4: uuidv4 } = require('uuid');

class SessionData {
    constructor(config = {}) {
        this.sessionId = config.sessionId || uuidv4();
        this.createdAt = config.createdAt || Date.now();
        this.updatedAt = config.updatedAt || Date.now();
        this.userId = config.userId;
    }

    update(newData) {
        Object.assign(this, newData);
        this.updatedAt = Date.now();
    }

    toJSON() {
        return {
            sessionId: this.sessionId,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
            userId: this.userId,
        };
    }
}

module.exports = SessionData;
