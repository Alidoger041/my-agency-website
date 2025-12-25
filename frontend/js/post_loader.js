async function loadPost() {
    const postContainer = document.querySelector('.post-container');
    if (!postContainer) return;

    const urlParams = new URLSearchParams(window.location.search);
    const slug = urlParams.get('slug');

    if (!slug) {
        window.location.href = 'blog.html';
        return;
    }

    if (window.location.protocol === 'file:') {
        postContainer.innerHTML = '<p style="text-align: center; grid-column: 1/-1; color: #f59e0b; background: #fffbeb; padding: 1rem; border-radius: 8px; border: 1px solid #fcd34d; margin-top: 4rem;"><b>CORS Restriction:</b> Browsers block data fetching when opening files directly via "file://". Please use a local web server to view the dynamic content.</p>';
        return;
    }

    try {
        const response = await fetch(`${API_CONFIG.BASE_URL}/api/posts/${slug}`);
        if (!response.ok) throw new Error('Post not found');

        const post = await response.json();

        // Update Page Title
        document.title = `${post.title} - TechNex Blog`;

        // Update Header
        const header = postContainer.querySelector('.post-header');
        header.innerHTML = `
            <div class="fade-in visible">
                <h1>${post.title}</h1>
                <div class="post-meta">
                    <span><i class="fa-solid fa-calendar"></i> ${new Date(post.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    <span><i class="fa-solid fa-user"></i> ${post.author}</span>
                    <span><i class="fa-solid fa-tag"></i> ${post.category}</span>
                </div>
            </div>
        `;

        // Update Image
        const imageDiv = postContainer.querySelector('.post-image');
        imageDiv.innerHTML = `<i class="fa-solid ${post.icon || 'fa-newspaper'}"></i>`;
        imageDiv.classList.add('visible');

        // Update Content
        const contentDiv = postContainer.querySelector('.post-content');
        // If content is just text, wrap it or handle basic markdown-like structure
        // For now, we assume post.content might have some HTML or just text
        contentDiv.innerHTML = post.content.split('\n\n').map(p => `<p>${p}</p>`).join('');
        contentDiv.classList.add('visible');

        // Re-initialize intersection observer for new elements
        if (window.observer) {
            postContainer.querySelectorAll('.fade-in').forEach(el => {
                window.observer.observe(el);
            });
        }

    } catch (err) {
        console.error('Error loading post:', err);
        postContainer.innerHTML = `
            <div style="text-align: center; padding: 4rem 0;">
                <h1 style="font-size: 3rem; margin-bottom: 1rem;">404</h1>
                <p style="color: var(--text-secondary); margin-bottom: 2rem;">Oops! The article you're looking for doesn't exist.</p>
                <a href="blog.html" class="cta-button">Back to Blog</a>
            </div>
        `;
    }
}

document.addEventListener('DOMContentLoaded', loadPost);
