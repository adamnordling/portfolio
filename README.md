<div align="center">

# Adam Nordling — Portfolio

[![CI/CD Pipeline](https://github.com/adamnordling/adamnordling.github.io/actions/workflows/pipeline.yml/badge.svg)](https://github.com/adamnordling/adamnordling.github.io/actions/workflows/pipeline.yml)
[![Lighthouse 100/100](https://img.shields.io/badge/Lighthouse-100%2F100-success?style=flat&logo=lighthouse)](https://adamnordling.se/)
[![BeaverCheck](https://beavercheck.com/badge?url=https%3A%2F%2Fadamnordling.se)](https://beavercheck.com/sites/adamnordling.se)
[![TypeScript Strict](https://img.shields.io/badge/TypeScript-StrictTypeChecked-blue?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

<p align="center">
  <a href="https://adamnordling.se/"><b>Explore Live Portfolio ↗</b></a>
</p>

Production-grade, zero-runtime personal portfolio and application hub. Engineered for high performance, strict type
safety, zero layout shifts, and accessibility compliance. Built to showcase academic research in Software Technology and
production-level fullstack systems.


</div>

---

## Repository Structure

```text
|-- .github/workflows/   # Automated CI/CD pipelines and Lighthouse CI assertions
|-- public/              # Static assets, legal policies, web manifest, favicons, and _headers
|   |-- .well-known/     # RFC 9116 security contact definitions
|   |-- assets/          # Compressed WebP avatars, vector schematics, and resume PDF
|   |-- 404.html         # Custom zero-dependency error recovery fallback
|   |-- _headers         # Edge security policies (CSP Level 2, HSTS, Brotli/immutable caching)
|   |-- manifest.webmanifest # PWA specifications and homescreen icon configurations
|   |-- privacy.html     # GDPR Article 13 disclosures, accessibility statement, and terms
|   |-- robots.txt       # Crawler indexing guidelines
|   `-- sitemap.xml      # Search engine indexing graph
|-- src/
|   |-- styles/          # Modular CSS Cascade Layers architecture
|   |   |-- components/  # Isolated component rulesets (header, bio, education, skills, cards, marquee)
|   |   |-- layers.css   # @layer definitions enforcing explicit specificity hierarchies
|   |   |-- main.css     # Layer imports, responsive breakpoints, and print stylesheets
|   |   |-- reset.css    # Box model resets, typography normalization, and layout scaffolding
|   |   `-- variables.css# Design tokens, color palettes, and typography system
|   `-- ts/
|       |-- core/        # Theme engine, zero-latency i18n, clock, and focus/keyboard loop
|       |-- data/        # Bilingual course catalog and technical skill dictionaries
|       |-- features/    # Dot-matrix canvas, CV modal, live category filtering, and 3D card tilt
|       |-- services/    # Cached GitHub REST API integrations with localStorage rate-limit fallback
|       |-- utils/       # DOM traversal helpers, Web Vitals observers, and XSS sanitizers
|       `-- main.ts      # Main lifecycle orchestrator and idle-scheduled initializers
|-- index.html           # Minified entry point with preloaded LCP assets and Schema.org graph
|-- eslint.config.js     # Flat ESLint configuration with strict type-checked rules
|-- lighthouserc.json    # Lighthouse CI threshold assertions (100% across all 4 categories)
|-- package.json         # Development dependencies and validation scripts
|-- tsconfig.json        # Strict TypeScript compiler options (ES2022 target, bundler resolution)
`-- vite.config.ts       # Vite bundler pipeline with HTML and CSS inlining optimizations
```

## Architectural Principles

- Zero Client Framework Overhead: Built entirely with pure TypeScript compiled to native ECMAScript 2022 modules.
  Eliminates virtual DOM diffing, runtime hydration delays, and client-side framework bloat (0 KB React/Vue overhead).
- Verified 4x100 Performance Standards: Engineered to enforce perfect 100/100 metrics across Performance, Accessibility,
  Best Practices, and SEO on both Mobile and Desktop under automated Lighthouse CI and Core Web Vitals audits (0 ms TBT,
  0.000 CLS).
- Modern CSS Cascade Layers: Employs @layer reset, base, components, utilities to achieve deterministic specificity
  without preprocessor build dependencies. Uses native CSS gradient masks for smooth viewport edge fades on active
  scroll.
- Unified Responsive Command Controls: Adaptive navigation system featuring an elevated floating island on desktop that
  refactors into a native sticky header on mobile screens. Includes a continuous hardware-accelerated telemetry marquee
  dock that pauses on hover.
- Hardened Client-Side Privacy & Security: Zero third-party telemetry, tracking pixels, or analytics cookies. Contact
  links utilize in-memory obfuscated byte arrays to block crawler harvesting. Includes strict CSP Level 2 directives,
  HSTS preload compliance, and defensive DMARC/SPF configurations.
- Edge Delivery & Immutable Caching: Distributed via Cloudflare Pages edge CDN with HTTP/3 support, Brotli compression,
  ephemeral revalidation for HTML, and full 1-year immutable caching for static hashed assets.

---

## Tech Stack

- **Language:** TypeScript 5.8+ (Strict mode: `noImplicitAny`, `strictNullChecks`, `noUnusedLocals`)
- **Build Tool:** Vite 8 (Custom post-build HTML/CSS inlining and minification plugin)
- **Styling Architecture:** Native CSS3 with CSS Cascade Layers (`@layer`), CSS Custom Properties, and View Transitions
- **Runtime Target:** ECMAScript 2022 (ESNext)
- **Code Quality:** ESLint 10 (`typescript-eslint` strict type checked), Prettier
- **Continuous Integration:** GitHub Actions running typechecking, zero-warning lint assertions, production bundling,
  and Lighthouse CI threshold assertions
- **Hosting & Infrastructure:** Cloudflare Pages with custom edge headers (`_headers`) and DNS managed under DNSSEC

---

## Development and Verification

### Prerequisites

- Node.js (Version 20 LTS or higher recommended)
- npm (Version 10 or higher)

### Setup

```bash
# Clone the repository
git clone https://github.com/adamnordling/portfolio.git

# Navigate into project directory
cd portfolio

# Install pinned development dependencies
npm install
```

## Local Development

```bash
# Start local development server with hot module replacement
npm run dev

# Preview the production build locally
npm run preview
```

## Quality Assurance and Build Verification

```bash
# Run type checking, linting, and formatting verification
npm run validate

# Automatically fix linting and formatting issues
npm run fix

# Compile production bundle to /dist
npm run build
```

language - more languages?

Projects > hover the project to see a 10 sec video?

copy as markdown or view (dropout window): https://i.imgur.com/DvnI8Re.png
