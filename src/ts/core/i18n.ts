import { qs, qsa, on } from '../utils/dom';

export type Language = 'en' | 'sv';

export function initI18n(): void {
    const langDropdown = qs('#lang-dropdown-wrapper');
    const langButtons = qsa('.lang-btn');

    langButtons.forEach(btn => {
        on(btn, 'click', (e: MouseEvent) => {
            e.stopPropagation();
            const lang = btn.getAttribute('data-lang') as Language | null;
            if (lang) {
                setLanguage(lang);
                langDropdown?.classList.remove('menu-open');
                qs('#lang-trigger-btn')?.setAttribute('aria-expanded', 'false');
            }
        });
    });

    const targetLang = getInitialLanguage();
    setLanguage(targetLang);

    initDropdownInteractions();
}

export function setLanguage(lang: Language): void {
    document.documentElement.lang = lang;
    localStorage.setItem('site_lang', lang);

    const langButtons = qsa('.lang-btn');
    langButtons.forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-lang') === lang);
    });

    window.dispatchEvent(new CustomEvent('site:languagechange', { detail: { lang } }));
}

function getInitialLanguage(): Language {
    const urlParam = new URLSearchParams(window.location.search).get('lang')?.toLowerCase();
    if (urlParam === 'en' || urlParam === 'sv') {
        localStorage.setItem('site_lang', urlParam);
        return urlParam;
    }

    const saved = localStorage.getItem('site_lang') as Language | null;
    if (saved === 'en' || saved === 'sv') return saved;

    const browserLangs = navigator.languages.length > 0 ? navigator.languages : [navigator.language];
    const isSwedish = browserLangs.some(l => l.toLowerCase().startsWith('sv'));
    return isSwedish ? 'sv' : 'en';
}

function initDropdownInteractions(): void {
    const langTrigger = qs('#lang-trigger-btn');
    const langDropdown = qs('#lang-dropdown-wrapper');

    if (langTrigger && langDropdown) {
        on(langTrigger, 'click', (e: MouseEvent) => {
            e.stopPropagation();
            const isOpen = langDropdown.classList.toggle('menu-open');
            langTrigger.setAttribute('aria-expanded', String(isOpen));
        });
    }

    const filterTrigger = qs('#active-filter-label');
    const filterDropdown = qs('#projects-filter');

    if (filterTrigger && filterDropdown) {
        on(filterTrigger, 'click', (e: MouseEvent) => {
            e.stopPropagation();
            const isOpen = filterDropdown.classList.toggle('menu-open');
            filterTrigger.setAttribute('aria-expanded', String(isOpen));
        });
    }

    on(document, 'click', () => {
        qsa('.menu-open').forEach(el => {
            el.classList.remove('menu-open');
            el.querySelector('[aria-expanded]')?.setAttribute('aria-expanded', 'false');
        });
    });
}
