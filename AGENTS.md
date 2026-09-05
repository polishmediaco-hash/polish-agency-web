# POLISH Media Co — Agent Guidelines & Context

## Project Overview
POLISH Media Co (`polishmediaco.com`) is a trilingual (English, French, Arabic) high-ticket luxury growth agency and creative accelerator for beauty and cosmetics brands.

## Tech Stack & Architecture
- **Frontend**: Pure modern CSS3 + Vanilla JavaScript (zero bundler overhead, instant FCP < 0.4s).
- **Backend**: Node.js + Express (`server/index.js`).
- **Data Layer**: File-based atomic JSON storage for inbound brand dossiers and CMS copy.
- **Styling**: Luxury glassmorphism, beveled specular borders, responsive kinetic typography.
- **Brand Palette (Direction 1 - Haute Atelier Champagne Gold)**:
  - `--brand-gold`: `#E2C799`
  - `--brand-blue`: `#C5A880` (Bronze)
  - `--brand-platinum`: `#F5E6D3`
  - `--bg`: `#080706` (Deep Obsidian Noir)
- **Logos & Assets**: Use `/assets/logo-gold.png` or `/assets/logo-gold.svg`, favicon at `/assets/favicon.svg`. Never revert to old cyan colors.

## Key Files
- `public/index.html`: Main landing page (trilingual + 3D floating cosmetics + dynamic island header).
- `public/apply.html`: 3-step high-ticket partnership application funnel.
- `public/creators.html`: Creator/UGC talent partnership application.
- `public/admin.html`: Executive Hub & Live CMS portal.
- `public/css/style.css`: Global design tokens, animations, and responsive utilities.
- `server/index.js`: API endpoints (`/api/apply`, `/api/leads`, `/api/cms`).
- `docs/HANDOFF.md`: Detailed session history, architecture notes, and roadmap.

## Workflow Rules for Agents
1. Before starting large refactors or features, inspect `docs/HANDOFF.md`.
2. Do not introduce bloated JavaScript frameworks or large npm dependencies to the frontend. Keep it pure, ultra-fast vanilla JS and modular CSS.
3. Respect trilingual DOM architecture (all copy keys must exist in EN, FR, and AR dictionaries).
