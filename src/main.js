document.addEventListener('DOMContentLoaded', () => {
    // 1. Projects Filtering
    const filterButtons = document.querySelectorAll('.filter-btn');
    const cards = document.querySelectorAll('.app-card');

    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');

            const filterValue = button.getAttribute('data-filter');

            cards.forEach(card => {
                const cardCategory = card.getAttribute('data-category');
                if (filterValue === 'all' || cardCategory === filterValue) {
                    card.style.display = 'flex';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    });

    // Dynamic collapsible Bio Toggle
    const bioToggle = document.querySelector('.bio-toggle');
    const bioExpandable = document.querySelector('.bio-expandable');

    if (bioToggle && bioExpandable) {
        bioToggle.addEventListener('click', () => {
            const isExpanded = bioExpandable.classList.toggle('is-expanded');

            // Update accessibility attributes & text
            bioToggle.setAttribute('aria-expanded', isExpanded);
            bioToggle.textContent = isExpanded ? '[Read less]' : '[Read more]';
        });
    }

    // 2. 3D Tilt & Mouse Tracking Spotlight Effect
    const container = document.querySelector('.profile-card-container');
    const card = document.querySelector('.profile-card-inner');
    const spotlight = document.querySelector('.spotlight');

    if (container && card) {
        container.addEventListener('mousemove', (e) => {
            const rect = container.getBoundingClientRect();

            // Cursor position inside the element bounds
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            // Percentage boundaries relative to center coords
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            // Limits tilting rotation to a soft 12 degrees
            const rotateX = -((y - centerY) / centerY) * 12;
            const rotateY = ((x - centerX) / centerX) * 12;

            // Apply 3D matrix transforms
            card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.03)`;
            card.style.boxShadow = 'rgba(255, 255, 255, 0.08) 0px 15px 35px 0px';

            // Dynamically center radial spotlight directly underneath cursor
            if (spotlight) {
                spotlight.style.opacity = '1';
                spotlight.style.background = `radial-gradient(circle at ${x}px ${y}px, rgba(255, 255, 255, 0.18), transparent 55%)`;
            }
        });

        // Spring back gracefully on mouse leave
        container.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(800px) rotateX(0deg) rotateY(0deg) scale(1)';
            card.style.boxShadow = 'rgba(0, 0, 0, 0.29) 0px 4px 25px 0px';

            if (spotlight) {
                spotlight.style.opacity = '0';
            }
        });
    }

    // 3. Dynamic Font Switching Logic
    const fontButtons = document.querySelectorAll('.font-btn');

    fontButtons.forEach(button => {
        button.addEventListener('click', () => {
            fontButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');

            const fontSelection = button.getAttribute('data-font');
            let cssVariableValue = 'var(--font-default)';

            if (fontSelection === 'serif') {
                cssVariableValue = 'var(--font-serif)';
            } else if (fontSelection === 'monospace') {
                cssVariableValue = 'var(--font-mono)';
            }

            // Update CSS custom variable on document root element
            document.documentElement.style.setProperty('--font-stack', cssVariableValue);
        });
    });
});