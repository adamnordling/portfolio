import { initTheme } from './core/theme';
import { initI18n } from './core/i18n';
import { initShortcuts } from './core/shortcuts';
import { initPerformanceMonitoring } from './utils/dom';
import { initCanvasBackground } from './features/canvas-bg';
import { initCardTilt } from './features/tilt';
import { initModal } from './features/modal';
import { initProjectFilter } from './features/filter';
import { initSkillsAndBio } from './features/skills';
import { initClipboard } from './features/clipboard';
import { loadGitHubActivity } from './services/github';

document.addEventListener('DOMContentLoaded', () => {
    // 1. Critical visual setup
    initTheme();
    initI18n();
    initSkillsAndBio();
    initProjectFilter();
    initModal();
    initProfileCardMenu();

    // 2. Schedule secondary background widgets in an idle slice to prevent long-task TBT
    const scheduleSecondary = (cb: () => void): void => {
        if ('requestIdleCallback' in window) {
            window.requestIdleCallback(cb, { timeout: 1500 });
        } else {
            setTimeout(cb, 100);
        }
    };

    scheduleSecondary(() => {
        document.querySelectorAll('.footer-year').forEach(el => {
            el.textContent = String(new Date().getFullYear());
        });
        initCanvasBackground();
        initCardTilt();
        initClipboard();
        initShortcuts();
        initZoneScrolling();
        initMobileMarqueeTelemetry();
        initPerformanceMonitoring();
    });

    // Toggles the smooth top-edge gradient mask when panels scroll down
    const scrollPanels = document.querySelectorAll<HTMLElement>('.left-panel, .right-panel');
    scrollPanels.forEach(panel => {
        panel.addEventListener(
            'scroll',
            () => {
                panel.classList.toggle('is-scrolled-top', panel.scrollTop > 8);
            },
            { passive: true }
        );
    });

    initLazyGitHubActivity();

    if ('serviceWorker' in navigator) {
        navigator.serviceWorker
            .getRegistrations()
            .then(regs => {
                for (const r of regs) {
                    void r.unregister();
                }
            })
            .catch(() => {});
    }
});

function initProfileCardMenu(): void {
    const cardTrigger = document.getElementById('profile-card-trigger');
    const copyBtn = document.getElementById('copy-img-link-btn');
    const copyText = document.getElementById('copy-img-text');
    if (!cardTrigger) return;

    const toggleMenu = (open?: boolean): void => {
        const isOpen = open !== undefined ? open : !cardTrigger.classList.contains('profile-menu-open');
        cardTrigger.classList.toggle('profile-menu-open', isOpen);
        cardTrigger.setAttribute('aria-expanded', String(isOpen));

        if (isOpen) {
            const firstItem = cardTrigger.querySelector<HTMLElement>('.profile-menu-item');
            firstItem?.focus();
        }
    };

    // 1. Enter / Space key on PC
    cardTrigger.addEventListener('keydown', (e: KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ' ') {
            if (e.target === cardTrigger) {
                e.preventDefault();
                toggleMenu();
            }
        }
    });

    // 2. Right-click on PC
    cardTrigger.addEventListener('contextmenu', (e: MouseEvent) => {
        e.preventDefault();
        toggleMenu(true);
    });

    // 3. Left-click on PC & Touch tap on Mobile
    cardTrigger.addEventListener('click', (e: MouseEvent) => {
        // If clicking an action item inside the menu, let the action run (do not close prematurely)
        if ((e.target as HTMLElement).closest('.profile-menu-item')) return;
        toggleMenu();
    });

    // 4. Click outside to dismiss
    document.addEventListener('click', (e: MouseEvent) => {
        if (!cardTrigger.contains(e.target as Node)) {
            toggleMenu(false);
        }
    });

    // 5. Dismiss menu ONLY when Tab navigates away to another element on the page
    cardTrigger.addEventListener('focusout', (e: FocusEvent) => {
        // e.relatedTarget is only present when moving to another element on the page.
        // If you switch browser tabs or open in a new tab, relatedTarget is null, so it does NOT close or trap focus!
        if (e.relatedTarget && !cardTrigger.contains(e.relatedTarget as Node)) {
            toggleMenu(false);
        }
    });

    // 6. Copy High-Res Link Action (profile-600.webp)
    if (copyBtn && copyText) {
        copyBtn.addEventListener('click', e => {
            e.stopPropagation();
            const imgUrl = `${window.location.origin}/assets/profile-600.webp`;
            void navigator.clipboard.writeText(imgUrl).then(() => {
                copyText.textContent = 'Copied!';
                setTimeout(() => {
                    copyText.textContent = 'Copy image link';
                }, 1200);
            });
        });
    }
}

function initLazyGitHubActivity(): void {
    const activityFeed = document.getElementById('activity-feed');
    if (!activityFeed) return;

    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver(
            entries => {
                if (entries[0].isIntersecting) {
                    observer.disconnect();
                    void loadGitHubActivity();
                }
            },
            { rootMargin: '300px' }
        );
        observer.observe(activityFeed);
    } else {
        setTimeout(() => {
            void loadGitHubActivity();
        }, 3000);
    }
}

interface MetricInfo {
    title: { en: string; sv: string };
    desc: { en: string; sv: string };
}

function initMobileMarqueeTelemetry(): void {
    const rawViewport = document.getElementById('mobile-marquee-viewport');
    const rawTrack = document.getElementById('mobile-marquee-track');
    const rawCard = document.getElementById('m-inspector-card');
    const rawTitle = document.getElementById('m-inspector-title');
    const rawDesc = document.getElementById('m-inspector-desc');
    const rawCloseBtn = document.getElementById('m-inspector-close');
    const mobilePills = document.querySelectorAll<HTMLElement>('.mobile-telemetry-dock .m-pill');

    const MARQUEE_DURATION = 22;
    let currentTrackX = 0;
    let activeMetricKey: string | null = null;
    let resumeTimeout: ReturnType<typeof setTimeout> | null = null;

    const metricData: Record<string, MetricInfo> = {
        lh: {
            title: { en: 'Lighthouse 4×100', sv: 'Lighthouse 4×100' },
            desc: {
                en: 'Verified perfect 100/100/100/100 score across Performance, Accessibility, Best Practices, and SEO.',
                sv: 'Verifierade perfekta 100/100/100/100 poäng inom Prestanda, Tillgänglighet, Bästa praxis och SEO.'
            }
        },
        lcp: {
            title: { en: 'Largest Contentful Paint', sv: 'Largest Contentful Paint' },
            desc: {
                en: 'Measures perceived page load speed in real-time via PerformanceObserver API. Sub-200ms target.',
                sv: 'Mäter faktisk laddningshastighet i realtid via PerformanceObserver API. Målvärde under 200ms.'
            }
        },
        cls: {
            title: { en: 'Cumulative Layout Shift', sv: 'Cumulative Layout Shift' },
            desc: {
                en: 'Real-time visual stability score. 0.000 verifies zero layout shift or jumping content during render.',
                sv: 'Visuell layoutstabilitet i realtid. 0.000 bekräftar noll layout-ryck eller hoppande text.'
            }
        },
        runtime: {
            title: { en: 'Vite 8 · ESNext', sv: 'Vite 8 · ESNext' },
            desc: {
                en: 'Compiled directly to native ECMAScript modules with zero client framework overhead (no React/Vue weight).',
                sv: 'Kompilerat direkt till webbläsarens native ES-moduler helt utan tunga ramverk som React eller Vue.'
            }
        },
        ts: {
            title: { en: 'TypeScript Strict', sv: 'TypeScript Strict' },
            desc: {
                en: 'Built with strictNullChecks, noImplicitAny, and zero type bypasses for strict runtime reliability.',
                sv: 'Utvecklat med strictNullChecks, noImplicitAny och noll typfusk för maximal kodstabilitet.'
            }
        },
        layer: {
            title: { en: 'CSS @layer Architecture', sv: 'CSS @layer Arkitektur' },
            desc: {
                en: 'Architectural cascade layer organization (reset, base, components, utilities) eliminating specificity clashes.',
                sv: 'Kaskad-lager (reset, base, components, utilities) som eliminerar CSS-konflikter och minimerar filstorlek.'
            }
        }
    };

    // DESKTOP TELEMETRI INSPECT
    const dTrack = document.getElementById('d-telemetry-track');
    const dCard = document.getElementById('d-inspector-card');
    const dTitle = document.getElementById('d-inspector-title');
    const dDesc = document.getElementById('d-inspector-desc');
    const dClose = document.getElementById('d-inspector-close');
    const leftPanel = document.querySelector<HTMLElement>('.left-panel');

    const closeDesktopInspector = (): void => {
        if (!dCard || !dTrack) return;
        dCard.classList.remove('is-open');
        dTrack.classList.remove('is-paused');
        dTrack.querySelectorAll('.m-pill').forEach(p => {
            p.classList.remove('is-active');
        });
    };

    if (dTrack && dCard && dTitle && dDesc) {
        const desktopPills = dTrack.querySelectorAll<HTMLElement>('.m-pill, .telemetry-pill, .dock-lh-group');

        desktopPills.forEach(pill => {
            pill.addEventListener('click', e => {
                e.stopPropagation();
                const metricKey = pill.getAttribute('data-metric');
                if (!metricKey || !(metricKey in metricData)) return;

                const isAlreadyActive = pill.classList.contains('is-active');
                if (isAlreadyActive) {
                    closeDesktopInspector();
                    return;
                }

                dTrack.classList.add('is-paused');
                desktopPills.forEach(p => {
                    p.classList.remove('is-active');
                });
                dTrack.querySelectorAll(`[data-metric="${metricKey}"]`).forEach(p => {
                    p.classList.add('is-active');
                });

                const currentLang = document.documentElement.lang === 'sv' ? 'sv' : 'en';
                dTitle.textContent = metricData[metricKey].title[currentLang];
                dDesc.textContent = metricData[metricKey].desc[currentLang];
                dCard.classList.add('is-open');

                // Förhindra att vänsterpanelen hoppar uppåt när kortet expanderar
                if (leftPanel) {
                    requestAnimationFrame(() => {
                        leftPanel.scrollTo({ top: leftPanel.scrollHeight, behavior: 'smooth' });
                    });
                }
            });
        });

        dClose?.addEventListener('click', e => {
            e.stopPropagation();
            closeDesktopInspector();
        });

        dCard.addEventListener('click', e => {
            e.stopPropagation();
            closeDesktopInspector();
        });
    }

    // MOBIL TELEMETRI LOGIK
    if (!rawViewport || !rawTrack || !rawCard || !rawTitle || !rawDesc || !rawCloseBtn) return;

    const viewport: HTMLElement = rawViewport;
    const track: HTMLElement = rawTrack;
    const inspectorCard: HTMLElement = rawCard;
    const inspectorTitle: HTMLElement = rawTitle;
    const inspectorDesc: HTMLElement = rawDesc;
    const closeBtn: HTMLElement = rawCloseBtn;

    track.classList.add('is-running');

    function getTrackTranslateX(): number {
        const style = window.getComputedStyle(track);
        const transform = style.transform;
        if (!transform || transform === 'none') return 0;
        try {
            const matrix = new DOMMatrix(transform);
            return matrix.m41;
        } catch {
            const match = /matrix\([^,]+,[^,]+,[^,]+,[^,]+,\s*([^,]+)/.exec(transform);
            return match ? parseFloat(match[1]) : 0;
        }
    }

    function resumeRolling(atX: number): void {
        const halfWidth = track.scrollWidth / 2;
        if (halfWidth <= 0) return;

        let normalizedX = atX;
        while (normalizedX > 0) normalizedX -= halfWidth;
        while (normalizedX < -halfWidth) normalizedX += halfWidth;
        currentTrackX = normalizedX;

        const progress = Math.abs(normalizedX) / halfWidth;
        const elapsed = progress * MARQUEE_DURATION;

        track.classList.remove('is-paused');
        track.style.animation = `marquee-roll ${MARQUEE_DURATION.toString()}s linear infinite`;
        track.style.animationDelay = `-${elapsed.toFixed(3)}s`;
        track.style.transform = '';
    }

    function freezeRolling(): void {
        currentTrackX = getTrackTranslateX();
        track.style.animation = 'none';
        track.style.transform = `translateX(${currentTrackX.toFixed(2)}px)`;
        track.classList.add('is-paused');
    }

    function closeInspector(): void {
        activeMetricKey = null;
        inspectorCard.classList.remove('is-open');
        mobilePills.forEach(p => {
            p.classList.remove('is-active');
        });

        if (track.style.animation === 'none') {
            resumeRolling(currentTrackX);
        } else {
            track.classList.remove('is-paused');
        }
    }

    function scheduleResume(): void {
        if (resumeTimeout) clearTimeout(resumeTimeout);
        resumeTimeout = setTimeout(() => {
            if (!activeMetricKey && !inspectorCard.classList.contains('is-open')) {
                resumeRolling(currentTrackX);
            }
        }, 1000);
    }

    let isPointerDown = false;
    let isDragging = false;
    let justSwiped = false;
    let startX = 0;
    let startY = 0;
    let dragStartX = 0;

    viewport.addEventListener('pointerdown', (e: PointerEvent) => {
        if (resumeTimeout) clearTimeout(resumeTimeout);
        isPointerDown = true;
        isDragging = false;
        startX = e.clientX;
        startY = e.clientY;
        freezeRolling();
        dragStartX = currentTrackX;
    });

    window.addEventListener('pointermove', (e: PointerEvent) => {
        if (!isPointerDown) return;

        const deltaX = e.clientX - startX;
        const deltaY = e.clientY - startY;

        if (!isDragging) {
            if (Math.abs(deltaX) > 5 && Math.abs(deltaX) > Math.abs(deltaY)) {
                isDragging = true;
                viewport.classList.add('is-dragging');
                try {
                    track.setPointerCapture(e.pointerId);
                } catch {
                    // Ignorerat
                }
            } else if (Math.abs(deltaY) > 5) {
                isPointerDown = false;
                scheduleResume();
                return;
            }
        }

        if (isDragging) {
            const halfWidth = track.scrollWidth / 2;
            if (halfWidth > 0) {
                let nextX = dragStartX + deltaX;
                while (nextX > 0) nextX -= halfWidth;
                while (nextX < -halfWidth) nextX += halfWidth;
                currentTrackX = nextX;
                track.style.transform = `translateX(${currentTrackX.toFixed(2)}px)`;
            }
        }
    });

    const onPointerUp = (e: PointerEvent): void => {
        if (!isPointerDown) return;
        isPointerDown = false;
        viewport.classList.remove('is-dragging');

        if (isDragging) {
            isDragging = false;
            justSwiped = true;
            setTimeout(() => {
                justSwiped = false;
            }, 60);

            try {
                if (track.hasPointerCapture(e.pointerId)) {
                    track.releasePointerCapture(e.pointerId);
                }
            } catch {
                // Ignorerat
            }
        }

        scheduleResume();
    };

    window.addEventListener('pointerup', onPointerUp);
    window.addEventListener('pointercancel', onPointerUp);

    mobilePills.forEach(pill => {
        pill.addEventListener('click', e => {
            e.stopPropagation();
            pill.blur();

            if (justSwiped) return;

            const metricKey = pill.getAttribute('data-metric');
            if (!metricKey || !(metricKey in metricData)) return;

            const isAlreadyActive = pill.classList.contains('is-active');
            if (isAlreadyActive) {
                closeInspector();
                return;
            }

            if (resumeTimeout) clearTimeout(resumeTimeout);
            freezeRolling();

            activeMetricKey = metricKey;
            mobilePills.forEach(p => {
                p.classList.remove('is-active');
            });
            document.querySelectorAll<HTMLElement>(`.mobile-telemetry-dock [data-metric="${metricKey}"]`).forEach(p => {
                p.classList.add('is-active');
            });

            const currentLang = document.documentElement.lang === 'sv' ? 'sv' : 'en';
            const data = metricData[metricKey];
            inspectorTitle.textContent = data.title[currentLang];
            inspectorDesc.textContent = data.desc[currentLang];
            inspectorCard.classList.add('is-open');
        });
    });

    inspectorCard.addEventListener('click', e => {
        e.stopPropagation();
        closeInspector();
    });

    closeBtn.addEventListener('click', e => {
        e.stopPropagation();
        closeInspector();
    });

    // KLICK UTANFÖR STÄNGER BÅDE MOBIL- OCH DESKTOP-INSPEKTÖREN
    document.addEventListener('click', e => {
        const target = e.target as HTMLElement | null;
        if (!target) return;

        // Mobil
        if (!target.closest('.mobile-telemetry-dock .m-pill, .m-inspector-card')) {
            if (inspectorCard.classList.contains('is-open')) {
                closeInspector();
            }
        }

        // Desktop
        if (
            !target.closest('#desktop-telemetry-viewport .m-pill, #d-telemetry-track .m-pill, .desktop-inspector-card')
        ) {
            if (dCard && dCard.classList.contains('is-open')) {
                closeDesktopInspector();
            }
        }
    });

    window.addEventListener('site:languagechange', (e: Event) => {
        const custom = e as CustomEvent<{ lang: 'en' | 'sv' }>;
        const lang = custom.detail.lang;
        if (activeMetricKey !== null) {
            const data = metricData[activeMetricKey];
            inspectorTitle.textContent = data.title[lang];
            inspectorDesc.textContent = data.desc[lang];

            if (dTitle && dDesc) {
                dTitle.textContent = data.title[lang];
                dDesc.textContent = data.desc[lang];
            }
        }
    });
}

function initZoneScrolling(): void {
    const leftPanel = document.querySelector<HTMLElement>('.left-panel');
    const rightPanel = document.querySelector<HTMLElement>('.right-panel');
    const divider = document.querySelector<HTMLElement>('.panel-divider');
    if (!leftPanel || !rightPanel) return;

    let cachedDividerX = 0;
    const updateDividerX = (): void => {
        cachedDividerX = divider
            ? divider.getBoundingClientRect().left + divider.offsetWidth / 2
            : window.innerWidth / 2;
    };
    updateDividerX();
    window.addEventListener('resize', updateDividerX, { passive: true });

    window.addEventListener(
        'wheel',
        (e: WheelEvent) => {
            if (window.innerWidth <= 1250) return;

            // 1. Never scroll background if CV Modal is open
            if (document.getElementById('cv-modal')?.classList.contains('is-open')) return;

            // 2. Ignore horizontal swipes or micro-jitter on trackpads
            if (Math.abs(e.deltaY) <= Math.abs(e.deltaX) || Math.abs(e.deltaY) < 1) return;

            const target = e.target as HTMLElement | null;
            const isInsideLeft = !!target?.closest('.left-panel');
            const isInsideRight = !!target?.closest('.right-panel');

            // 3. Only forward wheel events if cursor is outside both panels (gutter / margins)
            if (!isInsideLeft && !isInsideRight) {
                const targetPanel = e.clientX < cachedDividerX ? leftPanel : rightPanel;
                targetPanel.scrollBy({ top: e.deltaY, behavior: 'auto' });
            }
        },
        { passive: true }
    );
}
