
document.addEventListener('DOMContentLoaded', () => {
    // 1. Create the Toggle Button
    const toggleBtn = document.createElement('button');
    toggleBtn.className = 'admin-mobile-toggle';
    toggleBtn.innerHTML = '<i class="fas fa-bars"></i>';
    toggleBtn.setAttribute('aria-label', 'Toggle Sidebar');
    document.body.appendChild(toggleBtn);

    // 2. Select Sidebar
    const sidebar = document.querySelector('.sidebar');
    const overlay = document.createElement('div');
    overlay.className = 'sidebar-overlay'; // For clicking outside to close

    // Add overlay styles dynamically or assume in CSS? 
    // Let's add basic inline style for overlay to be safe if not in CSS
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.background = 'rgba(0,0,0,0.5)';
    overlay.style.zIndex = '999'; // Below sidebar (1000)
    overlay.style.display = 'none';
    overlay.style.opacity = '0';
    overlay.style.transition = 'opacity 0.3s ease';
    document.body.appendChild(overlay);

    // 3. Toggle Logic
    toggleBtn.addEventListener('click', () => {
        const isActive = sidebar.classList.contains('active');
        if (isActive) {
            closeSidebar();
        } else {
            openSidebar();
        }
    });

    overlay.addEventListener('click', closeSidebar);

    function openSidebar() {
        sidebar.classList.add('active');
        overlay.style.display = 'block';
        requestAnimationFrame(() => {
            overlay.style.opacity = '1';
        });
        toggleBtn.innerHTML = '<i class="fas fa-times"></i>'; // Change to X
    }

    function closeSidebar() {
        sidebar.classList.remove('active');
        overlay.style.opacity = '0';
        setTimeout(() => {
            overlay.style.display = 'none';
        }, 300);
        toggleBtn.innerHTML = '<i class="fas fa-bars"></i>'; // Back to bars
    }

    // 4. Close on Nav Item Click (Optional, if single page app behavior desired, 
    // but these are likely separate pages. If separate, no need. 
    // But admin-dashboard might load dynamic content. 
    // The previous analysis said it fetches content. 
    // However, navigation links usually reload. 
    // Let's check sidebar-nav links in JS/HTML.)
});
