async function loadBlogPosts(page = 1) {
    const blogGrid = document.querySelector('.blog-grid');
    if (!blogGrid) return;

    if (window.location.protocol === 'file:') {
        blogGrid.innerHTML = '<p style="text-align: center; grid-column: 1/-1; color: #f59e0b; background: #fffbeb; padding: 1rem; border-radius: 8px; border: 1px solid #fcd34d;"><b>CORS Restriction:</b> Browsers block data fetching when opening files directly via "file://". Please use a local web server (like VS Code Live Server) to view the dynamic content.</p>';
        return;
    }

    try {
        const response = await fetch(`${API_CONFIG.BASE_URL}/api/posts?page=${page}&limit=6`);
        const data = await response.json();

        const posts = data.posts || data;

        if (posts.length === 0 && page === 1) {
            blogGrid.innerHTML = '<p style="text-align: center; grid-column: 1/-1; color: var(--text-secondary);">No blog posts found.</p>';
            return;
        }

        blogGrid.innerHTML = posts.map(post => `
            <article class="blog-card fade-in">
                <div class="blog-image">
                    <i class="fa-solid ${post.icon || 'fa-newspaper'}"></i>
                </div>
                <div class="blog-content">
                    <div class="blog-meta">
                        <span><i class="fa-solid fa-calendar"></i> ${new Date(post.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                        <span><i class="fa-solid fa-user"></i> ${post.author}</span>
                    </div>
                    <div class="blog-meta" style="margin-top: -0.5rem; margin-bottom: 1rem;">
                        <span><i class="fa-solid fa-tag"></i> ${post.category}</span>
                    </div>
                    <h3>${post.title}</h3>
                    <p>${post.excerpt}</p>
                    <a href="post.html?slug=${post.slug}" class="read-more">Read Full Story <i class="fa-solid fa-arrow-right"></i></a>
                </div>
            </article>
        `).join('');

        // Render Pagination
        renderPagination(data.pagination, blogGrid);

        // Re-initialize intersection observer for new elements
        if (window.observer) {
            blogGrid.querySelectorAll('.fade-in').forEach(el => {
                window.observer.observe(el);
            });
        }

        // Re-bind Click Events
        blogGrid.querySelectorAll('.blog-card').forEach(card => {
            card.style.cursor = 'pointer';
            card.addEventListener('click', (e) => {
                if (e.target.tagName === 'A' || e.target.closest('a')) return;
                const link = card.querySelector('.read-more');
                if (link) window.location.href = link.href;
            });
        });

    } catch (err) {
        console.error('Error loading blog posts:', err);
        blogGrid.innerHTML = `<p style="text-align: center; grid-column: 1/-1; color: #ef4444;">Could not load blog posts. <br><small>Make sure the backend server is running.</small></p>`;
    }
}

function renderPagination(pagination, container) {
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
        container.parentNode.insertBefore(nav, container.nextSibling); // Insert after grid
    }
    nav.innerHTML = '';

    // Previous
    const prevBtn = document.createElement('button');
    prevBtn.innerHTML = '<i class="fas fa-chevron-left"></i>';
    prevBtn.className = 'btn-primary';
    prevBtn.style.padding = '0.5rem 1rem';
    prevBtn.disabled = pagination.page === 1;
    prevBtn.onclick = () => loadBlogPosts(pagination.page - 1);
    nav.appendChild(prevBtn);

    // Page Info
    const info = document.createElement('span');
    info.textContent = `Page ${pagination.page} of ${pagination.totalPages}`;
    info.style.alignSelf = 'center';
    nav.appendChild(info);

    // Next
    const nextBtn = document.createElement('button');
    nextBtn.innerHTML = '<i class="fas fa-chevron-right"></i>';
    nextBtn.className = 'btn-primary';
    nextBtn.style.padding = '0.5rem 1rem';
    nextBtn.disabled = pagination.page === pagination.totalPages;
    nextBtn.onclick = () => loadBlogPosts(pagination.page + 1);
    nav.appendChild(nextBtn);
}

document.addEventListener('DOMContentLoaded', () => loadBlogPosts(1));
