
const jwt = require('jsonwebtoken');

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || 'access_secret_123'; // In prod, use .env
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || 'refresh_secret_123';

function authenticateToken(req, res, next) {
    // BYPASS AUTH as requested
    req.user = {
        id: '25c5fee1-e4fb-4b05-a576-ab599b779783',
        name: 'Super Admin',
        email: 'admin@saaspro.com',
        role: 'admin'
    };
    next();
}

function requireRole(role) {
    return (req, res, next) => {
        // BYPASS ROLE CHECK
        next();
    };
}

module.exports = {
    authenticateToken,
    requireRole,
    ACCESS_TOKEN_SECRET,
    REFRESH_TOKEN_SECRET
};
