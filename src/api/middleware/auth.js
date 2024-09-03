// src/middleware/auth.js
const { admin } = require('../../config/firebase');

const authenticateToken = async (req, res, next) => {
    const authHeader = req.headers['authorization'];

    let token;

    if (authHeader) {
        if (authHeader.startsWith('Bearer ')) {
            token = authHeader.split(' ')[1];
        } else {
            token = authHeader;
        }
    }

    if (!token)
        return res
            .status(401)
            .json({ error: 'No authentication token provided' });

    try {
        const decodedToken = await admin.auth().verifyIdToken(token);
        req.user = decodedToken;
        next();
    } catch (error) {
        res.status(403).json({ error });
    }
};

module.exports = authenticateToken;
