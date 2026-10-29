import { qs, qsa, on } from '../utils/dom';

const CATEGORY_MAP: Record<
    string,
    { en: { desktop: string; mobile: string }; sv: { desktop: string; mobile: string } }
> = {
    all: {
        en: { desktop: 'All', mobile: 'All' },
        sv: { desktop: 'Alla', mobile: 'Alla' }
    },
    ai: {
        en: { desktop: 'AI & Machine Learning', mobile: 'AI & ML' },
        sv: { desktop: 'AI & Maskininlärning', mobile: 'AI & ML' }
    },
    web: {
        en: { desktop: 'Web Development', mobile: 'Web' },
        sv: { desktop: 'Webbutveckling', mobile: 'Webb' }
    }
};

export function updateSearchLocalization(lang?: string): void {
    const searchInput = qs('#project-search-input') as HTMLInputElement | null;
    if (!searchInput) return;

    const currentLang = lang ?? (document.documentElement.lang || 'en');

    const isSv = currentLang === 'sv';

    searchInput.placeholder = isSv ? 'Sök projekt' : 'Search projects';
    searchInput.setAttribute('aria-label', isSv ? 'Sök projekt på nyckelord' : 'Search projects by keyword');
}

export function initProjectFilter(): void {
    const filterDropdown = qs('.filter-dropdown');
    const filterButtons = qsa('.filter-btn');
    const searchInput = qs('#project-search-input') as HTMLInputElement | null;
    const cards = qsa('.app-card');

    // 1. Initialize search placeholder & listen for language toggles
    updateSearchLocalization();
    window.addEventListener('site:languagechange', (e: Event) => {
        const custom = e as CustomEvent<{ lang: 'en' | 'sv' }>;
        updateSearchLocalization(custom.detail.lang);
    });

    const applyFilters = (): void => {
        const query = searchInput?.value.toLowerCase().trim() ?? '';
        const activeFilter = qs('.filter-btn.active')?.getAttribute('data-filter') ?? 'all';

        cards.forEach(card => {
            const category = card.getAttribute('data-category') ?? '';
            const title = card.querySelector('h3')?.textContent?.toLowerCase() ?? '';
            const desc = card.querySelector('p')?.textContent?.toLowerCase() ?? '';
            const matchesCategory = activeFilter === 'all' || category === activeFilter;
            const matchesQuery = query === '' || title.includes(query) || desc.includes(query);

            card.style.display = matchesCategory && matchesQuery ? 'flex' : 'none';
        });
    };

    // 2. Search input filtering
    if (searchInput) {
        on(searchInput, 'input', applyFilters);
    }

    // 3. Category button selection
    if (filterButtons.length > 0) {
        filterButtons.forEach(button => {
            on(button, 'click', () => {
                filterButtons.forEach(btn => {
                    btn.classList.remove('active');
                });
                button.classList.add('active');

                const filterValue = button.getAttribute('data-filter') ?? 'all';
                const category = CATEGORY_MAP[filterValue] ?? CATEGORY_MAP.all;
                const filterSelected = qs('.filter-selected');

                if (filterSelected) {
                    filterSelected.innerHTML = `
                        <span lang="en">
                            <span class="filter-label-desktop">${category.en.desktop}</span>
                            <span class="filter-label-mobile">${category.en.mobile}</span>
                        </span>
                        <span lang="sv">
                            <span class="filter-label-desktop">${category.sv.desktop}</span>
                            <span class="filter-label-mobile">${category.sv.mobile}</span>
                        </span>
                    `;
                }

                if ('startViewTransition' in document) {
                    document.startViewTransition(() => {
                        applyFilters();
                    });
                } else {
                    applyFilters();
                }

                filterDropdown?.classList.remove('menu-open');
                qs('#active-filter-label')?.setAttribute('aria-expanded', 'false');
            });
        });
    }

    updateCategoryCounts();
}

function updateCategoryCounts(): void {
    const allCards = qsa('.app-card');
    const filterBtns = qsa('.filter-btn');

    filterBtns.forEach(btn => {
        const category = btn.getAttribute('data-filter') ?? 'all';
        const countSpan = qs('.filter-count', btn);
        if (!countSpan) return;

        const count = category === 'all' ? allCards.length : qsa(`.app-card[data-category="${category}"]`).length;
        countSpan.textContent = `(${count.toString()})`;
    });
}
