async function loadJobs(page = 1) {
    const jobGrid = document.querySelector('.job-grid');
    if (!jobGrid) return;

    if (window.location.protocol === 'file:') {
        jobGrid.innerHTML = '<p style="text-align: center; grid-column: 1/-1; color: #f59e0b; background: #fffbeb; padding: 1rem; border-radius: 8px; border: 1px solid #fcd34d;"><b>CORS Restriction:</b> Browsers block data fetching when opening files directly via "file://". Please use a local web server (like VS Code Live Server) to view the dynamic content.</p>';
        return;
    }

    try {
        const response = await fetch(`${API_CONFIG.BASE_URL}/api/jobs?page=${page}&limit=6`);
        const data = await response.json();

        const jobs = data.jobs || data;

        if (jobs.length === 0 && page === 1) {
            jobGrid.innerHTML = '<p style="text-align: center; grid-column: 1/-1; color: var(--text-secondary);">No open positions at the moment. Check back soon!</p>';
            return;
        }

        jobGrid.innerHTML = jobs.map(job => `
            <div class="job-card fade-in">
                <span class="job-tag">${job.tag}</span>
                <h3 class="job-title">${job.title}</h3>
                <div class="job-meta">
                    <span><i class="fa-solid fa-location-dot"></i> ${job.location}</span>
                    <span><i class="fa-solid fa-clock"></i> ${job.type}</span>
                </div>
                <p style="color: var(--text-secondary); margin-bottom: 2rem;">${job.description}</p>
                <button class="apply-btn" data-job="${job.title}">Apply Now</button>
            </div>
        `).join('');

        // Render Pagination
        renderPagination(data.pagination, jobGrid, loadJobs);

        // Re-initialize intersection observer
        if (window.observer) {
            jobGrid.querySelectorAll('.fade-in').forEach(el => {
                window.observer.observe(el);
            });
        }

        // Re-bind Apply Button Events
        jobGrid.querySelectorAll('.apply-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const jobTitle = btn.getAttribute('data-job');
                const modal = document.getElementById('applicationModal');
                const modalJobTitle = document.getElementById('modalJobTitle');
                const jobTitleInput = document.getElementById('jobTitleInput');

                if (modal && modalJobTitle && jobTitleInput) {
                    modalJobTitle.textContent = jobTitle;
                    jobTitleInput.value = jobTitle;
                    modal.classList.add('active');
                    document.body.style.overflow = 'hidden';
                }
            });
        });

    } catch (err) {
        console.error('Error loading jobs:', err);
        jobGrid.innerHTML = `<p style="text-align: center; grid-column: 1/-1; color: #ef4444;">Could not load job positions. <br><small>Make sure the backend server is running.</small></p>`;
    }
}

function renderPagination(pagination, container, loadFunction) {
    if (!pagination || pagination.totalPages <= 1) {
        const existingNav = document.querySelector('.pagination-nav');
        if (existingNav) existingNav.remove();
        return;
    }

    let nav = document.querySelector('.pagination-nav');
    if (!nav) {
        nav = document.createElement('nav');
        nav.className = 'pagination-nav';
        nav.style.gridColumn = '1/-1';
        nav.style.display = 'flex';
        nav.style.justifyContent = 'center';
        nav.style.gap = '0.5rem';
        nav.style.marginTop = '2rem';
        container.parentNode.insertBefore(nav, container.nextSibling);
    }
    nav.innerHTML = '';

    const prevBtn = document.createElement('button');
    prevBtn.innerHTML = '<i class="fas fa-chevron-left"></i>';
    prevBtn.className = 'btn-primary'; // Using existing class mostly for style
    prevBtn.style.padding = '0.5rem 1rem';
    prevBtn.style.background = '#2563eb';
    prevBtn.style.color = 'white';
    prevBtn.style.border = 'none';
    prevBtn.style.borderRadius = '0.5rem';
    prevBtn.style.cursor = 'pointer';
    prevBtn.disabled = pagination.page === 1;
    if (prevBtn.disabled) prevBtn.style.opacity = '0.5';
    prevBtn.onclick = () => loadFunction(pagination.page - 1);
    nav.appendChild(prevBtn);

    const info = document.createElement('span');
    info.textContent = `Page ${pagination.page} of ${pagination.totalPages}`;
    info.style.alignSelf = 'center';
    nav.appendChild(info);

    const nextBtn = document.createElement('button');
    nextBtn.innerHTML = '<i class="fas fa-chevron-right"></i>';
    nextBtn.className = 'btn-primary';
    nextBtn.style.padding = '0.5rem 1rem';
    nextBtn.style.background = '#2563eb';
    nextBtn.style.color = 'white';
    nextBtn.style.border = 'none';
    nextBtn.style.borderRadius = '0.5rem';
    nextBtn.style.cursor = 'pointer';
    nextBtn.disabled = pagination.page === pagination.totalPages;
    if (nextBtn.disabled) nextBtn.style.opacity = '0.5';
    nextBtn.onclick = () => loadFunction(pagination.page + 1);
    nav.appendChild(nextBtn);
}

document.addEventListener('DOMContentLoaded', () => loadJobs(1));
