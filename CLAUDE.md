# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

MoradIA is a front-end prototype (Portuguese, pt-BR) of a city-recommendation product: users complete an 8-step onboarding (profile, budget, location, work, lifestyle, safety, climate, priorities) and get a ranked list of Brazilian cities with a compatibility score, city detail pages with a monthly cost simulator, and side-by-side comparison of 2–3 cities. The **Figma prototype is the source of truth** for UI and flow (see README.md for the full product flow: Landing → Onboarding → Processing → Results → City details → Comparison).

Currently only the Login screen is implemented; there is no backend, routing, or real data yet.

## Commands

- `npm run dev` — Vite dev server
- `npm run build` — production build to `dist/`
- `npm run lint` — ESLint (flat config: recommended + react-hooks + react-refresh)
- `npm run preview` — serve the built app
- `npm test` — Vitest (testes de lógica pura em `src/**/*.test.js`)

## Architecture & conventions

- React 19 + Vite, plain JavaScript (`.jsx`), no TypeScript, no router.
- `src/main.jsx` mounts `App`, which currently renders `Login` directly.
- Components live in `src/componentes/<Nome>/index.jsx` (folder is `componentes`, Portuguese spelling).
- Styling uses **styled-components**, defined in the same file as the component. Transient props use the `$` prefix (e.g. `$destaque`, `$valor`) so they aren't forwarded to the DOM.
- Identifiers, component names, and UI copy are written in Portuguese (e.g. `CartaoAnalise`, `BotaoSocial`, `cidadesExemplo`) — follow that convention.
- Global design tokens are CSS variables in `src/index.css`: `--roxo-moradia` (#4F46E5, brand purple) and `--fonte-moradia` (Inter). The rest of the palette is Tailwind-like hex values (indigo/gray) hardcoded in styled components.
- Icons come from `react-icons` (Font Awesome set, `react-icons/fa`); images/SVGs are imported from `src/assets/`.

## Design system

The visual identity reference is the Figma **Landing Page** (node `5:8`). Its tokens (colors, type scale, spacing, radii) and component patterns are documented in `docs/design-system.md` — read it before building any new screen and reuse those values. New screens use Feather icons (`react-icons/fi`) to match the Figma.
