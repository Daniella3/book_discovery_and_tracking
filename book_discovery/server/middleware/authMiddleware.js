const jwt = require('jsonwebtoken');

const SECRET = process.env.JWT_SECRET;

module.exports = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({ error: 'Authorization header missing' });
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Authorization token missing' });
    }

    try {
        const decoded = jwt.verify(token, SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            console.warn(`Expired token rejected for ${req.method} ${req.originalUrl}`);
            return res.status(401).json({ error: 'Token expired', code: 'TOKEN_EXPIRED' });
        }

        console.error('Token verification error:', error.message);
        return res.status(401).json({ error: 'Invalid token', code: 'INVALID_TOKEN' });
    }
};
