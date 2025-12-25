require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const helmet = require('helmet');
const db = require('./database');
const { sendEmail } = require('./utils/emailService');
const { apiLimiter, formLimiter, uploadLimiter } = require('./middleware/rateLimiter');
const {
    contactValidation,
    applicationValidation,
    postValidation,
    jobValidation,
    handleValidationErrors
} = require('./middleware/validation');
const { isAuthenticated } = require('./middleware/auth');
const logger = require('./utils/logger');

const app = express();
const PORT = process.env.PORT || 5000;

// Render trust proxy
app.set('trust proxy', 1);

// Middleware Imports
const authRoutes = require('./routes/auth');
const apiRoutes = require('./routes/api');

// Request Logging Middleware
app.use((req, res, next) => {
    logger.info(`${req.method} ${req.url}`);
    next();
});

// Security Middleware
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com", "https://fonts.googleapis.com"],
            fontSrc: ["'self'", "https://cdnjs.cloudflare.com", "https://fonts.gstatic.com"],
            imgSrc: ["'self'", "data:", "https://cdnjs.cloudflare.com"]
        }
    },
    crossOriginEmbedderPolicy: false
}));

// Body Parser Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS Middleware
const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:5000',
    'http://localhost:5500', // Live Server
    'http://127.0.0.1:5500',
    'https://technex-solutions.netlify.app' // Replace with your actual Netlify URL
];

app.use(cors({
    origin: function (origin, callback) {
        // allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) === -1) {
            var msg = 'The CORS policy for this site does not allow access from the specified Origin.';
            return callback(new Error(msg), false);
        }
        return callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Auth Routes
app.use('/api/auth', authRoutes);
app.use('/api', apiRoutes);

// Static Files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/admin', express.static(path.join(__dirname, 'admin')));

// Error handling middleware
app.use((err, req, res, next) => {
    logger.error('Server error:', err);

    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ error: 'File size too large. Maximum size is 5MB.' });
        }
        return res.status(400).json({ error: err.message });
    }

    res.status(500).json({ error: err.message || 'Internal server error' });
});

// Start server
app.listen(PORT, () => {
    logger.info('='.repeat(50));
    logger.info(`🚀 TechNex Server running on port ${PORT}`);
    logger.info(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
    logger.info(`🗄️  Database: MySQL (Railway/Local)`);
    logger.info('='.repeat(50));
});

