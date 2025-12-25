const nodemailer = require('nodemailer');
require('dotenv').config();

// Check if credentials are placeholders or empty
const isEmailConfigured =
    process.env.EMAIL_USER &&
    process.env.EMAIL_USER !== 'your-email@gmail.com' &&
    process.env.EMAIL_PASSWORD &&
    process.env.EMAIL_PASSWORD !== 'your-app-password';

let transporter;

if (isEmailConfigured) {
    // Create transporter only if configured
    transporter = nodemailer.createTransport({
        service: process.env.EMAIL_SERVICE || 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD
        }
    });

    // Verify connection
    transporter.verify((error, success) => {
        if (error) {
            console.error('❌ Email service error:', error.message);
            console.log('⚠️  Email features will be disabled. Configure .env with valid credentials.');
            transporter = null; // Disable if verification fails
        } else {
            console.log('✅ Email service ready');
        }
    });
} else {
    console.log('⚠️  Email service not configured (using mock mode). Set EMAIL_USER and EMAIL_PASSWORD in .env to enable.');
}

// Email templates
const emailTemplates = {
    // Contact form notification to admin
    contactNotification: (data) => ({
        from: process.env.EMAIL_USER,
        to: process.env.ADMIN_EMAIL,
        subject: `New Contact Form Submission - ${data.name}`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #000000;">New Contact Form Submission</h2>
                <div style="background: #f4f4f5; padding: 20px; border-radius: 10px; margin: 20px 0;">
                    <p><strong>Name:</strong> ${data.name}</p>
                    <p><strong>Email:</strong> ${data.email}</p>
                    <p><strong>Company:</strong> ${data.company || 'Not provided'}</p>
                    <p><strong>Project Type:</strong> ${data.project || 'Not provided'}</p>
                    <p><strong>Message:</strong></p>
                    <p style="white-space: pre-wrap;">${data.message}</p>
                </div>
                <p style="color: #71717a; font-size: 14px;">Submitted at: ${new Date().toLocaleString()}</p>
            </div>
        `
    }),

    // Contact form confirmation to user
    contactConfirmation: (data) => ({
        from: process.env.EMAIL_USER,
        to: data.email,
        subject: 'Thank you for contacting TechNex Solutions',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #000000;">Thank You for Reaching Out!</h2>
                <p>Hi ${data.name},</p>
                <p>We've received your message and our team will get back to you within 24 hours.</p>
                <div style="background: #f4f4f5; padding: 20px; border-radius: 10px; margin: 20px 0;">
                    <p><strong>Your message:</strong></p>
                    <p style="white-space: pre-wrap;">${data.message}</p>
                </div>
                <p>Best regards,<br><strong>TechNex Solutions Team</strong></p>
                <hr style="border: none; border-top: 1px solid #e4e4e7; margin: 20px 0;">
                <p style="color: #71717a; font-size: 12px;">
                    TechNex Solutions<br>
                    Email: hellotechnex.21@gmail.com<br>
                    Phone: +92 328 9461384
                </p>
            </div>
        `
    }),

    // Job application notification to admin
    applicationNotification: (data) => ({
        from: process.env.EMAIL_USER,
        to: process.env.ADMIN_EMAIL,
        subject: `New Job Application - ${data.job_title}`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #000000;">New Job Application</h2>
                <div style="background: #f4f4f5; padding: 20px; border-radius: 10px; margin: 20px 0;">
                    <p><strong>Position:</strong> ${data.job_title}</p>
                    <p><strong>Name:</strong> ${data.name}</p>
                    <p><strong>Email:</strong> ${data.email}</p>
                    <p><strong>Portfolio:</strong> ${data.portfolio || 'Not provided'}</p>
                    <p><strong>Cover Letter:</strong></p>
                    <p style="white-space: pre-wrap;">${data.cover_letter || 'Not provided'}</p>
                    <p><strong>Resume:</strong> Attached to application (check database)</p>
                </div>
                <p style="color: #71717a; font-size: 14px;">Submitted at: ${new Date().toLocaleString()}</p>
            </div>
        `
    }),

    // Job application confirmation to user
    applicationConfirmation: (data) => ({
        from: process.env.EMAIL_USER,
        to: data.email,
        subject: `Application Received - ${data.job_title}`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #000000;">Application Received!</h2>
                <p>Hi ${data.name},</p>
                <p>Thank you for applying for the <strong>${data.job_title}</strong> position at TechNex Solutions.</p>
                <p>We've received your application and our hiring team will review it carefully. If your qualifications match our requirements, we'll reach out to schedule an interview.</p>
                <div style="background: #f4f4f5; padding: 20px; border-radius: 10px; margin: 20px 0;">
                    <p><strong>What's next?</strong></p>
                    <ul>
                        <li>Our team will review your application within 5-7 business days</li>
                        <li>Qualified candidates will be contacted for an initial interview</li>
                        <li>We'll keep your application on file for future opportunities</li>
                    </ul>
                </div>
                <p>Best of luck!</p>
                <p><strong>TechNex Solutions Hiring Team</strong></p>
                <hr style="border: none; border-top: 1px solid #e4e4e7; margin: 20px 0;">
                <p style="color: #71717a; font-size: 12px;">
                    TechNex Solutions<br>
                    Email: hellotechnex.21@gmail.com<br>
                    Phone: +92 328 9461384
                </p>
            </div>
        `
    })
};

// Send email function
const sendEmail = async (type, data) => {
    if (!transporter) {
        console.log(`⚠️  [MOCK EMAIL] To: ${data.email || 'Admin'} | Subject: ${emailTemplates[type](data).subject}`);
        return { success: true, messageId: 'mock-id' };
    }

    try {
        const emailOptions = emailTemplates[type](data);
        const info = await transporter.sendMail(emailOptions);
        console.log(`✅ Email sent: ${type} to ${emailOptions.to}`);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error(`❌ Email error (${type}):`, error.message);
        return { success: false, error: error.message };
    }
};

module.exports = {
    sendEmail,
    transporter
};
