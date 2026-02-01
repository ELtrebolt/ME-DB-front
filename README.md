# ME-DB Frontend

Single-page application for managing personal media collections (movies, TV, games, anime). Users can add items, tag and tier them, view stats, and share lists. Includes a landing site and a demo mode that runs without a backend.

**Live:** [me-db.onrender.com](https://me-db.onrender.com)

---

## Table of Contents

- [Highlights](#highlights)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Run Locally](#run-locally)
- [Credits](#credits)

---

## Highlights

- **Landing vs app vs demo:** Clear separation of public marketing, authenticated app, and backend-free demo.
- **Reusable UI:** Shared components under `app/components/ui`, modals, filters, and stats charts.
- **Theming:** Central `styling/theme.js` driving CSS variables for layout and colors.
- **Demo mode:** Full list/detail/create/stats flow using static JSON; useful for portfolios and testing without API.

---

## Tech Stack

| Area | Choices |
|------|--------|
| Framework | React 18 (Create React App) |
| Routing | React Router v6 |
| UI | Bootstrap 5, custom theme (CSS variables) |
| Data viz | Chart.js + react-chartjs-2 |
| Drag & drop | @dnd-kit (sortable lists) |
| HTTP | Axios (with credentials) |
| Icons | Font Awesome |

---

## Project Structure

```
src/
├── app/           # Authenticated app: list, details, create, stats, profile, friends, shared views
├── landing/       # Public pages: intro, about, privacy, terms
├── demo/          # Demo mode: same flows with local JSON data (no backend)
└── styling/       # Global CSS, theme (colors, card layout)
```

---

## Run Locally

**Prerequisites:** Node 20.x

```bash
npm install
npm start
```

Runs at [http://localhost:3000](http://localhost:3000). For full features (auth, persistence), the backend must be running and configured (see repo root or backend README).

**Other commands:** `npm run build` (production build), `npm test` (Jest + React Testing Library).

---

## Credits

- **Favicon:** Emoji graphic from [Twemoji](https://github.com/twitter/twemoji) by Twitter, Inc. and contributors. Used under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).
- **Icons:** [Font Awesome](https://fontawesome.com/) (Free).
