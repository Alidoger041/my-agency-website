// Auth Check
async function checkAuth() {
    const token = localStorage.getItem('adminToken');
    if (!token) {
        window.location.href = 'admin-login.html';
        return;
    }

    try {
        const response = await fetch(`${API_CONFIG.BASE_URL}/api/auth/check`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        const data = await response.json();
        if (!data.authenticated) {
            localStorage.removeItem('adminToken');
            window.location.href = 'admin-login.html';
        } else {
            document.body.style.display = 'flex'; // Show content after auth check
            if (document.getElementById('admin-username')) {
                document.getElementById('admin-username').textContent = data.username;
            }
        }
    } catch (err) {
        window.location.href = 'admin-login.html';
    }
}

// Check auth immediately
checkAuth();

// Logout
document.getElementById('logoutBtn')?.addEventListener('click', async () => {
    try {
        const token = localStorage.getItem('adminToken');
        await fetch(`${API_CONFIG.BASE_URL}/api/auth/logout`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        localStorage.removeItem('adminToken');
        window.location.href = 'admin-login.html';
    } catch (err) {
        console.error('Logout failed:', err);
        localStorage.removeItem('adminToken');
        window.location.href = 'admin-login.html';
    }
});

// Update global fetch to include token for all admin requests
const originalFetch = window.fetch;
window.fetch = async (...args) => {
    const [resource, config = {}] = args;
    const token = localStorage.getItem('adminToken');

    if (token && resource.toString().includes('/api/')) {
        config.headers = {
            ...config.headers,
            'Authorization': `Bearer ${token}`
        };
    }
    return originalFetch(resource, config);
};


// Render Sidebar
function renderSidebar(activePage) {
    const navItems = [
        { name: 'Dashboard', icon: 'fa-home', href: 'admin-dashboard.html' },
        { name: 'Blog Posts', icon: 'fa-newspaper', href: 'admin-posts.html' },
        { name: 'Job Listings', icon: 'fa-briefcase', href: 'admin-jobs.html' },
        { name: 'Applications', icon: 'fa-file-alt', href: 'admin-applications.html' },
        { name: 'Messages', icon: 'fa-envelope', href: 'admin-contacts.html' },
    ];

    const navContainer = document.querySelector('.sidebar-nav');
    if (!navContainer) return;

    navContainer.innerHTML = navItems.map(item => `
        <a href="${item.href}" class="nav-item ${activePage === item.href ? 'active' : ''}">
            <i class="fas ${item.icon}"></i>
            ${item.name}
        </a>
    `).join('');
}

// Utils
function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function showModal(modalId) {
    document.getElementById(modalId).classList.add('active');
}

function hideModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
}
