const { body, validationResult } = require('express-validator');

// Validation rules for contact form
const contactValidation = [
    body('name')
        .trim()
        .notEmpty().withMessage('Name is required')
        .isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters')
        .matches(/^[a-zA-Z\s\-']+$/).withMessage('Name can only contain letters, spaces, hyphens and apostrophes'),

    body('email')
        .trim()
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Please provide a valid email address')
        .normalizeEmail(),

    body('company')
        .optional()
        .trim()
        .isLength({ max: 100 }).withMessage('Company name must be less than 100 characters'),

    body('project')
        .optional()
        .trim()
        .isLength({ max: 200 }).withMessage('Project type must be less than 200 characters'),

    body('message')
        .trim()
        .notEmpty().withMessage('Message is required')
        .isLength({ min: 10, max: 2000 }).withMessage('Message must be between 10 and 2000 characters')
];

// Validation rules for job application
const applicationValidation = [
    body('job_title')
        .trim()
        .notEmpty().withMessage('Job title is required')
        .isLength({ max: 200 }).withMessage('Job title is too long'),

    body('name')
        .trim()
        .notEmpty().withMessage('Name is required')
        .isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters')
        .matches(/^[a-zA-Z\s\-']+$/).withMessage('Name can only contain letters, spaces, hyphens and apostrophes'),

    body('email')
        .trim()
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Please provide a valid email address')
        .normalizeEmail(),

    body('portfolio')
        .optional()
        .trim()
        .isURL().withMessage('Please provide a valid URL for portfolio'),

    body('cover_letter')
        .optional()
        .trim()
        .isLength({ max: 5000 }).withMessage('Cover letter is too long')
];

// Validation rules for blog post
const postValidation = [
    body('title')
        .trim()
        .notEmpty().withMessage('Title is required')
        .isLength({ min: 5, max: 200 }).withMessage('Title must be between 5 and 200 characters'),

    body('excerpt')
        .trim()
        .notEmpty().withMessage('Excerpt is required')
        .isLength({ min: 10, max: 500 }).withMessage('Excerpt must be between 10 and 500 characters'),

    body('content')
        .trim()
        .notEmpty().withMessage('Content is required')
        .isLength({ min: 50 }).withMessage('Content must be at least 50 characters'),

    body('author')
        .trim()
        .notEmpty().withMessage('Author is required')
        .isLength({ max: 100 }).withMessage('Author name is too long'),

    body('category')
        .trim()
        .notEmpty().withMessage('Category is required')
        .isLength({ max: 50 }).withMessage('Category is too long'),

    body('icon')
        .trim()
        .notEmpty().withMessage('Icon is required')
        .matches(/^fa-[a-z-]+$/).withMessage('Invalid icon format'),

    body('slug')
        .trim()
        .notEmpty().withMessage('Slug is required')
        .matches(/^[a-z0-9-]+$/).withMessage('Slug can only contain lowercase letters, numbers, and hyphens')
        .isLength({ max: 200 }).withMessage('Slug is too long')
];

// Validation rules for job listing
const jobValidation = [
    body('title')
        .trim()
        .notEmpty().withMessage('Title is required')
        .isLength({ min: 5, max: 200 }).withMessage('Title must be between 5 and 200 characters'),

    body('tag')
        .trim()
        .notEmpty().withMessage('Tag is required')
        .isIn(['Engineering', 'Design', 'Marketing', 'Sales', 'Operations', 'Other'])
        .withMessage('Invalid tag'),

    body('location')
        .trim()
        .notEmpty().withMessage('Location is required')
        .isLength({ max: 100 }).withMessage('Location is too long'),

    body('type')
        .trim()
        .notEmpty().withMessage('Type is required')
        .isIn(['Full-time', 'Part-time', 'Contract', 'Remote', 'Hybrid'])
        .withMessage('Invalid job type'),

    body('description')
        .trim()
        .notEmpty().withMessage('Description is required')
        .isLength({ min: 20, max: 2000 }).withMessage('Description must be between 20 and 2000 characters')
];

// Middleware to handle validation errors
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.error('Validation Errors:', JSON.stringify(errors.array(), null, 2));
        return res.status(400).json({
            error: 'Validation failed',
            details: errors.array().map(err => ({
                field: err.path,
                message: err.msg
            })),
            msg: errors.array().map(err => err.msg).join('; ')
        });
    }
    next();
};

module.exports = {
    contactValidation,
    applicationValidation,
    postValidation,
    jobValidation,
    handleValidationErrors
};
