

// Custom Cursor
const cursor = document.querySelector('.custom-cursor');

if (cursor) {
    document.addEventListener('mousemove', (e) => {
        cursor.style.left = e.clientX + 'px';
        cursor.style.top = e.clientY + 'px';
    });

    document.addEventListener('mousedown', () => {
        cursor.style.transform = 'scale(0.8)';
    });

    document.addEventListener('mouseup', () => {
        cursor.style.transform = 'scale(1)';
    });

    // Add hover effect to interactive elements
    const interactiveElements = document.querySelectorAll('a, button, .service-card, .portfolio-item, .team-card');
    interactiveElements.forEach(el => {
        el.addEventListener('mouseenter', () => {
            cursor.classList.add('hover');
        });
        el.addEventListener('mouseleave', () => {
            cursor.classList.remove('hover');
        });
    });
}

// Mobile Menu Toggle
const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
const navLinks = document.querySelector('.nav-links');

if (mobileMenuToggle && navLinks) {
    mobileMenuToggle.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        const icon = mobileMenuToggle.querySelector('i');
        icon.classList.toggle('fa-bars');
        icon.classList.toggle('fa-xmark');
    });

    // Close menu when a link is clicked
    navLinks.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('active');
            const icon = mobileMenuToggle.querySelector('i');
            icon.classList.add('fa-bars');
            icon.classList.remove('fa-xmark');
        });
    });
}

// Scroll Animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

window.observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, observerOptions);

document.querySelectorAll('.fade-in').forEach(el => {
    observer.observe(el);
});

// Smooth Scrolling
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (href === '#') return;

        const target = document.querySelector(href);
        if (target) {
            e.preventDefault();
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Blog Cards Clickable - Handled by blog_loader.js
// Removed redundant event listener to prevent conflicts

// Make Portfolio Items Clickable (Fallback to Contact)
const portfolioItems = document.querySelectorAll('.portfolio-item');
portfolioItems.forEach(item => {
    item.addEventListener('click', () => {
        const contactSection = document.querySelector('#contact');
        if (contactSection) {
            contactSection.scrollIntoView({ behavior: 'smooth' });
        }
    });
});

// Navbar Background on Scroll
window.addEventListener('scroll', () => {
    const nav = document.querySelector('nav');
    if (window.scrollY > 100) {
        nav.style.background = 'rgba(10, 10, 10, 0.98)';
    } else {
        nav.style.background = 'rgba(10, 10, 10, 0.95)';
    }
});

// Form Submission
const contactForm = document.querySelector('form:not(#applicationForm)');
if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Get form data
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData);

        const submitBtn = e.target.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Sending...';
        submitBtn.disabled = true;

        try {
            // Fetch CSRF token
            const csrfResponse = await fetch(`${API_CONFIG.BASE_URL}/api/csrf-token`);
            const { csrfToken } = await csrfResponse.json();

            const response = await fetch(`${API_CONFIG.BASE_URL}/api/contact`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-Token': csrfToken
                },
                body: JSON.stringify(data),
            });

            const result = await response.json();

            if (response.ok) {
                alert(result.message || 'Thank you for your message! We\'ll get back to you within 24 hours.');
                e.target.reset();
            } else {
                alert('Error: ' + (result.msg || result.error || 'Failed to send message.'));
            }
        } catch (error) {
            console.error('Error submitting form:', error);
            alert('Could not connect to the server. Please check if the backend is running.');
        } finally {
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    });
}

// Dynamic Statistics Animation
const animateStats = (scope = document) => {
    const stats = scope.querySelectorAll('.stat-animate'); // Target elements with specific class

    stats.forEach(stat => {
        const targetStr = stat.getAttribute('data-target');
        if (!targetStr) return;

        // Parse numeric value and suffix (e.g., "1.2M", "98%", "4.8★")
        const match = targetStr.match(/^([^0-9]*?)([0-9.]+)(.*)$/);
        if (!match) return;

        const [_, prefix, valueStr, suffix] = match;
        const targetValue = parseFloat(valueStr);
        const duration = 2000;
        const startTime = performance.now();
        const decimals = (valueStr.split('.')[1] || '').length;

        const update = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Ease out quart
            const ease = 1 - Math.pow(1 - progress, 4);
            const current = targetValue * ease;

            stat.textContent = `${prefix}${current.toFixed(decimals)}${suffix}`;

            if (progress < 1) {
                requestAnimationFrame(update);
            } else {
                stat.textContent = targetStr; // Ensure clean final value
            }
        };

        requestAnimationFrame(update);
    });
};

// Trigger stats animation when SaaS section is visible
const saasSection = document.querySelector('.saas-showcase');
if (saasSection) {
    const saasObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateStats(entry.target);
                saasObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });
    saasObserver.observe(saasSection);
}

// Application Modal Logic
const modal = document.getElementById('applicationModal');
const applyButtons = document.querySelectorAll('.apply-btn');
const closeButton = document.querySelector('.modal-close');
const applicationForm = document.getElementById('applicationForm');
const modalJobTitle = document.getElementById('modalJobTitle');
const jobTitleInput = document.getElementById('jobTitleInput');
const fileInput = document.getElementById('applicantResume');

if (modal) {
    // Open Modal
    applyButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const jobTitle = btn.getAttribute('data-job');
            modalJobTitle.textContent = jobTitle;
            jobTitleInput.value = jobTitle;
            modal.classList.add('active');
            document.body.style.overflow = 'hidden'; // Prevent background scrolling
        });
    });

    // Close Modal Function
    const closeModal = () => {
        modal.classList.remove('active');
        document.body.style.overflow = '';
        setTimeout(() => {
            applicationForm.reset();
            // Reset file upload visual
            const fileVisual = document.querySelector('.file-upload-visual span');
            if (fileVisual) fileVisual.textContent = 'Click to upload or drag and drop';
        }, 300);
    };

    // Close Events
    if (closeButton) {
        closeButton.addEventListener('click', closeModal);
    }

    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });

    // File Input Change
    if (fileInput) {
        fileInput.addEventListener('change', (e) => {
            const fileName = e.target.files[0]?.name;
            const fileVisual = document.querySelector('.file-upload-visual span');
            if (fileName && fileVisual) {
                fileVisual.textContent = `Selected: ${fileName}`;
            }
        });
    }

    // Form Submission
    if (applicationForm) {
        applicationForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const formData = new FormData(e.target);
            const submitBtn = applicationForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;

            submitBtn.textContent = 'Sending...';
            submitBtn.disabled = true;

            try {
                // Fetch CSRF token
                const csrfResponse = await fetch(`${API_CONFIG.BASE_URL}/api/csrf-token`);
                const { csrfToken } = await csrfResponse.json();

                const response = await fetch(`${API_CONFIG.BASE_URL}/api/apply`, {
                    method: 'POST',
                    headers: {
                        'X-CSRF-Token': csrfToken
                    },
                    body: formData, // FormData automatically handles multipart/form-data for files
                });

                const result = await response.json();

                if (response.ok) {
                    alert(result.message || 'Application submitted successfully!');
                    closeModal();
                } else {
                    alert('Error: ' + (result.msg || result.error || 'Failed to submit application.'));
                }
            } catch (error) {
                console.error('Error submitting application:', error);
                alert('Could not connect to the server. Please check if the backend is running.');
            } finally {
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            }
        });
    }
}

// Add dynamic gradient to cards on hover
const serviceCards = document.querySelectorAll('.service-card');
serviceCards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;

        card.style.background = `radial-gradient(circle at ${x}% ${y}%, rgba(255, 255, 255, 0.1) 0%, var(--bg-secondary) 50%)`;
    });

    card.addEventListener('mouseleave', () => {
        card.style.background = 'var(--bg-secondary)';
    });
});

// FAQ Accordion Logic
const faqItems = document.querySelectorAll('.faq-item');
faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    question.addEventListener('click', () => {
        // Close other items
        faqItems.forEach(otherItem => {
            if (otherItem !== item) {
                otherItem.classList.remove('active');
            }
        });

        // Toggle current item
        item.classList.toggle('active');
    });
});

// Parallax effect for hero section
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const heroVisual = document.querySelector('.hero-visual');
    if (heroVisual) {
        heroVisual.style.transform = `translateY(${scrolled * 0.5}px)`;
    }
});

console.log('🚀 TechNex Solutions - Professional IT Services Agency Website Loaded Successfully!');
console.log('📧 Contact us at: hello@technex.com');
console.log('🌐 Ready to transform your digital presence!');
