const rateLimit = require('express-rate-limit');

// General API rate limiter
const apiLimiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // Limit each IP to 100 requests per windowMs
    message: {
        error: 'Too many requests from this IP, please try again later.',
        retryAfter: '15 minutes'
    },
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Strict rate limiter for form submissions
const formLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Limit each IP to 5 form submissions per windowMs
    message: {
        error: 'Too many form submissions. Please try again in 15 minutes.',
        retryAfter: '15 minutes'
    },
    skipSuccessfulRequests: false,
});

// Very strict rate limiter for file uploads
const uploadLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3, // Limit each IP to 3 uploads per hour
    message: {
        error: 'Too many file uploads. Please try again in 1 hour.',
        retryAfter: '1 hour'
    },
});

module.exports = {
    apiLimiter,
    formLimiter,
    uploadLimiter
};
