const jwt = require('jsonwebtoken');

const isAuthenticated = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        if (req.path.startsWith('/api/')) {
            return res.status(401).json({ error: 'Unauthorized: No token provided' });
        }
        return res.redirect('/admin-login.html');
    }

    jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', (err, user) => {
        if (err) {
            if (req.path.startsWith('/api/')) {
                return res.status(403).json({ error: 'Forbidden: Invalid token' });
            }
            return res.redirect('/admin-login.html');
        }
        req.user = user;
        next();
    });
};

module.exports = { isAuthenticated };

