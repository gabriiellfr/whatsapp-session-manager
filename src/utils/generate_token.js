const jwt = require('jsonwebtoken');

const JWT_SECRET = 'your-secret-key'; // In production, use a secure environment variable

// Mock JWT creation (for demonstration purposes)
function createMockJWT(userId, isAdmin) {
    return jwt.sign({ userId, isAdmin }, JWT_SECRET, { expiresIn: '1h' });
}

// Example mock JWTs
const mockAdminJWT = createMockJWT('admin123', true);
const mockUserJWT = createMockJWT('user456', false);

console.log('Mock Admin JWT:', mockAdminJWT);
console.log('Mock User JWT:', mockUserJWT);
