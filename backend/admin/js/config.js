// TechNex Frontend Configuration
const API_CONFIG = {
    // Replace this with your Render.com URL after deployment
    // e.g., 'https://technex-backend.onrender.com'
    BASE_URL: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
        ? '' // Same origin locally
        : 'https://technex-backend.onrender.com' // Replace with your actual Render URL
};

// Export configuration
if (typeof module !== 'undefined' && module.exports) {
    module.exports = API_CONFIG;
}
