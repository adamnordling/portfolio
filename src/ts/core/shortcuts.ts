import { qs, qsa, on } from '../utils/dom';
import { toggleTheme } from './theme';
import { setLanguage } from './i18n';
import { openModal, closeModal, isModalOpen } from '../features/modal';

const fontTypes = ['default', 'serif', 'monospace'] as const;
let currentFontIndex = 0;
let lastFocusedElement: HTMLElement | null = null;

// Track last focused interactive element
document.addEventListener('focusin', e => {
    const target = e.target as HTMLElement | null;
    if (target && target !== document.body && !target.classList.contains('skip-link')) {
        lastFocusedElement = target;
    }
});

// Helper: Find first visible project card
function getFirstVisibleProjectCard(): HTMLElement | null {
    const cards = qsa('.app-card');
    const visible = cards.find(card => card.style.display !== 'none' && card.offsetWidth > 0);
    if (visible) return visible;
    if (cards.length > 0) return cards[0];
    return null;
}

// Helper: Focusable elements in Top Header
function getTopHeaderElements(): HTMLElement[] {
    const header = qs('.site-header');
    if (!header) return [];
    return Array.from(
        header.querySelectorAll<HTMLElement>('button:not([disabled]), [tabindex]:not([tabindex="-1"])')
    ).filter(el => !el.closest('.lang-menu'));
}

// Helper: Focusable elements in Main Portfolio Wrapper (including the Metacard)
function getMainContentElements(): HTMLElement[] {
    const wrapper = qs('.portfolio-wrapper');
    if (!wrapper) return [];
    return Array.from(
        wrapper.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])')
    ).filter(el => {
        if (
            el.closest('.profile-img-menu') &&
            !el.closest('.profile-card-inner')?.classList.contains('profile-menu-open')
        ) {
            return false;
        }
        const card = el.closest<HTMLElement>('.app-card');
        if (card && card.style.display === 'none') {
            return false;
        }
        return (
            el.offsetWidth > 0 &&
            el.offsetHeight > 0 &&
            !el.hidden &&
            window.getComputedStyle(el).visibility !== 'hidden' &&
            !el.closest('[aria-hidden="true"]')
        );
    });
}

export function initShortcuts(): void {
    const leftPanel = qs('.left-panel');
    const rightPanel = qs('.right-panel');
    let activeScrollTarget: HTMLElement | null = leftPanel;

    if (leftPanel) {
        on(leftPanel, 'mouseenter', () => {
            activeScrollTarget = leftPanel;
        });
    }
    if (rightPanel) {
        on(rightPanel, 'mouseenter', () => {
            activeScrollTarget = rightPanel;
        });
    }

    // Cached divider X position (zero reflow during mousemove)
    let cachedDividerX = window.innerWidth / 2;
    const updateDividerPos = (): void => {
        const divider = qs('.panel-divider');
        cachedDividerX = divider
            ? divider.getBoundingClientRect().left + divider.offsetWidth / 2
            : window.innerWidth / 2;
    };
    updateDividerPos();
    on(window, 'resize', updateDividerPos, { passive: true });

    on(
        window,
        'mousemove',
        (e: MouseEvent) => {
            if (window.innerWidth > 1150) {
                activeScrollTarget = e.clientX < cachedDividerX ? leftPanel : rightPanel;
            }
        },
        { passive: true }
    );

    document.addEventListener('focusin', e => {
        const target = e.target as HTMLElement | null;
        if (target && target !== document.body && !target.classList.contains('skip-link')) {
            lastFocusedElement = target;
            if (rightPanel && target.closest('.right-panel')) {
                activeScrollTarget = rightPanel;
            } else if (leftPanel && target.closest('.left-panel')) {
                activeScrollTarget = leftPanel;
            }
        }
    });

    on(document, 'keydown', (e: KeyboardEvent) => {
        const activeEl = document.activeElement as HTMLElement | null;
        const activeTag = (activeEl?.tagName || '').toUpperCase();

        if (['INPUT', 'TEXTAREA', 'SELECT'].includes(activeTag)) return;
        if (e.ctrlKey || e.metaKey || e.altKey) return;

        const key = e.key.toLowerCase();

        // 1. Modal handling
        if (isModalOpen()) {
            if (e.key === 'Escape' || key === 'c') {
                e.preventDefault();
                closeModal();
            }
            return;
        }

        // 2. Escape: closes open menus
        if (e.key === 'Escape') {
            const cardTrigger = qs('#profile-card-trigger');
            const shouldRefocusCard = cardTrigger !== null && cardTrigger.classList.contains('profile-menu-open');

            document.querySelectorAll('.menu-open, .has-bubble-open, .profile-menu-open').forEach(el => {
                el.classList.remove('menu-open', 'has-bubble-open', 'profile-menu-open');
            });

            if (shouldRefocusCard) {
                cardTrigger.focus();
            } else if (activeEl) {
                activeEl.blur();
            }
            return;
        }

        // 3. Tab Memory Restoration
        if (e.key === 'Tab' && (!activeEl || activeEl === document.body)) {
            const cardTrigger = qs('#profile-card-trigger');
            if (
                cardTrigger &&
                lastFocusedElement &&
                lastFocusedElement.closest('.profile-img-menu') &&
                !cardTrigger.classList.contains('profile-menu-open')
            ) {
                lastFocusedElement = cardTrigger;
            }

            if (lastFocusedElement && document.contains(lastFocusedElement)) {
                e.preventDefault();
                lastFocusedElement.focus();
                return;
            }
        }

        // 4. Enter on Language Button: Toggles language directly
        if ((e.key === 'Enter' || e.key === ' ') && activeEl && activeEl.classList.contains('lang-trigger')) {
            e.preventDefault();
            const currentLang = document.documentElement.lang;
            setLanguage(currentLang === 'sv' ? 'en' : 'sv');
            return;
        }

        // 5. Category Selection with Enter
        if ((e.key === 'Enter' || e.key === ' ') && activeEl && activeEl.classList.contains('filter-btn')) {
            e.preventDefault();
            activeEl.click();
            requestAnimationFrame(() => {
                const firstProject = getFirstVisibleProjectCard();
                if (firstProject) firstProject.focus();
            });
            return;
        }

        // 6. Category Navigation (Tab / Arrows)
        if (
            activeEl &&
            activeEl.classList.contains('filter-btn') &&
            (e.key === 'Tab' || e.key === 'ArrowDown' || e.key === 'ArrowUp')
        ) {
            const isForward = e.key === 'Tab' ? !e.shiftKey : e.key === 'ArrowDown';
            const filterBtns = qsa('.filter-btn');
            const currentIndex = filterBtns.indexOf(activeEl);

            if (currentIndex !== -1) {
                if (isForward) {
                    if (currentIndex < filterBtns.length - 1) {
                        e.preventDefault();
                        filterBtns[currentIndex + 1].focus();
                        return;
                    } else {
                        e.preventDefault();
                        if (!filterBtns[0].classList.contains('active')) {
                            filterBtns[0].click();
                        }
                        requestAnimationFrame(() => {
                            const firstProject = getFirstVisibleProjectCard();
                            if (firstProject) firstProject.focus();
                        });
                        return;
                    }
                } else {
                    if (currentIndex > 0) {
                        e.preventDefault();
                        filterBtns[currentIndex - 1].focus();
                        return;
                    } else {
                        e.preventDefault();
                        if (!filterBtns[0].classList.contains('active')) {
                            filterBtns[0].click();
                        }
                        const lastActivityItem = qs('.activity-feed a:last-child');
                        if (lastActivityItem) {
                            lastActivityItem.focus();
                        } else if (leftPanel) {
                            leftPanel.focus();
                        }
                        return;
                    }
                }
            }
        }

        // 7. Backward navigation from first visible project card into Category filter
        if (
            activeEl &&
            (e.key === 'ArrowUp' || (e.key === 'Tab' && e.shiftKey)) &&
            activeEl.classList.contains('app-card') &&
            activeEl === getFirstVisibleProjectCard()
        ) {
            const filterBtns = qsa('.filter-btn');
            if (filterBtns.length > 0) {
                e.preventDefault();
                const dropdown = qs('.filter-dropdown');
                if (dropdown) dropdown.classList.add('menu-open');
                filterBtns[filterBtns.length - 1].focus();
                return;
            }
        }

        // 8. Global Desktop Tab & Arrow Sequence
        if (window.innerWidth > 1150 && (e.key === 'Tab' || e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
            const isForward = e.key === 'Tab' ? !e.shiftKey : e.key === 'ArrowDown';
            const skipLink = qs('.skip-link');
            const topHeaderElements = getTopHeaderElements();
            const mainElements = getMainContentElements();

            const topCount = topHeaderElements.length;
            const mainCount = mainElements.length;

            // Profile photo menu item navigation
            if (activeEl && activeEl.closest('.profile-img-menu')) {
                const profileCard = qs('#profile-card-trigger');
                const firstContactBtn = qs('.contact-btn-1');

                if (isForward && activeEl.id === 'copy-img-link-btn') {
                    e.preventDefault();
                    if (profileCard) profileCard.classList.remove('profile-menu-open');
                    if (firstContactBtn) firstContactBtn.focus();
                    return;
                }
                if (
                    !isForward &&
                    activeEl.classList.contains('profile-menu-item') &&
                    activeEl === qs('.profile-menu-item')
                ) {
                    e.preventDefault();
                    if (profileCard) profileCard.focus();
                    return;
                }
            }

            // Scroll panel if whole panel target is focused
            if (rightPanel && activeEl === rightPanel && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
                e.preventDefault();
                rightPanel.scrollBy({ top: isForward ? 140 : -140, behavior: 'smooth' });
                return;
            }
            if (leftPanel && activeEl === leftPanel && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
                e.preventDefault();
                leftPanel.scrollBy({ top: isForward ? 140 : -140, behavior: 'smooth' });
                return;
            }

            // Scroll active panel if body is focused
            if ((!activeEl || activeEl === document.body) && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
                e.preventDefault();
                if (activeScrollTarget) {
                    activeScrollTarget.scrollBy({ top: isForward ? 140 : -140, behavior: 'smooth' });
                }
                return;
            }

            // FORWARD SEQUENCING
            if (isForward) {
                if (activeEl === skipLink && topCount > 0) {
                    e.preventDefault();
                    topHeaderElements[0].focus();
                    return;
                }
                if (topCount > 0 && activeEl === topHeaderElements[topCount - 1] && mainCount > 0) {
                    e.preventDefault();
                    mainElements[0].focus();
                    return;
                }
                // Wrap around at the end of all projects
                if (mainCount > 0 && activeEl === mainElements[mainCount - 1]) {
                    e.preventDefault();
                    if (skipLink) {
                        skipLink.focus();
                    } else if (topCount > 0) {
                        topHeaderElements[0].focus();
                    }
                    return;
                }
            }

            // BACKWARD SEQUENCING
            if (!isForward) {
                if (activeEl === skipLink && mainCount > 0) {
                    e.preventDefault();
                    mainElements[mainCount - 1].focus();
                    return;
                }
                if (topCount > 0 && activeEl === topHeaderElements[0] && skipLink) {
                    e.preventDefault();
                    skipLink.focus();
                    return;
                }
                if (mainCount > 0 && activeEl === mainElements[0] && topCount > 0) {
                    e.preventDefault();
                    topHeaderElements[topCount - 1].focus();
                    return;
                }
            }
        }

        // Hotkeys (T, L, C, F, 1-3)
        if (key === 't') toggleTheme();
        if (key === 'l') {
            const currentLang = document.documentElement.lang;
            setLanguage(currentLang === 'sv' ? 'en' : 'sv');
        }
        if (key === 'c') {
            e.preventDefault();
            openModal();
        }
        if (key === 'f') {
            currentFontIndex = (currentFontIndex + 1) % fontTypes.length;
            const fontName = fontTypes[currentFontIndex];
            const fontBtn = qs(`.font-btn[data-font="${fontName}"]`);
            if (fontBtn) fontBtn.click();
        }
        if (/^[1-3]$/.test(key)) {
            const visibleCards = qsa('.app-card').filter(card => card.style.display !== 'none');
            const targetIndex = parseInt(key, 10) - 1;
            if (targetIndex >= 0 && targetIndex < visibleCards.length) {
                const targetCard = visibleCards[targetIndex];
                const link = targetCard.querySelector<HTMLAnchorElement>('a.btn-primary[href]');
                if (link && link.href.length > 0) {
                    window.open(link.href, '_blank', 'noopener,noreferrer');
                }
            }
        }
    });

    // Hantera Skip-länk och "Top"-länk för både mobil och interna paneler
    const mainContent = qs('#main-content');
    const scrollLinks = qsa('a[href="#main-content"]');

    scrollLinks.forEach(link => {
        on(link, 'click', (e: MouseEvent) => {
            e.preventDefault();

            // 1. Om vi är på dator: skrolla upp panelerna
            if (window.innerWidth > 1150) {
                leftPanel?.scrollTo({ top: 0, behavior: 'smooth' });
                rightPanel?.scrollTo({ top: 0, behavior: 'smooth' });
            } else {
                // 2. På mobil: skrolla hela fönstret till toppen
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }

            // Flytta tangentbordsfokus till huvudinnehållet
            if (mainContent) {
                mainContent.focus({ preventScroll: true });
            }
        });
    });
}
