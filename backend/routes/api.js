const express = require('express');
const router = express.Router();
const db = require('../database');
const { sendEmail } = require('../utils/emailService');
const { formLimiter, uploadLimiter } = require('../middleware/rateLimiter');
const {
    contactValidation,
    applicationValidation,
    postValidation,
    jobValidation,
    handleValidationErrors
} = require('../middleware/validation');
const { isAuthenticated } = require('../middleware/auth');
const multer = require('multer');

// CSRF Token Route
router.get('/csrf-token', (req, res) => {
    res.json({ csrfToken: req.csrfToken() });
});
const path = require('path');

// Multer storage for resumes
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + '-' + file.originalname);
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        const filetypes = /pdf|doc|docx/;
        const mimetypes = /application\/pdf|application\/msword|application\/vnd.openxmlformats-officedocument.wordprocessingml.document/;
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = mimetypes.test(file.mimetype);

        if (extname && mimetype) {
            return cb(null, true);
        } else {
            cb(new Error('Only .pdf, .doc and .docx files are allowed!'));
        }
    }
});

// 1. Contact Form Submission (with validation and email)
router.post('/contact', formLimiter, contactValidation, handleValidationErrors, async (req, res) => {
    const { name, email, company, project, message } = req.body;

    try {
        // Save to database
        const result = await db.query(`
            INSERT INTO contacts (name, email, company, project, message)
            VALUES (?, ?, ?, ?, ?)
        `, [name, email, company, project, message]);

        const newId = result.rows.insertId;

        // Send email notifications (don't wait for them to complete)
        const emailData = { name, email, company, project, message };

        // Send to admin
        sendEmail('contactNotification', emailData).catch(err =>
            console.error('Failed to send admin notification:', err)
        );

        // Send confirmation to user
        sendEmail('contactConfirmation', emailData).catch(err =>
            console.error('Failed to send user confirmation:', err)
        );

        res.status(201).json({
            success: true,
            id: newId,
            message: 'Thank you for your message! We\'ll get back to you within 24 hours.'
        });
    } catch (err) {
        console.error('Contact form error:', err);
        res.status(500).json({ error: 'Failed to save contact message.' });
    }
});

// 2. Job Application Submission (with validation and email)
router.post('/apply', uploadLimiter, upload.single('resume'), applicationValidation, handleValidationErrors, async (req, res) => {
    const { job_title, name, email, portfolio, cover_letter } = req.body;
    const resume_path = req.file ? req.file.path : null;

    if (!resume_path) {
        return res.status(400).json({ error: 'Resume file is required.' });
    }

    try {
        // Save to database
        const result = await db.query(`
            INSERT INTO applications (job_title, name, email, resume_path, portfolio_url, cover_letter)
            VALUES (?, ?, ?, ?, ?, ?)
        `, [job_title, name, email, resume_path, portfolio, cover_letter]);

        const newId = result.rows.insertId;

        // Send email notifications
        const emailData = { job_title, name, email, portfolio, cover_letter };

        // Send to admin
        sendEmail('applicationNotification', emailData).catch(err =>
            console.error('Failed to send admin notification:', err)
        );

        // Send confirmation to applicant
        sendEmail('applicationConfirmation', emailData).catch(err =>
            console.error('Failed to send applicant confirmation:', err)
        );

        res.status(201).json({
            success: true,
            id: newId,
            message: 'Application submitted successfully! We\'ll review it and get back to you soon.'
        });
    } catch (err) {
        console.error('Application error:', err);
        res.status(500).json({ error: 'Failed to save application.' });
    }
});

// 3. Blog Posts API
router.get('/posts', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;

        const postsResult = await db.query('SELECT * FROM posts ORDER BY created_at DESC LIMIT ? OFFSET ?', [limit, offset]);
        const countResult = await db.query('SELECT COUNT(*) as count FROM posts');

        res.json({
            posts: postsResult.rows,
            pagination: {
                page,
                limit,
                total: parseInt(countResult.rows[0].count),
                totalPages: Math.ceil(parseInt(countResult.rows[0].count) / limit)
            }
        });
    } catch (err) {
        console.error('Fetch posts error:', err);
        res.status(500).json({ error: 'Failed to fetch posts.' });
    }
});

router.get('/posts/:slug', async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM posts WHERE slug = ?', [req.params.slug]);
        if (result.rows.length === 0) return res.status(404).json({ error: 'Post not found.' });
        res.json(result.rows[0]);
    } catch (err) {
        console.error('Fetch post error:', err);
        res.status(500).json({ error: 'Failed to fetch post.' });
    }
});

router.post('/posts', isAuthenticated, postValidation, handleValidationErrors, async (req, res) => {
    const { title, excerpt, content, author, category, icon, slug } = req.body;

    try {
        const result = await db.query(`
            INSERT INTO posts (title, excerpt, content, author, category, icon, slug)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `, [title, excerpt, content, author, category, icon, slug]);

        res.status(201).json({ success: true, id: result.rows.insertId });
    } catch (err) {
        console.error('Create post error:', err);
        if (err.code === 'ER_DUP_ENTRY') { // MySQL Unique Violation code
            res.status(400).json({ error: 'A post with this slug already exists.' });
        } else {
            res.status(500).json({ error: 'Failed to save post.' });
        }
    }
});

// 4. Job Listings API
router.get('/jobs', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;

        const jobsResult = await db.query('SELECT * FROM jobs ORDER BY created_at DESC LIMIT ? OFFSET ?', [limit, offset]);
        const countResult = await db.query('SELECT COUNT(*) as count FROM jobs');

        res.json({
            jobs: jobsResult.rows,
            pagination: {
                page,
                limit,
                total: parseInt(countResult.rows[0].count),
                totalPages: Math.ceil(parseInt(countResult.rows[0].count) / limit)
            }
        });
    } catch (err) {
        console.error('Fetch jobs error:', err);
        res.status(500).json({ error: 'Failed to fetch jobs.' });
    }
});

router.post('/jobs', isAuthenticated, jobValidation, handleValidationErrors, async (req, res) => {
    const { title, tag, location, type, description } = req.body;

    try {
        const result = await db.query(`
            INSERT INTO jobs (title, tag, location, type, description)
            VALUES (?, ?, ?, ?, ?)
        `, [title, tag, location, type, description]);

        res.status(201).json({ success: true, id: result.rows.insertId });
    } catch (err) {
        console.error('Create job error:', err);
        res.status(500).json({ error: 'Failed to save job.' });
    }
});

// 6. Admin Routes
// Get all contacts
router.get('/admin/contacts', isAuthenticated, async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM contacts ORDER BY created_at DESC');
        res.json(result.rows);
    } catch (err) {
        console.error('Fetch contacts error:', err);
        res.status(500).json({ error: 'Failed to fetch contacts.' });
    }
});

// Get all applications
router.get('/admin/applications', isAuthenticated, async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM applications ORDER BY created_at DESC');
        res.json(result.rows);
    } catch (err) {
        console.error('Fetch applications error:', err);
        res.status(500).json({ error: 'Failed to fetch applications.' });
    }
});

// Delete post
router.delete('/posts/:id', isAuthenticated, async (req, res) => {
    try {
        const result = await db.query('DELETE FROM posts WHERE id = ?', [req.params.id]);
        if (result.rowCount === 0) return res.status(404).json({ error: 'Post not found.' });
        res.json({ success: true });
    } catch (err) {
        console.error('Delete post error:', err);
        res.status(500).json({ error: 'Failed to delete post.' });
    }
});

// Delete job
router.delete('/jobs/:id', isAuthenticated, async (req, res) => {
    try {
        const result = await db.query('DELETE FROM jobs WHERE id = ?', [req.params.id]);
        if (result.rowCount === 0) return res.status(404).json({ error: 'Job not found.' });
        res.json({ success: true });
    } catch (err) {
        console.error('Delete job error:', err);
        res.status(500).json({ error: 'Failed to delete job.' });
    }
});

// 5. Health Check
router.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        message: 'TechNex Backend is running',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
    });
});

module.exports = router;